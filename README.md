# Workforce Pulse

Monorepo for the Workforce Pulse product.

## Structure
- `frontend/`: Next.js 14 frontend.
- `backend/`: FastAPI Python backend.
- `docs/`: Architecture, planning, and status tracking.
- `shared/`: Shared resources/schemas (if applicable).

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
