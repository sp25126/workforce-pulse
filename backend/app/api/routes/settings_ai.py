from fastapi import APIRouter, HTTPException, status
from app.schemas.ai_settings import AISettingsRequest, AISettingsResponse
from app.services.ai_settings import (
    get_ai_settings_response,
    save_ai_settings,
    reset_ai_settings
)

router = APIRouter()

@router.get("/", response_model=AISettingsResponse)
def get_ai_settings_endpoint(workspace_id: str = "default_workspace"):
    """
    Returns current sanitized AI Provider settings.
    Raw API keys are NEVER exposed in the response payload.
    """
    try:
        return get_ai_settings_response(workspace_id=workspace_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load AI settings: {str(e)}"
        )

@router.post("/", response_model=AISettingsResponse)
def update_ai_settings_endpoint(payload: AISettingsRequest, workspace_id: str = "default_workspace"):
    """
    Validates, encrypts sensitive API keys, and updates BYOK AI settings.
    """
    try:
        return save_ai_settings(payload, workspace_id=workspace_id)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update AI settings: {str(e)}"
        )

@router.delete("/", response_model=AISettingsResponse)
def reset_ai_settings_endpoint(workspace_id: str = "default_workspace"):
    """
    Resets AI provider configuration back to platform defaults.
    """
    try:
        return reset_ai_settings(workspace_id=workspace_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset AI settings: {str(e)}"
        )
