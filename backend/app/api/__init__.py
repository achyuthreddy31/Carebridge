from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.doctors import router as doctors_router
from app.api.reports import router as reports_router
from app.api.visits import router as visits_router
from app.api.access_tokens import router as access_tokens_router
from app.api.access import router as access_router
from app.api.audit import router as audit_router
from app.api.admin import router as admin_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(patients_router)
api_router.include_router(doctors_router)
api_router.include_router(reports_router)
api_router.include_router(visits_router)
api_router.include_router(access_tokens_router)
api_router.include_router(access_router)
api_router.include_router(audit_router)
api_router.include_router(admin_router)
