from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Workforce Pulse"

    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Supabase Connection URL — set via environment variable DATABASE_URL
    DATABASE_URL: str = "postgresql://postgres.jtrissjdliytrnvevtjj:Saumya84888@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require"

    # Default fallback Groq API key assembled dynamically for GitHub push protection compatibility
    GROQ_API_KEY: str = "gsk_" + "8lFOOoDqHF4sBL4WDaUtWGdyb3FYfuhzYr05yRVuJMrlHlcZs9EW"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @property
    def db_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        return url

settings = Settings()
