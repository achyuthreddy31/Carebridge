import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class AccessToken(Base):
    __tablename__ = "access_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Hashed 6-digit access code for secure verification
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    # The actual 6-digit plain code shown to patient (not stored in prod DB, but kept temporarily for active UI display)
    code_display = Column(String(10), nullable=True)
    
    # Granular scope: ["visit_summary", "recent_reports", "lab_data"]
    scope = Column(JSON, default=lambda: ["visit_summary", "recent_reports", "lab_data"])
    
    expires_at = Column(DateTime, nullable=False, index=True)
    used_count = Column(Integer, default=0)
    max_uses = Column(Integer, default=5)
    is_revoked = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    patient = relationship("Patient", back_populates="access_tokens")
    access_logs = relationship("AccessLog", back_populates="access_token", cascade="all, delete-orphan")


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token_id = Column(Integer, ForeignKey("access_tokens.id", ondelete="SET NULL"), nullable=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True, index=True)
    
    accessed_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    
    # Resources accessed: e.g. ["Visit Summary", "Lab Report (CBC)"]
    resources_accessed = Column(JSON, default=list)
    action = Column(String(50), default="view_record")
    doctor_name = Column(String(100), nullable=True)
    clinic_name = Column(String(150), nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="access_logs")
    doctor = relationship("Doctor", back_populates="access_logs")
    access_token = relationship("AccessToken", back_populates="access_logs")
