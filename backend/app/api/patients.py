import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.report import Report
from app.models.visit import Visit
from app.models.access_token import AccessToken, AccessLog
from app.schemas.patient import (
    PatientProfileUpdate, PatientProfileResponse, PatientDashboardResponse
)
from app.auth.rbac import get_current_patient

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/profile", response_model=PatientProfileResponse)
def get_patient_profile(
    patient_data: tuple[User, Patient] = Depends(get_current_patient)
):
    """Retrieve personal medical profile and clinical background"""
    user, patient = patient_data
    return PatientProfileResponse(
        id=patient.id,
        user_id=user.id,
        name=user.name,
        phone=user.phone,
        email=user.email,
        age=patient.age,
        gender=patient.gender,
        blood_group=patient.blood_group,
        allergies=patient.allergies or [],
        medications=patient.medications or [],
        chronic_conditions=patient.chronic_conditions or [],
        emergency_contact_name=patient.emergency_contact_name,
        emergency_contact_phone=patient.emergency_contact_phone,
        profile_completion=patient.profile_completion or 50,
        created_at=patient.created_at,
        updated_at=patient.updated_at
    )


@router.put("/profile", response_model=PatientProfileResponse)
def update_patient_profile(
    payload: PatientProfileUpdate,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Update patient health profile parameters"""
    user, patient = patient_data

    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.language is not None:
        user.language = payload.language

    if payload.age is not None:
        patient.age = payload.age
    if payload.gender is not None:
        patient.gender = payload.gender
    if payload.blood_group is not None:
        patient.blood_group = payload.blood_group
    if payload.allergies is not None:
        patient.allergies = payload.allergies
    if payload.medications is not None:
        patient.medications = payload.medications
    if payload.chronic_conditions is not None:
        patient.chronic_conditions = payload.chronic_conditions
    if payload.emergency_contact_name is not None:
        patient.emergency_contact_name = payload.emergency_contact_name
    if payload.emergency_contact_phone is not None:
        patient.emergency_contact_phone = payload.emergency_contact_phone

    # Dynamically re-calculate profile completeness
    score = 30
    if patient.age and patient.gender: score += 20
    if patient.blood_group: score += 10
    if patient.emergency_contact_name and patient.emergency_contact_phone: score += 20
    if patient.allergies or patient.medications or patient.chronic_conditions: score += 20
    patient.profile_completion = min(score, 100)

    db.commit()
    db.refresh(user)
    db.refresh(patient)

    return get_patient_profile(patient_data=(user, patient))


@router.get("/dashboard", response_model=PatientDashboardResponse)
def get_patient_dashboard(
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Fetch complete patient health command center state including Privacy Pulse"""
    user, patient = patient_data
    now = datetime.datetime.utcnow()

    # Active access tokens (temporary sharing)
    active_tokens = db.query(AccessToken).filter(
        AccessToken.patient_id == patient.id,
        AccessToken.is_revoked == False,
        AccessToken.expires_at > now
    ).order_by(AccessToken.expires_at.desc()).all()

    has_active_share = len(active_tokens) > 0
    active_doctor_name = None
    share_expires_at = None

    if has_active_share:
        latest_token = active_tokens[0]
        share_expires_at = latest_token.expires_at
        # Check if a doctor has logged an access with this token
        last_log = db.query(AccessLog).filter(
            AccessLog.token_id == latest_token.id
        ).order_by(AccessLog.accessed_at.desc()).first()
        if last_log and last_log.doctor_name:
            active_doctor_name = last_log.doctor_name
        else:
            active_doctor_name = "Temporary OTP Code Active"

    # Aggregated counts
    total_reports = db.query(Report).filter(Report.patient_id == patient.id).count()
    total_visits = db.query(Visit).filter(Visit.patient_id == patient.id).count()

    # Recent reports
    recent_reports_raw = db.query(Report).filter(
        Report.patient_id == patient.id
    ).order_by(Report.uploaded_at.desc()).limit(4).all()

    recent_reports = [
        {
            "id": r.id,
            "title": r.title or r.original_filename,
            "report_type": r.report_type,
            "status": r.status,
            "uploaded_at": r.uploaded_at.isoformat(),
            "extracted_count": len(r.extraction.extracted_data) if r.extraction and r.extraction.extracted_data else 0
        }
        for r in recent_reports_raw
    ]

    # Recent visits
    recent_visits_raw = db.query(Visit).filter(
        Visit.patient_id == patient.id
    ).order_by(Visit.created_at.desc()).limit(3).all()

    recent_visits = [
        {
            "id": v.id,
            "title": v.title,
            "status": v.status,
            "has_red_flags": v.has_red_flags,
            "created_at": v.created_at.isoformat(),
            "chief_complaint": v.summary.get("chief_complaint") if v.summary else None
        }
        for v in recent_visits_raw
    ]

    return PatientDashboardResponse(
        patient_id=patient.id,
        name=user.name,
        profile_completion=patient.profile_completion or 50,
        total_reports=total_reports,
        total_visits=total_visits,
        active_shares_count=len(active_tokens),
        has_active_share=has_active_share,
        active_doctor_name=active_doctor_name,
        share_expires_at=share_expires_at,
        recent_reports=recent_reports,
        recent_visits=recent_visits
    )
