from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class PatientProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    language: Optional[str] = None

class PatientProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: List[str] = []
    medications: List[str] = []
    chronic_conditions: List[str] = []
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    profile_completion: int = 40
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PatientDashboardResponse(BaseModel):
    patient_id: int
    name: str
    profile_completion: int
    total_reports: int
    total_visits: int
    active_shares_count: int
    has_active_share: bool
    active_doctor_name: Optional[str] = None
    share_expires_at: Optional[datetime] = None
    recent_reports: List[Any] = []
    recent_visits: List[Any] = []
