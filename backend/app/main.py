from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # noqa

from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.doctors import router as doctors_router
from app.api.reports import router as reports_router
from app.api.visits import router as visits_router
from app.api.access_tokens import router as access_tokens_router
from app.api.access import router as access_router
from app.api.audit import router as audit_router
from app.api.admin import router as admin_router

# Create tables on application start
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.APP_NAME} Clinical Intelligence API",
    description="Patient-owned, AI-powered clinical intelligence platform for Smart India Hackathon 2026",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers directly under /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(patients_router, prefix="/api")
app.include_router(doctors_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(visits_router, prefix="/api")
app.include_router(access_tokens_router, prefix="/api")
app.include_router(access_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "tagline": "Your health data. Your control. Smarter clinical visits.",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
        "ai_provider": settings.AI_PROVIDER,
        "ocr_provider": settings.OCR_PROVIDER
    }
