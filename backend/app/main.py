import sys
from pathlib import Path

# Ensure backend root and app directory are explicitly present in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, aggregates, chat

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(health.router, tags=["health"])
app.include_router(aggregates.router, prefix="/api/aggregates", tags=["aggregates"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
