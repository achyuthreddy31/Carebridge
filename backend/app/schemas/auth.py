from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit mobile number")
    purpose: str = Field(default="login")

class SendOTPResponse(BaseModel):
    message: str
    phone: str
    demo_otp: Optional[str] = None  # Returned in development for immediate testability

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

class RegisterPatientRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    language: Optional[str] = "en"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str

class UserResponse(BaseModel):
    id: int
    name: str
    role: str
    phone: Optional[str] = None
    email: Optional[str] = None
    language: str
    created_at: datetime

    class Config:
        from_attributes = True
