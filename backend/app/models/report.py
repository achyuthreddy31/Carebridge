import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(50), default="lab_report")  # lab_report, prescription, imaging, discharge_summary
    title = Column(String(200), nullable=True)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), nullable=False)
    
    # OCR and processing states
    # uploaded -> ocr_processing -> ocr_completed -> ai_extracting -> completed / failed
    status = Column(String(30), default="uploaded", index=True)
    ocr_text = Column(Text, nullable=True)
    processing_error = Column(String(500), nullable=True)
    report_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="reports")
    extraction = relationship("MedicalExtraction", back_populates="report", uselist=False, cascade="all, delete-orphan")


class MedicalExtraction(Base):
    __tablename__ = "medical_extractions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Structured lab test items:
    # [{"test_name": "Hemoglobin", "value": "13.2", "unit": "g/dL", "reference_range": "12-16", "status": "normal"}]
    extracted_data = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    model_used = Column(String(50), default="mock-clinical-nlp")
    confidence = Column(Float, default=0.95)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    report = relationship("Report", back_populates="extraction")
