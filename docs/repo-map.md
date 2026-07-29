# Repository Map

This document describes the layout of the **Workforce Pulse** repository, highlighting deployment-critical files, documentation, and configuration locations.

---

## Deployment-Critical Files

- `render.yaml` - Master Render Infrastructure Blueprint defining backend (Python 3.12.9) and frontend (Node) web services.
- `runtime.txt` & `backend/runtime.txt` - Python runtime specification pinned strictly to `python-3.12.9`.
- `backend/requirements.txt` - Pinned wheel-backed dependencies (`pandas==2.2.3`, `SQLAlchemy==2.0.36`, `fastapi==0.115.0`, `uvicorn[standard]==0.30.6`, `psycopg[binary]==3.2.1`, `pydantic==2.9.2`, `openai==1.51.2`).
- `backend/app/main.py` - FastAPI app entrypoint with non-blocking lifespan handler.
- `frontend/package.json` - Node dependencies and build scripts (`npm run build`).

---

## Documentation & Guides (`docs/`)

- `docs/setup-guide.md` - Complete local development, DB seeding, and environment setup instructions.
- `docs/vercel-deploy.md` - Vercel Next.js deployment guide, Root Directory config, and env vars.
- `docs/vercel-checklist.md` - Vercel 404 troubleshooting and QA checklist.
- `docs/render-deploy.md` - Render service build/start commands and required env vars.
- `docs/render-troubleshooting.md` - Step-by-step diagnostics for Render build or runtime failures.
- `docs/ai-prompts.md` & `prompts/ai-prompts.md` - Reusable prompt templates for AI developer assistance.
- `docs/verification-checklist.md` - QA checklist for local and pre-deploy testing.
- `docs/repo-map.md` - Repository architecture and file organization.

---

## Directory Overview

```text
/
├── frontend/        # Next.js web application (App Router, TailwindCSS)
├── backend/         # FastAPI backend application (Python 3.12.9)
├── docs/            # Setup guides, deployment notes, and repo maps
├── prompts/         # Centralized AI prompt templates
├── scripts/         # Administrative helper scripts (database seeding)
├── output/          # Output file artifact directory
├── shared/          # Reserved folder for shared modules
├── app/             # Python package mapper for root execution compatibility
├── render.yaml      # Render infrastructure Blueprint
├── requirements.txt # Root dependencies reference
└── runtime.txt      # Root python runtime version pinning (python-3.12.9)
```
