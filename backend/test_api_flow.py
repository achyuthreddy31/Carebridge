from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_patient_otp_login_and_dashboard():
    # 1. Send OTP
    send_res = client.post("/api/auth/send-otp", json={"phone": "9876543210"})
    assert send_res.status_code == 200
    demo_otp = send_res.json()["demo_otp"]

    # 2. Verify OTP
    verify_res = client.post("/api/auth/verify-otp", json={"phone": "9876543210", "otp": demo_otp})
    assert verify_res.status_code == 200
    token = verify_res.json()["access_token"]
    assert token is not None

    # 3. Patient Dashboard
    headers = {"Authorization": f"Bearer {token}"}
    dash_res = client.get("/api/patients/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["name"] == "Arjun Mehta"
    assert "total_reports" in dash_data
    assert "has_active_share" in dash_data

def test_doctor_login_and_patient_access():
    # 1. Patient creates fresh 6-digit access code
    p_auth = client.post("/api/auth/verify-otp", json={"phone": "9876543210", "otp": "123456"})
    p_token = p_auth.json()["access_token"]
    p_headers = {"Authorization": f"Bearer {p_token}"}
    
    create_token_res = client.post("/api/access-tokens", json={"scope": ["visit_summary", "recent_reports", "lab_data"], "expiry_minutes": 15}, headers=p_headers)
    assert create_token_res.status_code == 200
    fresh_code = create_token_res.json()["code"]
    assert len(fresh_code) == 6

    # 2. Doctor Login
    doc_login = client.post("/api/auth/login", json={
        "email": "doctor@curasync.com",
        "password": "Doctor@123"
    })
    assert doc_login.status_code == 200
    doc_token = doc_login.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # 3. Doctor enters patient's 6-digit access code
    access_res = client.post(
        "/api/access/validate",
        json={"otp_code": fresh_code},
        headers=doc_headers
    )
    assert access_res.status_code == 200
    access_data = access_res.json()
    token_id = access_data["token_id"]
    assert access_data["patient_name"] == "Arjun Mehta"

    # 4. Read Visit Summary
    summary_res = client.get(f"/api/access/patient/{token_id}/summary", headers=doc_headers)
    assert summary_res.status_code == 200
    assert summary_res.json()["read_only"] is True

def test_access_history_logged():
    # Patient checks access history
    verify_res = client.post("/api/auth/verify-otp", json={"phone": "9876543210", "otp": "123456"})
    token = verify_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    history_res = client.get("/api/audit/access-history", headers=headers)
    assert history_res.status_code == 200
    logs = history_res.json()
    assert len(logs) > 0
    assert logs[0]["doctor_name"] is not None

def test_invalid_otp_access_rejected():
    doc_login = client.post("/api/auth/login", json={
        "email": "doctor@curasync.com",
        "password": "Doctor@123"
    })
    doc_token = doc_login.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    bad_res = client.post("/api/access/validate", json={"otp_code": "000000"}, headers=doc_headers)
    assert bad_res.status_code == 404

def test_red_flag_screening():
    # Patient starts new visit and reports acute chest pain
    verify_res = client.post("/api/auth/verify-otp", json={"phone": "9876543210", "otp": "123456"})
    token = verify_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    visit_res = client.post("/api/visits", json={"title": "Emergency Chest Symptom Check"}, headers=headers)
    assert visit_res.status_code == 200
    visit_id = visit_res.json()["id"]

    # Send acute message
    msg_res = client.post(
        f"/api/visits/{visit_id}/messages",
        json={"content": "I have sudden severe crushing chest pain and shortness of breath"},
        headers=headers
    )
    assert msg_res.status_code == 200

    # Retrieve visit detail and confirm red flag detected
    detail_res = client.get(f"/api/visits/{visit_id}", headers=headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["has_red_flags"] is True
    assert len(detail_data["red_flags"]) > 0

def test_instant_revocation():
    # 1. Patient creates token
    p_auth = client.post("/api/auth/verify-otp", json={"phone": "9876543210", "otp": "123456"})
    p_token = p_auth.json()["access_token"]
    p_headers = {"Authorization": f"Bearer {p_token}"}

    create_res = client.post("/api/access-tokens", json={"scope": ["visit_summary"], "expiry_minutes": 15}, headers=p_headers)
    assert create_res.status_code == 200
    token_id = create_res.json()["id"]
    code = create_res.json()["code"]

    # 2. Doctor validates
    doc_login = client.post("/api/auth/login", json={"email": "doctor@curasync.com", "password": "Doctor@123"})
    doc_token = doc_login.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    doc_val = client.post("/api/access/validate", json={"otp_code": code}, headers=doc_headers)
    assert doc_val.status_code == 200

    # 3. Patient revokes token immediately
    revoke_res = client.post(f"/api/access-tokens/{token_id}/revoke", headers=p_headers)
    assert revoke_res.status_code == 200

    # 4. Doctor attempts to validate or read again -> must be rejected
    re_val = client.post("/api/access/validate", json={"otp_code": code}, headers=doc_headers)
    assert re_val.status_code in [400, 403, 404]

def test_admin_portal():
    # Admin logs in and checks system statistics and user governance
    admin_login = client.post("/api/auth/login", json={"email": "admin@curasync.com", "password": "Admin@123"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    stats_res = client.get("/api/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["system_status"] == "Operational"
    assert stats["total_patients"] >= 1
    assert stats["total_doctors"] >= 1

    users_res = client.get("/api/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 2

if __name__ == "__main__":
    import sys
    tests = [
        ("Health Endpoint", test_health),
        ("Patient OTP Login & Dashboard", test_patient_otp_login_and_dashboard),
        ("Doctor Login & 6-Digit OTP Patient Access", test_doctor_login_and_patient_access),
        ("Access History & Privacy Audit Trail", test_access_history_logged),
        ("Invalid OTP Access Rejection", test_invalid_otp_access_rejected),
        ("Red Flag Clinical Symptom Screening", test_red_flag_screening),
        ("Instant Doctor Access Revocation", test_instant_revocation),
        ("Admin Governance & Platform Metrics", test_admin_portal),
    ]

    print("\n" + "="*60)
    print("  CURASYNC SYSTEM VERIFICATION TEST SUITE (SIH 2026)")
    print("="*60)
    passed = 0
    failed = 0

    for name, fn in tests:
        try:
            fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            failed += 1

    print("="*60)
    print(f"  Results: {passed} passed, {failed} failed out of {len(tests)} tests")
    print("="*60 + "\n")

    if failed > 0:
        sys.exit(1)
