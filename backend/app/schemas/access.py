from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class CreateAccessTokenRequest(BaseModel):
    scope: Optional[List[str]] = ["visit_summary", "recent_reports", "lab_data"]
    expiry_minutes: Optional[int] = 15
    max_uses: Optional[int] = 5

class AccessTokenResponse(BaseModel):
    id: int
    patient_id: int
    code: str  # 6-digit code shown to patient
    scope: List[str]
    expires_at: datetime
    used_count: int
    max_uses: int
    is_revoked: bool
    is_active: bool
    created_at: datetime

class DoctorAccessRequest(BaseModel):
    otp_code: str

class DoctorAccessSessionResponse(BaseModel):
    token_id: int
    patient_id: int
    patient_name: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    expires_at: datetime
    scope: List[str]
    session_token: str  # Temporary doctor authorization token for this patient record

class AccessLogResponse(BaseModel):
    id: int
    token_id: Optional[int] = None
    doctor_name: Optional[str] = "Healthcare Provider"
    clinic_name: Optional[str] = None
    accessed_at: datetime
    resources_accessed: List[str] = []
    action: str

    class Config:
        from_attributes = True
