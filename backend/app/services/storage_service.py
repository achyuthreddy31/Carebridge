import os
import shutil
from abc import ABC, abstractmethod
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from app.utils.security import generate_secure_filename, is_allowed_file

class BaseStorageService(ABC):
    @abstractmethod
    async def save_file(self, file: UploadFile) -> tuple[str, str, int, str]:
        """Save file and return (file_path, stored_filename, file_size, mime_type)"""
        pass

    @abstractmethod
    def get_file_path(self, relative_path: str) -> str:
        """Get absolute path to stored file"""
        pass


class LocalStorageService(BaseStorageService):
    def __init__(self, base_path: str = None):
        self.base_path = base_path or settings.STORAGE_PATH
        os.makedirs(self.base_path, exist_ok=True)

    async def save_file(self, file: UploadFile) -> tuple[str, str, int, str]:
        # Validate MIME & extension
        mime = file.content_type or "application/octet-stream"
        if not is_allowed_file(file.filename or "unknown", mime):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF, JPG, JPEG, and PNG medical reports are allowed."
            )

        stored_filename = generate_secure_filename(file.filename or "report.pdf")
        destination = os.path.join(self.base_path, stored_filename)

        # Stream file to disk and enforce max size limit
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        file_size = 0

        with open(destination, "wb") as buffer:
            while chunk := await file.read(1024 * 64):  # 64KB chunks
                file_size += len(chunk)
                if file_size > max_bytes:
                    buffer.close()
                    if os.path.exists(destination):
                        os.remove(destination)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                buffer.write(chunk)

        # Reset pointer
        await file.seek(0)
        return destination, stored_filename, file_size, mime

    def get_file_path(self, relative_path: str) -> str:
        clean_path = os.path.basename(relative_path)
        full_path = os.path.join(self.base_path, clean_path)
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="Requested file not found on storage.")
        return full_path


def get_storage_service() -> BaseStorageService:
    return LocalStorageService()
