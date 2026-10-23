from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DoctorProfileUpdate(BaseModel):
    name: Optional[str] = None
    clinic_name: Optional[str] = None
    specialty: Optional[str] = None
    registration_number: Optional[str] = None

class DoctorProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    specialty: str
    registration_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
