import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.visit import Visit, ChatMessage
from app.schemas.visit import (
    CreateVisitRequest, VisitResponse, ChatMessageRequest, ChatMessageResponse
)
from app.auth.rbac import get_current_patient
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/visits", tags=["AI Intake & Visits"])

@router.post("", response_model=VisitResponse)
async def create_new_visit(
    payload: CreateVisitRequest = None,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Start a new clinical intake consultation session"""
    _, patient = patient_data
    ai_svc = get_ai_service()

    visit_title = payload.title if payload and payload.title else "Clinical Intake Consultation"
    visit = Visit(
        patient_id=patient.id,
        title=visit_title,
        status="in_progress",
        current_intake_step="chief_complaint",
        red_flags=[],
        has_red_flags=False
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)

    # Automatically add initial welcome greeting from Curasync AI Assistant
    initial_step = await ai_svc.process_intake_step(
        current_step="start",
        user_message="",
        history=[]
    )

    welcome_msg = ChatMessage(
        visit_id=visit.id,
        role="assistant",
        content=initial_step["response"],
        options=initial_step.get("options", []),
        step="chief_complaint",
        is_red_flag=False
    )
    db.add(welcome_msg)
    db.commit()
    db.refresh(visit)

    return visit


@router.get("", response_model=list[VisitResponse])
def get_patient_visits(
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Retrieve all consultation intakes for this patient"""
    _, patient = patient_data
    visits = db.query(Visit).filter(
        Visit.patient_id == patient.id
    ).order_by(Visit.created_at.desc()).all()
    return visits


@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit_detail(
    visit_id: int,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Fetch complete consultation intake details and chat history"""
    _, patient = patient_data
    visit = db.query(Visit).filter(
        Visit.id == visit_id,
        Visit.patient_id == patient.id
    ).first()

    if not visit:
        raise HTTPException(status_code=404, detail="Consultation visit not found.")
    return visit


@router.post("/{visit_id}/messages", response_model=ChatMessageResponse)
async def send_intake_message(
    visit_id: int,
    payload: ChatMessageRequest,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """
    Patient sends message or option selection to AI Intake Assistant.
    Assistant processes input, evaluates red flags, and returns the next inquiry.
    """
    _, patient = patient_data
    visit = db.query(Visit).filter(
        Visit.id == visit_id,
        Visit.patient_id == patient.id
    ).first()

    if not visit:
        raise HTTPException(status_code=404, detail="Consultation visit not found.")

    if visit.status == "completed":
        raise HTTPException(status_code=400, detail="This clinical intake has already been completed.")

    user_text = payload.selected_option or payload.content

    # 1. Save user's message
    user_msg = ChatMessage(
        visit_id=visit.id,
        role="user",
        content=user_text,
        step=visit.current_intake_step
    )
    db.add(user_msg)
    db.commit()

    # 2. Process via AI service
    ai_svc = get_ai_service()
    history = [
        {"role": m.role, "content": m.content}
        for m in visit.messages
    ]
    
    ai_result = await ai_svc.process_intake_step(
        current_step=visit.current_intake_step,
        user_message=user_text,
        history=history
    )

    # 3. Update red flags on visit if detected
    if ai_result.get("is_red_flag"):
        current_flags = list(visit.red_flags or [])
        current_flags.extend(ai_result.get("red_flags", []))
        visit.red_flags = current_flags
        visit.has_red_flags = True

    # Update visit step
    next_step = ai_result.get("next_step", "complete")
    visit.current_intake_step = next_step
    db.commit()

    # 4. Save and return AI assistant response
    assistant_msg = ChatMessage(
        visit_id=visit.id,
        role="assistant",
        content=ai_result["response"],
        options=ai_result.get("options", []),
        step=next_step,
        is_red_flag=ai_result.get("is_red_flag", False)
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    # Auto-generate summary if intake completed
    if next_step == "complete" and not visit.summary:
        summary_data = await ai_svc.generate_visit_summary(
            [{"role": m.role, "content": m.content} for m in visit.messages]
        )
        visit.summary = summary_data
        visit.status = "completed"
        visit.completed_at = datetime.datetime.utcnow()
        db.commit()

    return assistant_msg


@router.post("/{visit_id}/complete", response_model=VisitResponse)
async def finalize_visit_summary(
    visit_id: int,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Explicitly generate or regenerate structured SOAP clinical summary"""
    _, patient = patient_data
    visit = db.query(Visit).filter(
        Visit.id == visit_id,
        Visit.patient_id == patient.id
    ).first()

    if not visit:
        raise HTTPException(status_code=404, detail="Consultation visit not found.")

    ai_svc = get_ai_service()
    messages_payload = [{"role": m.role, "content": m.content} for m in visit.messages]
    
    summary = await ai_svc.generate_visit_summary(messages_payload)
    visit.summary = summary
    visit.status = "completed"
    visit.completed_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(visit)
    return visit
