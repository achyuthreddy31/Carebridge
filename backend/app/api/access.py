import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.report import Report
from app.models.visit import Visit
from app.models.access_token import AccessToken, AccessLog
from app.schemas.access import DoctorAccessRequest, DoctorAccessSessionResponse
from app.schemas.report import ReportResponse
from app.schemas.visit import VisitResponse
from app.auth.rbac import get_current_doctor
from app.services.otp_service import OTPService

router = APIRouter(prefix="/access", tags=["Doctor Patient Workspace"])

@router.post("/validate", response_model=DoctorAccessSessionResponse)
def validate_otp_access(
    payload: DoctorAccessRequest,
    request: Request,
    doctor_data: tuple[User, Doctor] = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """
    Doctor enters 6-digit patient code.
    Backend performs strict validation (expiry, revocation, limit) and establishes temporary session.
    """
    _, doctor = doctor_data
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Doctor Portal")

    token = OTPService.validate_and_consume(
        db=db,
        otp_code=payload.otp_code,
        doctor=doctor,
        ip_address=client_ip,
        user_agent=user_agent
    )

    # Fetch patient overview
    patient = token.patient
    patient_user = patient.user

    return DoctorAccessSessionResponse(
        token_id=token.id,
        patient_id=patient.id,
        patient_name=patient_user.name,
        patient_age=patient.age,
        patient_gender=patient.gender,
        expires_at=token.expires_at,
        scope=token.scope or ["visit_summary", "recent_reports", "lab_data"],
        session_token=token.token_hash
    )


def verify_active_token(token_id: int, db: Session) -> AccessToken:
    token = db.query(AccessToken).filter(AccessToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Access token not found.")
    if token.is_revoked:
        raise HTTPException(status_code=403, detail="Access revoked by patient.")
    if token.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=403, detail="Temporary access has expired.")
    return token


@router.get("/patient/{token_id}/summary")
def get_patient_visit_summary_for_doctor(
    token_id: int,
    doctor_data: tuple[User, Doctor] = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Fetch patient clinical visit summary authorized by temporary access token"""
    token = verify_active_token(token_id, db)
    if "visit_summary" not in (token.scope or []):
        raise HTTPException(status_code=403, detail="Patient scope does not permit visit summary access.")

    # Get most recent visit or completed intake
    visit = db.query(Visit).filter(
        Visit.patient_id == token.patient_id
    ).order_by(Visit.created_at.desc()).first()

    patient = token.patient
    patient_user = patient.user

    return {
        "patient": {
            "id": patient.id,
            "name": patient_user.name,
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "allergies": patient.allergies or [],
            "medications": patient.medications or [],
            "chronic_conditions": patient.chronic_conditions or []
        },
        "visit": {
            "id": visit.id if visit else None,
            "title": visit.title if visit else "Initial Consultation Intake",
            "summary": visit.summary if visit else None,
            "red_flags": visit.red_flags if visit else [],
            "has_red_flags": visit.has_red_flags if visit else False,
            "created_at": visit.created_at.isoformat() if visit else None
        },
        "read_only": True,
        "expires_at": token.expires_at.isoformat()
    }


@router.get("/patient/{token_id}/reports", response_model=list[ReportResponse])
def get_patient_reports_for_doctor(
    token_id: int,
    doctor_data: tuple[User, Doctor] = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Fetch patient medical records permitted by temporary token scope"""
    token = verify_active_token(token_id, db)
    if "recent_reports" not in (token.scope or []):
        raise HTTPException(status_code=403, detail="Patient scope does not permit medical report access.")

    reports = db.query(Report).filter(
        Report.patient_id == token.patient_id
    ).order_by(Report.uploaded_at.desc()).limit(5).all()

    return reports
