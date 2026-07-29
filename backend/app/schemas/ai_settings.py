from pydantic import BaseModel, Field
from typing import Optional

class AISettingsRequest(BaseModel):
    use_byok: bool = Field(False, description="Toggle whether to use custom BYOK API key")
    provider: str = Field("groq", description="Provider slug (groq, openrouter, openai, anthropic, google, custom)")
    model: str = Field("llama-3.3-70b-versatile", description="Target LLM model identifier")
    api_key: Optional[str] = Field(None, description="Plaintext API key (encrypted at rest)")
    base_url: Optional[str] = Field(None, description="Custom API endpoint base URL")

class AISettingsResponse(BaseModel):
    useByok: bool
    provider: str
    model: str
    baseUrl: Optional[str] = None
    status: str  # "active" | "platform-default" | "invalid-config"
    updatedAt: str
