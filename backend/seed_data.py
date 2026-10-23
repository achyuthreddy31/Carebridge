import os
import sys
import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.report import Report, MedicalExtraction
from app.models.visit import Visit, ChatMessage
from app.models.access_token import AccessToken, AccessLog
from app.models.otp import OTPVerification
from app.utils.security import hash_password, hash_token

def seed_database():
    print("--- Initializing Curasync Database ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.phone == "9876543210").first():
            print("Database already contains demo records. Skipping seeding.")
            return

        print("Creating demo users...")

        # 1. Demo Patient: Arjun Mehta
        patient_user = User(
            name="Arjun Mehta",
            phone="9876543210",
            email="arjun.mehta@curasync.in",
            role="patient",
            language="en",
            is_active=True
        )
        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)

        patient_profile = Patient(
            user_id=patient_user.id,
            age=29,
            gender="Male",
            blood_group="O+",
            allergies=["Penicillin", "Dust Mites"],
            medications=["Metformin 500mg (OD)", "Vitamin D3"],
            chronic_conditions=["Mild Asthma", "Pre-diabetes"],
            emergency_contact_name="Sunita Mehta (Spouse)",
            emergency_contact_phone="9876543219",
            profile_completion=85
        )
        db.add(patient_profile)
        db.commit()
        db.refresh(patient_profile)

        # 2. Demo Doctor: Dr. Priya Sharma
        doctor_user = User(
            name="Dr. Priya Sharma",
            email="doctor@curasync.com",
            phone="9823456789",
            password_hash=hash_password("Doctor@123"),
            role="doctor",
            language="en",
            is_active=True
        )
        db.add(doctor_user)
        db.commit()
        db.refresh(doctor_user)

        doctor_profile = Doctor(
            user_id=doctor_user.id,
            clinic_name="Apollo Clinical Center, Bengaluru",
            specialty="Internal Medicine",
            registration_number="KMC-78249-IN"
        )
        db.add(doctor_profile)
        db.commit()
        db.refresh(doctor_profile)

        # 3. Demo Admin: Curasync System Admin
        admin_user = User(
            name="System Administrator",
            email="admin@curasync.com",
            password_hash=hash_password("Admin@123"),
            role="admin",
            language="en",
            is_active=True
        )
        db.add(admin_user)
        db.commit()

        # 4. Sample Medical Report & Extraction for Arjun Mehta
        sample_report = Report(
            patient_id=patient_profile.id,
            report_type="lab_report",
            title="Complete Blood Count & Metabolic Profile",
            original_filename="CBC_Metabolic_Profile_Aug2026.pdf",
            file_path="./uploads/sample_cbc_report.pdf",
            file_size=1024 * 340,
            mime_type="application/pdf",
            status="completed",
            ocr_text=(
                "METROPOLIS HEALTHCARE LAB REPORT\n"
                "Patient: Arjun Mehta | Age: 29 | Gender: M\n"
                "Investigation: Comprehensive Metabolic & Hemogram Panel\n"
                "Hemoglobin: 13.4 g/dL (Normal: 13.0 - 17.0)\n"
                "Total Leukocyte Count (WBC): 7,200 cells/mcL (Normal: 4,000 - 11,000)\n"
                "Platelet Count: 235,000 /mcL (Normal: 150,000 - 450,000)\n"
                "Fasting Blood Sugar: 98 mg/dL (Normal: 70 - 100)\n"
                "HbA1c: 5.6 % (Normal: < 5.7)\n"
                "Serum Creatinine: 0.9 mg/dL (Normal: 0.6 - 1.2)\n"
                "Total Cholesterol: 182 mg/dL (Normal: < 200)"
            ),
            report_date=datetime.datetime.utcnow() - datetime.timedelta(days=14),
            uploaded_at=datetime.datetime.utcnow() - datetime.timedelta(days=14),
            processed_at=datetime.datetime.utcnow() - datetime.timedelta(days=14)
        )
        db.add(sample_report)
        db.commit()
        db.refresh(sample_report)

        sample_extraction = MedicalExtraction(
            report_id=sample_report.id,
            extracted_data=[
                {"test_name": "Hemoglobin", "value": "13.4", "unit": "g/dL", "reference_range": "13.0 - 17.0", "status": "normal"},
                {"test_name": "WBC Count", "value": "7,200", "unit": "cells/mcL", "reference_range": "4,000 - 11,000", "status": "normal"},
                {"test_name": "Platelet Count", "value": "235,000", "unit": "/mcL", "reference_range": "150,000 - 450,000", "status": "normal"},
                {"test_name": "Fasting Blood Sugar", "value": "98", "unit": "mg/dL", "reference_range": "70 - 100", "status": "normal"},
                {"test_name": "HbA1c", "value": "5.6", "unit": "%", "reference_range": "< 5.7", "status": "normal"},
                {"test_name": "Serum Creatinine", "value": "0.9", "unit": "mg/dL", "reference_range": "0.6 - 1.2", "status": "normal"},
                {"test_name": "Total Cholesterol", "value": "182", "unit": "mg/dL", "reference_range": "< 200", "status": "normal"}
            ],
            summary="All 7 extracted clinical parameters fall within physiological normal thresholds.",
            model_used="Curasync-Clinical-NLP-v2",
            confidence=0.97
        )
        db.add(sample_extraction)
        db.commit()

        # 5. Sample Consultation Visit & AI Intake
        sample_visit = Visit(
            patient_id=patient_profile.id,
            title="Pre-Consultation Intake: Recurrent Migraine",
            status="completed",
            current_intake_step="complete",
            summary={
                "chief_complaint": "Recurrent throbbing right-sided headache",
                "onset": "Began 4 days ago gradually, worse after screen exposure",
                "duration": "4 days duration",
                "severity": "6/10 (Moderate to Severe)",
                "associated_symptoms": ["Mild sensitivity to bright lights", "Occasional nausea"],
                "past_medical_history": ["Asthma (mild)", "Pre-diabetes under dietary management"],
                "current_medications": ["Metformin 500mg daily", "Paracetamol 650mg SOS"],
                "allergies": ["Penicillin", "Dust Mites"],
                "red_flags": [],
                "patient_own_description": "Patient reported throbbing right-sided headache for 4 days with mild photophobia. No sudden thunderclap onset.",
                "ai_assessment_notes": "Clinical intake structured for physician evaluation. Findings suggestive of episodic tension-type or migraine spectrum headache. Red-flag symptoms ruled out by patient."
            },
            red_flags=[],
            has_red_flags=False,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=45)
        )
        db.add(sample_visit)
        db.commit()
        db.refresh(sample_visit)

        chat_data = [
            ("assistant", "Hello! I am your Curasync Intake Assistant. What is the primary symptom you are experiencing today?", ["Headache", "Cough", "Fever", "Other"]),
            ("user", "I have a recurrent throbbing headache on the right side of my head.", None),
            ("assistant", "How long have you been experiencing this, and did it start suddenly or gradually?", ["Started today", "2 - 3 days", "About 1 week", "Chronic"]),
            ("user", "It started about 4 days ago gradually.", None),
            ("assistant", "On a scale of 1 to 10, how intense is the discomfort?", ["1-3 (Mild)", "4-6 (Moderate)", "7-8 (Severe)", "9-10 (Extreme)"]),
            ("user", "Around 6 out of 10. Noticeably painful.", None),
            ("assistant", "Thank you. Are you experiencing any chest discomfort, severe breathlessness, fainting, or sudden weakness?", ["None of these", "Mild dizziness"]),
            ("user", "None of these urgent symptoms.", None),
            ("assistant", "Thank you! Your intake summary is compiled and ready for doctor review.", ["Review Summary", "Share with Doctor"])
        ]

        for role, content, opts in chat_data:
            msg = ChatMessage(
                visit_id=sample_visit.id,
                role=role,
                content=content,
                options=opts,
                step="complete"
            )
            db.add(msg)
        db.commit()

        # 6. Sample Active Temporary Access Code (OTP: 482910)
        sample_code = "482910"
        sample_token = AccessToken(
            patient_id=patient_profile.id,
            token_hash=hash_token(sample_code),
            code_display=sample_code,
            scope=["visit_summary", "recent_reports", "lab_data"],
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=14),
            used_count=1,
            max_uses=5,
            is_revoked=False
        )
        db.add(sample_token)
        db.commit()
        db.refresh(sample_token)

        # 7. Sample Access History Log
        sample_log = AccessLog(
            token_id=sample_token.id,
            patient_id=patient_profile.id,
            doctor_id=doctor_profile.id,
            accessed_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=5),
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
            resources_accessed=["Visit Summary", "CBC Laboratory Report"],
            action="temporary_doctor_access",
            doctor_name="Dr. Priya Sharma",
            clinic_name="Apollo Clinical Center, Bengaluru"
        )
        db.add(sample_log)
        db.commit()

        print("--- Demo Data Seeded Successfully ---")
        print("Patient:  Phone = 9876543210 (OTP: 123456 or generated)")
        print("Doctor:   Email = doctor@curasync.com | Password = Doctor@123")
        print("Admin:    Email = admin@curasync.com  | Password = Admin@123")
        print(f"Active Access Code: {sample_code} (Valid for ~14 mins)")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
