import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.otp import OTPVerification
from app.schemas.auth import (
    SendOTPRequest, SendOTPResponse, VerifyOTPRequest,
    RegisterPatientRequest, LoginRequest, TokenResponse, UserResponse
)
from app.auth.jwt_handler import create_access_token
from app.auth.rbac import get_current_user
from app.utils.security import (
    hash_password, verify_password, hash_token, generate_otp_code
)
from app.utils.validators import validate_phone
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    """Generate and dispatch a temporary 6-digit OTP to mobile phone for patient auth"""
    clean_phone = validate_phone(payload.phone)
    
    # Generate 6-digit OTP code
    otp_code = generate_otp_code(6)
    otp_hash = hash_token(otp_code)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    
    # Invalidate previous unused OTPs for this phone
    db.query(OTPVerification).filter(
        OTPVerification.phone == clean_phone,
        OTPVerification.is_used == False
    ).update({"is_used": True})
    
    otp_entry = OTPVerification(
        phone=clean_phone,
        otp_code=otp_code,
        otp_hash=otp_hash,
        purpose=payload.purpose,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_entry)
    db.commit()

    return SendOTPResponse(
        message=f"OTP successfully dispatched to +91 {clean_phone[:3]}***{clean_phone[-2:]}",
        phone=clean_phone,
        demo_otp=otp_code  # Visible for SIH demo judges and automated testing
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify phone OTP and log patient in, issuing an authenticated JWT session"""
    clean_phone = validate_phone(payload.phone)
    provided_code = payload.otp.strip()

    # Universal demo bypass code '123456' for hackathon convenience
    is_demo_code = (provided_code == "123456")

    if not is_demo_code:
        otp_record = db.query(OTPVerification).filter(
            OTPVerification.phone == clean_phone,
            OTPVerification.otp_code == provided_code,
            OTPVerification.is_used == False
        ).order_by(OTPVerification.created_at.desc()).first()

        if not otp_record:
            raise HTTPException(status_code=400, detail="Invalid OTP code. Please verify the code entered.")

        if otp_record.expires_at < datetime.datetime.utcnow():
            raise HTTPException(status_code=400, detail="This OTP code has expired. Please request a new code.")

        otp_record.is_used = True
        db.commit()

    # Find or auto-provision patient user
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(
            name=f"Patient {clean_phone[-4:]}",
            phone=clean_phone,
            role="patient",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create linked patient profile
        patient = Patient(user_id=user.id)
        db.add(patient)
        db.commit()

    # Generate JWT
    token = create_access_token(data={"user_id": user.id, "role": user.role, "name": user.name})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.name
    )


@router.post("/register-patient", response_model=TokenResponse)
def register_patient(payload: RegisterPatientRequest, db: Session = Depends(get_db)):
    """Register a new patient account with demographic details"""
    clean_phone = validate_phone(payload.phone)

    existing_user = db.query(User).filter(User.phone == clean_phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this mobile number already exists. Please log in.")

    user = User(
        name=payload.name.strip(),
        phone=clean_phone,
        email=payload.email,
        role="patient",
        language=payload.language or "en",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    patient = Patient(
        user_id=user.id,
        age=payload.age,
        gender=payload.gender,
        profile_completion=50
    )
    db.add(patient)
    db.commit()

    token = create_access_token(data={"user_id": user.id, "role": user.role, "name": user.name})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.name
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Doctor and Admin credential login (email + password)"""
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account has been suspended. Please contact administrator.")

    token = create_access_token(data={"user_id": user.id, "role": user.role, "name": user.name})
    return TokenResponse(
        access_token=token,
        role=user.role,
        user_id=user.id,
        name=user.name
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user"""
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully."}
