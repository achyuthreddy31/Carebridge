import re

def validate_phone(phone: str) -> str:
    """Clean and validate Indian 10-digit mobile number"""
    digits = re.sub(r'\D', '', phone)
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]
    elif digits.startswith('0') and len(digits) == 11:
        digits = digits[1:]
    
    if len(digits) != 10:
        raise ValueError("Invalid phone number. Must be a 10-digit mobile number.")
    return digits

def validate_email(email: str) -> bool:
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(email_regex, email))
