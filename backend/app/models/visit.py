import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), default="Clinical Consultation Intake")
    
    # State: in_progress, completed, cancelled
    status = Column(String(30), default="in_progress")
    current_intake_step = Column(String(50), default="chief_complaint")
    
    # Structured clinical summary (SOAP-style format)
    # {
    #   "chief_complaint": "...",
    #   "onset": "...",
    #   "duration": "...",
    #   "severity": "...",
    #   "associated_symptoms": [],
    #   "past_medical_history": [],
    #   "current_medications": [],
    #   "allergies": [],
    #   "patient_description": "...",
    #   "ai_assessment_notes": "..."
    # }
    summary = Column(JSON, nullable=True)
    
    # Array of flagged urgent red flag indicators
    # [{"symptom": "Chest pain", "urgency": "high", "note": "Requires immediate evaluation"}]
    red_flags = Column(JSON, default=list)
    has_red_flags = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="visits")
    messages = relationship("ChatMessage", back_populates="visit", cascade="all, delete-orphan", order_by="ChatMessage.timestamp")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # assistant, user, system
    content = Column(Text, nullable=False)
    
    # Optional structured payload (e.g. quick chips options, red-flag warning alert)
    options = Column(JSON, nullable=True)     # e.g. ["Headache", "Cough", "Fever", "Other"]
    step = Column(String(50), nullable=True)   # Current conversation milestone
    is_red_flag = Column(Boolean, default=False)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    visit = relationship("Visit", back_populates="messages")
