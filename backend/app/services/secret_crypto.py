import os
import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet() -> Fernet:
    """
    Derives a deterministic 32-byte urlsafe base64 Fernet key using SHA-256 digest
    of server-side secret key or project salt.
    """
    secret_seed = os.environ.get(
        "ENCRYPTION_SECRET_KEY", 
        f"{settings.PROJECT_NAME}_workforce_pulse_secure_server_salt_2026"
    )
    # Generate 32-byte SHA256 digest and urlsafe base64 encode
    digest = hashlib.sha256(secret_seed.encode('utf-8')).digest()
    fernet_key = base64.urlsafe_b64encode(digest)
    return Fernet(fernet_key)

def encrypt_secret(plaintext: str) -> str:
    """
    Encrypts sensitive string plaintext into Fernet token string.
    """
    if not plaintext:
        return ""
    fernet = _get_fernet()
    token = fernet.encrypt(plaintext.encode('utf-8'))
    return token.decode('utf-8')

def decrypt_secret(ciphertext: str) -> str:
    """
    Decrypts Fernet ciphertext token back into plaintext string.
    Returns empty string if decryption fails or token is invalid.
    """
    if not ciphertext:
        return ""
    try:
        fernet = _get_fernet()
        decrypted_bytes = fernet.decrypt(ciphertext.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception:
        return ""
