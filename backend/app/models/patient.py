import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    
    # Clinical history & metadata stored as structured JSON
    allergies = Column(JSON, default=list)            # e.g. ["Penicillin", "Peanuts"]
    medications = Column(JSON, default=list)          # e.g. ["Metformin 500mg", "Aspirin 75mg"]
    chronic_conditions = Column(JSON, default=list)   # e.g. ["Type 2 Diabetes", "Hypertension"]
    
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    profile_completion = Column(Integer, default=40)  # Percentage 0-100
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="patient", cascade="all, delete-orphan")
    access_tokens = relationship("AccessToken", back_populates="patient", cascade="all, delete-orphan")
    access_logs = relationship("AccessLog", back_populates="patient", cascade="all, delete-orphan")
