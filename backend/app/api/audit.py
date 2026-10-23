from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.access_token import AccessLog
from app.schemas.access import AccessLogResponse
from app.auth.rbac import get_current_patient

router = APIRouter(prefix="/audit", tags=["Audit & Transparency"])

@router.get("/access-history", response_model=list[AccessLogResponse])
def get_patient_access_history(
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """
    Fetch privacy audit trail: 'Who accessed my health data?'
    Displays all healthcare providers who accessed patient records with timestamps and scope.
    """
    _, patient = patient_data
    logs = db.query(AccessLog).filter(
        AccessLog.patient_id == patient.id
    ).order_by(AccessLog.accessed_at.desc()).all()

    results = []
    for entry in logs:
        results.append(AccessLogResponse(
            id=entry.id,
            token_id=entry.token_id,
            doctor_name=entry.doctor_name or "Healthcare Professional",
            clinic_name=entry.clinic_name or "Consultation Clinic",
            accessed_at=entry.accessed_at,
            resources_accessed=entry.resources_accessed or ["Visit Summary", "Recent Lab Reports"],
            action=entry.action or "Viewed clinical record"
        ))
    return results
