 # backend/services/auth.py

# seed.py (Werkzeug PBKDF2:SHA256)
from werkzeug.security import generate_password_hash, check_password_hash

try:
    from passlib.hash import bcrypt_sha256
except Exception:  # passlib
    bcrypt_sha256 = None


def hash_password(password: str) -> str:
    """
    الافتراضي: PBKDF2:SHA256 (Werkzeug) — متوافق مع seed.py
    """
    return generate_password_hash((password or "").strip())


def verify_password(password: str, password_hash: str) -> bool:
    
    pwd = (password or "").strip()

    # 1) التحقق بصيغة Werkzeug (المستخدمة في seed.py)
    try:
        if check_password_hash(password_hash, pwd):
            return True
    except Exception:
        pass

    # 2) التحقق بصيغة bcrypt_sha256 (لو عندك مستخدمين قدامى بهذه الصيغة)
    if bcrypt_sha256:
        try:
            return bcrypt_sha256.verify(pwd, password_hash)
        except Exception:
            pass

    return False
