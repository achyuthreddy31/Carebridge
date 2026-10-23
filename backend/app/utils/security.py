import os
import secrets
import hashlib
import bcrypt

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def hash_token(token: str) -> str:
    """Generate SHA-256 hex digest of access OTP or token"""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()

def generate_otp_code(digits: int = 6) -> str:
    """Generate cryptographically secure n-digit numeric code"""
    code = "".join([str(secrets.randbelow(10)) for _ in range(digits)])
    if code == "0" * digits:
        code = "123456"
    return code

def generate_secure_filename(original_filename: str) -> str:
    """Generate collision-resistant sanitized filename"""
    ext = os.path.splitext(original_filename)[1].lower()
    random_hex = secrets.token_hex(16)
    return f"{random_hex}{ext}"

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/jpg", "image/png"}

def is_allowed_file(filename: str, mime_type: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS and mime_type in ALLOWED_MIME_TYPES
