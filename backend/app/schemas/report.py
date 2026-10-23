from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class LabTestItem(BaseModel):
    test_name: str
    value: str
    unit: str
    reference_range: str
    status: str = "normal"  # normal, high, low, critical

class MedicalExtractionResponse(BaseModel):
    id: int
    report_id: int
    extracted_data: List[Dict[str, Any]] = []
    summary: Optional[str] = None
    model_used: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: int
    patient_id: int
    report_type: str
    title: Optional[str] = None
    original_filename: str
    file_size: int
    mime_type: str
    status: str
    processing_error: Optional[str] = None
    report_date: datetime
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    extraction: Optional[MedicalExtractionResponse] = None

    class Config:
        from_attributes = True

class ReportUploadResponse(BaseModel):
    report_id: int
    status: str
    message: str
    filename: str
