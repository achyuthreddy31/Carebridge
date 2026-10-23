from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorProfileUpdate, DoctorProfileResponse
from app.auth.rbac import get_current_doctor

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/profile", response_model=DoctorProfileResponse)
def get_doctor_profile(doctor_data: tuple[User, Doctor] = Depends(get_current_doctor)):
    user, doctor = doctor_data
    return DoctorProfileResponse(
        id=doctor.id,
        user_id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        clinic_name=doctor.clinic_name,
        specialty=doctor.specialty,
        registration_number=doctor.registration_number,
        created_at=doctor.created_at
    )

@router.put("/profile", response_model=DoctorProfileResponse)
def update_doctor_profile(
    payload: DoctorProfileUpdate,
    doctor_data: tuple[User, Doctor] = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    user, doctor = doctor_data
    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.clinic_name is not None:
        doctor.clinic_name = payload.clinic_name.strip()
    if payload.specialty is not None:
        doctor.specialty = payload.specialty.strip()
    if payload.registration_number is not None:
        doctor.registration_number = payload.registration_number.strip()
    
    db.commit()
    db.refresh(user)
    db.refresh(doctor)
    return get_doctor_profile(doctor_data=(user, doctor))
