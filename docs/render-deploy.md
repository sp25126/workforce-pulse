# Render Deployment Notes

This document describes how to deploy the **Workforce Pulse** backend and frontend to Render using the pre-configured settings.

---

## FastAPI Backend Configuration

Create a **Web Service** on Render with the following specifications:

- **Environment**: `Python`
- **Root Directory**: `backend` (Crucial: Render must cd into this directory)
- **Build Command**:
  ```bash
  python -m pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Required Environment Variables
Configure these in the Render service's **Environment** tab:

| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.12.8` | Tells Render to use Python 3.12.8 runtime. |
| `PYTHONPATH` | `.` | Sets the module search path to the backend folder. |
| `DATABASE_URL` | `postgresql://...` | Transaction/session connection string from Supabase. |
| `GROQ_API_KEY` | `gsk_...` | Groq platform API key for chatbot queries. |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Target AI model name. |
| `CORS_ORIGINS` | `["*"]` or `["https://your-frontend.onrender.com"]` | Authorized origin list. |
| `ENCRYPTION_SECRET_KEY` | `your_salt_key` | Secret key used to encrypt user BYOK API credentials. |

---

## Next.js Frontend Configuration

Create a **Web Service** (or Static Site if building export) on Render:

- **Environment**: `Node`
- **Root Directory**: `frontend`
- **Build Command**:
  ```bash
  npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

### Required Environment Variables

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.onrender.com` | Root URL of the deployed FastAPI backend. |

---

## Most Common Failure Causes & Fixes

### 1. Build Fails Trying to Compile Pandas
- **Cause**: Render is using a default Python version (like 3.14) that has no pre-compiled wheels for pandas 2.2.1, forcing compile-from-source which lacks libraries in the base container.
- **Fix**: Check `runtime.txt` is present in `backend/` and `PYTHON_VERSION` env var is set to `3.12.8`.

### 2. Startup Port Timeout
- **Cause**: Uvicorn started on `127.0.0.1` or didn't bind to `$PORT`.
- **Fix**: Ensure the start command is exactly `PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### 3. Startup Crash Due to Missing Database Connection
- **Cause**: Importing routes tries to query database at module level.
- **Fix**: Database setup routines (`ensure_ai_settings_table`) have been moved into the FastAPI startup `lifespan` handler, ensuring import-time safety.
