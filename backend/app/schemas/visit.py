from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessageRequest(BaseModel):
    content: str
    selected_option: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    visit_id: int
    role: str
    content: str
    options: Optional[List[str]] = None
    step: Optional[str] = None
    is_red_flag: bool = False
    precautions: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class VisitSummaryContent(BaseModel):
    chief_complaint: str
    onset: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    associated_symptoms: List[str] = []
    past_medical_history: List[str] = []
    current_medications: List[str] = []
    allergies: List[str] = []
    patient_description: Optional[str] = None
    ai_assessment_notes: Optional[str] = None
    precautions: Optional[Dict[str, Any]] = None

class VisitResponse(BaseModel):
    id: int
    patient_id: int
    title: str
    status: str
    current_intake_step: str
    summary: Optional[Dict[str, Any]] = None
    precautions: Optional[Dict[str, Any]] = None
    red_flags: List[Dict[str, Any]] = []
    has_red_flags: bool = False
    created_at: datetime
    completed_at: Optional[datetime] = None
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class AnalyzePrecautionsRequest(BaseModel):
    symptoms: str
    duration: Optional[str] = None
    severity: Optional[str] = None

class CreateVisitRequest(BaseModel):
    title: Optional[str] = "Clinical Consultation Intake"
