import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in project root (c:\Users\krish\SIH2026\.env or parent of backend)
root_dir = Path(__file__).resolve().parent.parent.parent
env_path = root_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Curasync")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    
    # Database
    raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./curasync.db")
    if raw_db_url.startswith("sqlite"):
        db_file = (root_dir / "backend" / "curasync.db").resolve()
        DATABASE_URL: str = f"sqlite:///{db_file}"
    else:
        DATABASE_URL: str = raw_db_url
    
    # Auth / JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "curasync-sih-2026-ultra-secure-key-32-chars-minimum")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # AI Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock").lower()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # OCR Provider
    OCR_PROVIDER: str = os.getenv("OCR_PROVIDER", "pypdf2").lower()
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "")
    
    # Storage
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local").lower()
    raw_storage = os.getenv("STORAGE_PATH", "./uploads")
    if not os.path.isabs(raw_storage):
        STORAGE_PATH: str = str((root_dir / "backend" / "uploads").resolve())
    else:
        STORAGE_PATH: str = raw_storage
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    
    # Security / OTP
    ACCESS_TOKEN_EXPIRY_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRY_MINUTES", "15"))
    ACCESS_TOKEN_MAX_USES: int = int(os.getenv("ACCESS_TOKEN_MAX_USES", "5"))
    OTP_EXPIRY_MINUTES: int = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
    
    # CORS
    CORS_ORIGINS: list[str] = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")]

settings = Settings()
