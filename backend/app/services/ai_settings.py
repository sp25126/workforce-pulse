import os
import datetime
from typing import Dict, Any, Optional
from app.core.config import settings
from app.schemas.ai_settings import AISettingsRequest, AISettingsResponse
from app.services.secret_crypto import encrypt_secret, decrypt_secret

# In-memory fallback cache to ensure zero breakage if DB is offline
MEMORY_AI_SETTINGS: Dict[str, Dict[str, Any]] = {}

DEFAULT_PROVIDER_BASE_URLS = {
    "groq": "https://api.groq.com/openai/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "openai": "https://api.openai.com/v1",
    "google": "https://generativelanguage.googleapis.com/v1beta/openai",
    "anthropic": "https://api.anthropic.com/v1"
}

def get_db_engine():
    from sqlalchemy import create_engine
    return create_engine(settings.DATABASE_URL)

def ensure_ai_settings_table():
    """
    Auto-creates the ai_settings table in Supabase PostgreSQL if missing.
    """
    from sqlalchemy import text
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_settings (
                    workspace_id VARCHAR(50) PRIMARY KEY,
                    use_byok BOOLEAN NOT NULL DEFAULT FALSE,
                    provider VARCHAR(50) NOT NULL DEFAULT 'groq',
                    model VARCHAR(150) NOT NULL DEFAULT 'llama-3.3-70b-versatile',
                    base_url VARCHAR(255),
                    api_key_encrypted TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.commit()
    except Exception as e:
        print(f"Warning: Failed to ensure ai_settings table in DB: {e}")

def get_ai_settings_raw(workspace_id: str = "default_workspace") -> Dict[str, Any]:
    """
    Fetches raw settings dictionary for workspace from DB or memory fallback.
    """
    from sqlalchemy import text
    try:
        engine = get_db_engine()
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT use_byok, provider, model, base_url, api_key_encrypted, updated_at FROM ai_settings WHERE workspace_id = :wid"),
                {"wid": workspace_id}
            ).fetchone()
            
            if result:
                return {
                    "workspace_id": workspace_id,
                    "use_byok": bool(result[0]),
                    "provider": result[1] or "groq",
                    "model": result[2] or settings.GROQ_MODEL,
                    "base_url": result[3],
                    "api_key_encrypted": result[4],
                    "updated_at": result[5].isoformat() if result[5] else datetime.datetime.now().isoformat()
                }
    except Exception as e:
        print(f"Warning: DB lookup failed for ai_settings, falling back to memory: {e}")

    # Fallback to memory cache or default
    return MEMORY_AI_SETTINGS.get(workspace_id, {
        "workspace_id": workspace_id,
        "use_byok": False,
        "provider": "groq",
        "model": settings.GROQ_MODEL,
        "base_url": None,
        "api_key_encrypted": None,
        "updated_at": datetime.datetime.now().isoformat()
    })

def get_ai_settings_response(workspace_id: str = "default_workspace") -> AISettingsResponse:
    """
    Fetches sanitized, public-safe AI settings response for browser consumption.
    Raw keys are NEVER returned.
    """
    raw = get_ai_settings_raw(workspace_id)
    
    use_byok = raw["use_byok"]
    provider = raw["provider"]
    model = raw["model"]
    base_url = raw.get("base_url")
    has_key = bool(raw.get("api_key_encrypted"))
    
    if not use_byok:
        status_str = "platform-default"
    elif use_byok and has_key:
        status_str = "active"
    else:
        status_str = "invalid-config"

    return AISettingsResponse(
        useByok=use_byok,
        provider=provider,
        model=model,
        baseUrl=base_url,
        status=status_str,
        updatedAt=raw.get("updated_at", datetime.datetime.now().isoformat())
    )

def save_ai_settings(req: AISettingsRequest, workspace_id: str = "default_workspace") -> AISettingsResponse:
    """
    Saves or updates BYOK AI settings. Encrypts API key before storage.
    """
    # Validation rules
    if req.use_byok:
        if not req.provider:
            raise ValueError("Provider cannot be empty when BYOK is enabled.")
        if not req.model:
            raise ValueError("Model cannot be empty when BYOK is enabled.")

    existing_raw = get_ai_settings_raw(workspace_id)
    
    # Encrypt new API key if provided; otherwise retain existing encrypted key
    if req.api_key and req.api_key.strip():
        encrypted_key = encrypt_secret(req.api_key.strip())
    else:
        encrypted_key = existing_raw.get("api_key_encrypted")

    if req.use_byok and not encrypted_key:
        raise ValueError("An API key is required when enabling Bring Your Own Key (BYOK).")

    updated_at_iso = datetime.datetime.now().isoformat()

    # Update in-memory fallback cache first
    MEMORY_AI_SETTINGS[workspace_id] = {
        "workspace_id": workspace_id,
        "use_byok": req.use_byok,
        "provider": req.provider,
        "model": req.model,
        "base_url": req.base_url,
        "api_key_encrypted": encrypted_key,
        "updated_at": updated_at_iso
    }

    # Persist to database if available
    try:
        from sqlalchemy import text
        engine = get_db_engine()
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO ai_settings (workspace_id, use_byok, provider, model, base_url, api_key_encrypted, updated_at)
                    VALUES (:wid, :byok, :provider, :model, :base_url, :enc_key, NOW())
                    ON CONFLICT (workspace_id) DO UPDATE SET
                        use_byok = EXCLUDED.use_byok,
                        provider = EXCLUDED.provider,
                        model = EXCLUDED.model,
                        base_url = EXCLUDED.base_url,
                        api_key_encrypted = COALESCE(EXCLUDED.api_key_encrypted, ai_settings.api_key_encrypted),
                        updated_at = NOW();
                """),
                {
                    "wid": workspace_id,
                    "byok": req.use_byok,
                    "provider": req.provider,
                    "model": req.model,
                    "base_url": req.base_url,
                    "enc_key": encrypted_key
                }
            )
            conn.commit()
    except Exception as e:
        print(f"Warning: Could not persist ai_settings to DB: {e}")

    return get_ai_settings_response(workspace_id)

def reset_ai_settings(workspace_id: str = "default_workspace") -> AISettingsResponse:
    """
    Resets workspace AI settings back to platform defaults.
    """
    updated_at_iso = datetime.datetime.now().isoformat()
    MEMORY_AI_SETTINGS[workspace_id] = {
        "workspace_id": workspace_id,
        "use_byok": False,
        "provider": "groq",
        "model": settings.GROQ_MODEL,
        "base_url": None,
        "api_key_encrypted": None,
        "updated_at": updated_at_iso
    }

    try:
        from sqlalchemy import text
        engine = get_db_engine()
        with engine.connect() as conn:
            conn.execute(
                text("""
                    UPDATE ai_settings 
                    SET use_byok = FALSE, api_key_encrypted = NULL, updated_at = NOW()
                    WHERE workspace_id = :wid;
                """),
                {"wid": workspace_id}
            )
            conn.commit()
    except Exception as e:
        print(f"Warning: Could not reset DB ai_settings: {e}")

    return get_ai_settings_response(workspace_id)

def resolve_ai_provider_config(workspace_id: str = "default_workspace") -> Dict[str, Any]:
    """
    Single source of truth for resolving active AI provider configuration.
    Returns BYOK settings if valid and enabled; otherwise platform defaults.
    """
    raw = get_ai_settings_raw(workspace_id)
    
    if raw.get("use_byok") and raw.get("api_key_encrypted"):
        decrypted_key = decrypt_secret(raw["api_key_encrypted"])
        if decrypted_key:
            provider = raw.get("provider", "custom")
            base_url = raw.get("base_url") or DEFAULT_PROVIDER_BASE_URLS.get(provider, "https://api.groq.com/openai/v1")
            model = raw.get("model") or "llama-3.3-70b-versatile"
            
            return {
                "source": "byok",
                "provider": provider,
                "api_key": decrypted_key,
                "base_url": base_url,
                "model": model
            }

    # Platform default fallback
    platform_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
    return {
        "source": "platform",
        "provider": "groq",
        "api_key": platform_key,
        "base_url": DEFAULT_PROVIDER_BASE_URLS["groq"],
        "model": settings.GROQ_MODEL or "llama-3.3-70b-versatile"
    }
