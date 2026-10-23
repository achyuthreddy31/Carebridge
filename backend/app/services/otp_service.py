import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.access_token import AccessToken, AccessLog
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.utils.security import generate_otp_code, hash_token
from app.config import settings

class OTPService:
    @staticmethod
    def create_access_token(
        db: Session,
        patient_id: int,
        scope: list[str] = None,
        expiry_minutes: int = None,
        max_uses: int = None
    ) -> tuple[AccessToken, str]:
        """Generate a secure 6-digit temporary patient access token"""
        plain_code = generate_otp_code(6)
        token_hash = hash_token(plain_code)
        
        minutes = expiry_minutes or settings.ACCESS_TOKEN_EXPIRY_MINUTES
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=minutes)
        token_scope = scope or ["visit_summary", "recent_reports", "lab_data"]
        token_max_uses = max_uses or settings.ACCESS_TOKEN_MAX_USES

        access_token = AccessToken(
            patient_id=patient_id,
            token_hash=token_hash,
            code_display=plain_code,
            scope=token_scope,
            expires_at=expires_at,
            max_uses=token_max_uses,
            used_count=0,
            is_revoked=False
        )
        db.add(access_token)
        db.commit()
        db.refresh(access_token)
        return access_token, plain_code

    @staticmethod
    def validate_and_consume(
        db: Session,
        otp_code: str,
        doctor: Doctor,
        ip_address: str = None,
        user_agent: str = None
    ) -> AccessToken:
        """Validate doctor-submitted 6-digit code against strict security constraints"""
        token_hash = hash_token(otp_code.strip())
        
        token = db.query(AccessToken).filter(
            AccessToken.token_hash == token_hash
        ).first()

        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid access code. Please verify with the patient."
            )

        if token.is_revoked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This access code was revoked by the patient."
            )

        now = datetime.datetime.utcnow()
        if token.expires_at < now:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This access code has expired. Please request a new temporary code."
            )

        if token.used_count >= token.max_uses:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Maximum access attempts for this code have been reached."
            )

        # Increment usage counter
        token.used_count += 1
        
        # Log this auditable access event
        doctor_name = doctor.user.name if doctor.user else "Dr. Healthcare Provider"
        clinic_name = doctor.clinic_name or "Consultation Clinic"
        
        log_entry = AccessLog(
            token_id=token.id,
            patient_id=token.patient_id,
            doctor_id=doctor.id,
            accessed_at=now,
            ip_address=ip_address or "127.0.0.1",
            user_agent=user_agent or "Web Doctor Portal",
            resources_accessed=token.scope,
            action="temporary_doctor_access",
            doctor_name=doctor_name,
            clinic_name=clinic_name
        )
        db.add(log_entry)
        db.commit()
        db.refresh(token)

        return token

    @staticmethod
    def revoke_token(db: Session, token_id: int, patient_id: int) -> bool:
        """Patient explicitly revokes a shared access code"""
        token = db.query(AccessToken).filter(
            AccessToken.id == token_id,
            AccessToken.patient_id == patient_id
        ).first()

        if not token:
            raise HTTPException(status_code=404, detail="Access token not found.")

        token.is_revoked = True
        db.commit()
        return True
