import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.report import Report
from app.models.visit import Visit
from app.models.access_token import AccessToken, AccessLog
from app.auth.rbac import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/stats")
def get_system_stats(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Platform health and operational statistics (No direct clinical record access)"""
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_reports = db.query(Report).count()
    total_visits = db.query(Visit).count()
    
    now = datetime.datetime.utcnow()
    active_tokens = db.query(AccessToken).filter(
        AccessToken.is_revoked == False,
        AccessToken.expires_at > now
    ).count()

    total_access_logs = db.query(AccessLog).count()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_reports": total_reports,
        "total_visits": total_visits,
        "active_tokens": active_tokens,
        "total_access_events": total_access_logs,
        "system_status": "Operational",
        "api_version": "1.0.0",
        "timestamp": now.isoformat()
    }


@router.get("/users")
def get_all_users(
    role: str = None,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """User account governance list"""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]


@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate or suspend user access"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.is_active = is_active
    db.commit()
    return {"message": f"User status successfully updated to {'active' if is_active else 'suspended'}."}


@router.get("/audit-logs")
def get_system_audit_logs(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """System-wide access audit logs (metadata only, no medical data)"""
    logs = db.query(AccessLog).order_by(AccessLog.accessed_at.desc()).limit(50).all()
    return [
        {
            "id": log.id,
            "patient_id": log.patient_id,
            "doctor_name": log.doctor_name or "Doctor",
            "clinic_name": log.clinic_name,
            "action": log.action,
            "ip_address": log.ip_address,
            "resources": log.resources_accessed,
            "accessed_at": log.accessed_at.isoformat()
        }
        for log in logs
    ]
