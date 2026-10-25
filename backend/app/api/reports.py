import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.report import Report, MedicalExtraction
from app.schemas.report import ReportResponse, ReportUploadResponse
from app.auth.rbac import get_current_patient, get_current_user
from app.services.storage_service import get_storage_service
from app.services.ocr_service import get_ocr_service
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

@router.post("/upload", response_model=ReportResponse)
async def upload_medical_report(
    file: UploadFile = File(...),
    report_type: str = Form("lab_report"),
    title: str = Form(None),
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """
    Patient uploads medical document (PDF/Image).
    Triggers end-to-end pipeline:
    1. Validation & Secure Storage
    2. OCR Text Extraction
    3. Clinical AI Parameter Extraction
    4. Structured Database Indexing
    """
    user, patient = patient_data
    storage_svc = get_storage_service()
    ocr_svc = get_ocr_service()
    ai_svc = get_ai_service()

    # 1. Save file to isolated local storage
    file_path, stored_filename, file_size, mime = await storage_svc.save_file(file)

    report_title = title.strip() if title else file.filename
    report = Report(
        patient_id=patient.id,
        report_type=report_type,
        title=report_title,
        original_filename=file.filename or stored_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=mime,
        status="uploaded"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # 2. OCR Text Extraction
    try:
        report.status = "ocr_processing"
        db.commit()

        ocr_text = await ocr_svc.extract_text(file_path, mime)
        report.ocr_text = ocr_text
        report.status = "ai_extracting"
        db.commit()

        # 3. AI Extraction
        extraction_res = await ai_svc.extract_lab_data(ocr_text)
        
        extraction = MedicalExtraction(
            report_id=report.id,
            extracted_data=extraction_res.get("extracted_data", []),
            summary=extraction_res.get("summary", "Extracted laboratory report findings."),
            model_used=extraction_res.get("model_used", "Carebridge-Clinical-NLP"),
            confidence=extraction_res.get("confidence", 0.95)
        )
        db.add(extraction)

        report.status = "completed"
        report.processed_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(report)

    except Exception as exc:
        report.status = "failed"
        report.processing_error = str(exc)
        db.commit()
        db.refresh(report)

    return report


@router.get("", response_model=list[ReportResponse])
def get_patient_reports(
    report_type: str = None,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Fetch all medical records for the authenticated patient"""
    _, patient = patient_data
    query = db.query(Report).filter(Report.patient_id == patient.id)
    if report_type:
        query = query.filter(Report.report_type == report_type)
    reports = query.order_by(Report.uploaded_at.desc()).all()
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_detail(
    report_id: int,
    patient_data: tuple[User, Patient] = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Fetch specific report with extracted parameters (Strict patient ownership check)"""
    _, patient = patient_data
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.patient_id == patient.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found or access unauthorized."
        )
    return report


@router.get("/{report_id}/file")
def download_report_file(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Securely stream original report file ensuring patient data ownership boundary"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    # Strict authorization: must be the owner patient or authorized doctor
    if current_user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or report.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this medical file.")
    elif current_user.role != "doctor" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized role.")

    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="File no longer exists on server storage.")

    return FileResponse(
        path=report.file_path,
        media_type=report.mime_type,
        filename=report.original_filename
    )
