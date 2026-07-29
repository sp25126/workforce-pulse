# Workforce Pulse

Workforce Pulse is a monorepo containing a full-stack conversational analytics dashboard designed for operations managers and COOs. It processes audit logs of employee activities, detects outliers and repetitive patterns, identifies automation opportunities, and uses LLM agents to provide secure, fact-based insights.

---

## Technology Stack

- **Backend**: FastAPI (Python 3.12.9), SQLAlchemy 2.0.36, PostgreSQL (Supabase), pandas 2.2.3 (data analytics)
- **Frontend**: Next.js (App Router, React, TypeScript), TailwindCSS, Chart.js
- **AI Integrations**: LLM agents connecting to Groq / OpenAI via a secure "Bring Your Own Key" (BYOK) system.

---

## Folder Structure

```text
/
├── frontend/        # Next.js web application
├── backend/         # FastAPI backend application
├── docs/            # Setup guides, deployment notes, troubleshooting, and repository map
├── prompts/         # Centralized developer AI prompt templates
├── scripts/         # Administrative helper scripts
├── output/          # Output file artifact directory
├── shared/          # Reserved folder for shared modules
├── app/             # Python package mapper for Render root compatibilities
├── render.yaml      # Render infrastructure Blueprint
├── requirements.txt # Root dependencies reference
└── runtime.txt      # Root python runtime version pinning (python-3.12.9)
```
For a detailed structure, refer to the [Repository Map](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/repo-map.md).

---

## Local Setup

Detailed instructions are available in the [Setup Guide](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/setup-guide.md). Below is a quick overview:

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Copy environment template, modify values, and run
PYTHONPATH=. uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend (`/backend/.env`)
- `DATABASE_URL`: PostgreSQL connection string.
- `GROQ_API_KEY`: Groq API platform key.
- `GROQ_MODEL`: Target model (default: `llama-3.3-70b-versatile`).
- `CORS_ORIGINS`: JSON list of allowed origins (e.g. `["http://localhost:3000"]`).
- `ENCRYPTION_SECRET_KEY`: Encryption salt used to secure user-configured BYOK keys.

### Frontend (`/frontend/.env.local`)
- `NEXT_PUBLIC_API_BASE_URL`: Base URL of the running FastAPI backend.

---

## Data & System Methodology

1. **ETL & Normalization**: The backend processes input activity logs (CSV) and employee records (JSON), resolving duplicate records, mapping timestamps to canonical Indian Standard Time (IST), standardizing app names and task categories, and flagging anomalous outliers (durations > 12 hours or negative values).
2. **Database Integration**: Cleaned logs are persisted in a Supabase PostgreSQL database. High-performance queries are handled via SQLAlchemy 2.0.
3. **Conversational Analytics**: User queries are analyzed by the LLM agent. The agent uses tools in `backend/app/services/assistant_tools.py` to retrieve verified statistical slices and answers strictly using the provided context, complete with inline citations.
4. **BYOK Security**: Users can configure their own custom AI keys in Settings. These credentials are encrypted on the server before database persistence using Fernet encryption. If the database is offline, the service falls back gracefully to local memory caches.

---

## Deployment & Troubleshooting (Render + Supabase)

- Deployment guide: [Render Deployment Notes](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/render-deploy.md)
- Troubleshooting guide: [Render Troubleshooting Guide](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/render-troubleshooting.md)
- **Backend**: Pinned strictly to Python 3.12.9 (`runtime.txt`). Render directly installs pre-compiled wheel binaries for pandas 2.2.3 and SQLAlchemy 2.0.36.
- **Database**: Run migration SQL in [schema.sql](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/backend/app/models/schema.sql) in the Supabase SQL editor.
