import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.secret_crypto import encrypt_secret, decrypt_secret
from app.services.ai_settings import (
    save_ai_settings,
    reset_ai_settings,
    resolve_ai_provider_config,
    get_ai_settings_response
)
from app.schemas.ai_settings import AISettingsRequest

client = TestClient(app)

def test_secret_crypto_encrypt_decrypt():
    original = "gsk_test_api_key_secret_12345"
    encrypted = encrypt_secret(original)
    assert encrypted != original
    assert len(encrypted) > 20
    
    decrypted = decrypt_secret(encrypted)
    assert decrypted == original

def test_ai_settings_default_resolution():
    # Ensure test starts from platform defaults
    reset_ai_settings("test_workspace")
    
    config = resolve_ai_provider_config("test_workspace")
    assert config["source"] == "platform"
    assert config["provider"] == "groq"
    assert "api_key" in config

def test_ai_settings_save_and_resolve_byok():
    req = AISettingsRequest(
        use_byok=True,
        provider="openrouter",
        model="google/gemma-4-31b-it:free",
        api_key="sk-or-v1-my-custom-test-key",
        base_url="https://openrouter.ai/api/v1"
    )
    
    saved = save_ai_settings(req, workspace_id="test_workspace")
    assert saved.useByok is True
    assert saved.provider == "openrouter"
    assert saved.model == "google/gemma-4-31b-it:free"
    assert saved.status == "active"
    
    # Confirm key is NEVER returned in response schema
    assert not hasattr(saved, "api_key")
    assert not hasattr(saved, "api_key_encrypted")

    # Verify provider resolution uses BYOK decrypted key
    config = resolve_ai_provider_config("test_workspace")
    assert config["source"] == "byok"
    assert config["provider"] == "openrouter"
    assert config["api_key"] == "sk-or-v1-my-custom-test-key"
    assert config["model"] == "google/gemma-4-31b-it:free"
    assert config["base_url"] == "https://openrouter.ai/api/v1"

def test_ai_settings_reset():
    reset_res = reset_ai_settings("test_workspace")
    assert reset_res.useByok is False
    assert reset_res.status == "platform-default"

    config = resolve_ai_provider_config("test_workspace")
    assert config["source"] == "platform"

def test_api_routes_settings_ai():
    # 1. GET Settings
    res = client.get("/api/settings/ai/")
    assert res.status_code == 200
    data = res.json()
    assert "useByok" in data
    assert "provider" in data
    assert "status" in data
    assert "apiKey" not in data

    # 2. POST Update BYOK Settings
    payload = {
        "use_byok": True,
        "provider": "openai",
        "model": "gpt-4o-mini",
        "api_key": "sk-proj-test-openai-key-999",
        "base_url": "https://api.openai.com/v1"
    }
    post_res = client.post("/api/settings/ai/", json=payload)
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["useByok"] is True
    assert post_data["provider"] == "openai"
    assert post_data["status"] == "active"
    assert "apiKey" not in post_data

    # 3. DELETE Reset Settings
    del_res = client.delete("/api/settings/ai/")
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["useByok"] is False
    assert del_data["status"] == "platform-default"
