import sys
from pathlib import Path

# Ensure backend root and app directory are explicitly present in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, aggregates, chat, settings_ai

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

# Robust CORS middleware allowing development origins and wildcards
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(aggregates.router, prefix="/api/aggregates", tags=["aggregates"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(settings_ai.router, prefix="/api/settings/ai", tags=["settings"])
