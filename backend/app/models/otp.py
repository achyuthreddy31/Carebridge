import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database import Base

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String(20), index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    otp_hash = Column(String(64), nullable=False)
    purpose = Column(String(30), default="login")  # login, register
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
