from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Workforce Pulse"

    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:3000"]'
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Supabase Connection URL — set via environment variable DATABASE_URL
    # Supports both postgresql:// and postgresql+psycopg2:// formats
    DATABASE_URL: str = ""

    # Groq API configs
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @property
    def db_url(self) -> str:
        """
        Returns a SQLAlchemy-compatible DATABASE_URL.
        Normalizes bare postgresql:// -> postgresql+psycopg2://
        so SQLAlchemy 2.x resolves the correct driver automatically.
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        return url

settings = Settings()
