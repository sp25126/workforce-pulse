# Repository Map

This document describes the structure and organization of the **Workforce Pulse** repository.

## Root Directory

The root directory contains the general project configuration, deployment blueprints, and entrypoints:

- `frontend/` - Next.js web application.
- `backend/` - FastAPI backend application.
- `docs/` - Project documentation, setup guides, and deployment notes.
- `shared/` - Reserved folder for shared models or scripts.
- `app/` - Python helper packages mapping root paths to the backend folder (for Render uvicorn execution compatibility).
- `render.yaml` - Render blueprint specifying deployment instructions.
- `README.md` - Primary project overview and quickstart guide.
- `.env.example` - Example environment configuration template.
- `requirements.txt` - Root python dependency file referencing the backend requirements.
- `runtime.txt` - Root python runtime specification (pinned to `python-3.12.8`).
- `.gitignore` - Project-wide git exclusion file.

---

## Backend Structure (`backend/`)

The backend is a FastAPI application structured as follows:

- `app/` - Main backend code:
  - `api/` - HTTP routes and route registration.
    - `routes/` - Individual API routers (`health.py`, `aggregates.py`, `chat.py`, `settings_ai.py`).
  - `core/` - Core configurations (`config.py`).
  - `models/` - Database SQL schemas (`schema.sql`).
  - `schemas/` - Pydantic schemas for requests/responses (`ai_settings.py`).
  - `services/` - Business logic and utilities:
    - `ai_settings.py` - BYOK and platform AI configuration.
    - `assistant_tools.py` - Context retrieval utilities for LLM queries.
    - `etl.py` - Data normalization, cleaning, and sanitization routines.
    - `secret_crypto.py` - Safe encryption/decryption of user-configured API keys.
  - `main.py` - FastAPI application entrypoint with lifespan startup handlers.
- `data/` - Local data store:
  - `raw/` - Raw input CSV/JSON files (`activity_logs.csv`, `employees.json`).
- `scripts/` - Administrative scripts:
  - `seed_supabase.py` - Populates Supabase tables with cleaned seed data.
- `tests/` - Backend unit and integration tests.
- `requirements.txt` - Pinned dependency file for backend Python environment.
- `runtime.txt` - Backend Python runtime specification (pinned to `python-3.12.8`).

---

## Frontend Structure (`frontend/`)

The frontend is a Next.js application structured as follows:

- `app/` - App Router layout, routing, pages, and global styles:
  - `layout.tsx` - App shell and context wrappers.
  - `page.tsx` - Main analytics dashboard.
  - `settings/` - Settings panel page for AI models/credentials.
  - `globals.css` - Global theme rules and root CSS variables.
- `components/` - Reusable UI widgets and layout modules:
  - `AnomaliesList.tsx` - Flagged data quality anomaly lists.
  - `AutomationRanking.tsx` - Candidate prioritization metrics.
  - `ChatPanel.tsx` - Conversational analytics interface.
  - `MetricsHeadline.tsx` - Headline KPI summary cards.
  - `TrendChart.tsx` - Weekly Trend line/area chart.
  - `ui/` - Standard primitives (buttons, inputs, select boxes).
- `lib/` - Helper utilities and API connection layers.
- `public/` - Public assets (images, icons, vectors).
- `package.json` - Frontend build configuration and node dependencies.
- `tsconfig.json` - TypeScript compiler parameters.
