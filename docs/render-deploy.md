# Render Deployment Notes

This document describes how to deploy the **Workforce Pulse** backend and frontend to Render using pre-configured settings.

---

## FastAPI Backend Configuration

Create a **Web Service** on Render with the following specifications:

- **Environment**: `Python`
- **Root Directory**: `backend` (Render must cd into this directory)
- **Plan**: `Starter`
- **Build Command**:
  ```bash
  python -m pip install --upgrade pip setuptools wheel && pip install --only-binary=:all: -r requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Required Environment Variables

| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.12.9` | Tells Render to use Python 3.12.9 runtime. |
| `APP_ENV` | `production` | Application environment identifier. |
| `PYTHONPATH` | `.` | Sets module search path to backend folder. |
| `DATABASE_URL` | `postgresql://...` | Transaction/session connection string from Supabase. |
| `GROQ_API_KEY` | `gsk_...` | Groq platform API key for chatbot queries. |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Target AI model name. |
| `CORS_ORIGINS` | `["*"]` or `["https://your-frontend.onrender.com"]` | Authorized origin list. |
| `ENCRYPTION_SECRET_KEY` | `your_salt_key` | Secret key used to encrypt user BYOK API credentials. |

---

## Next.js Frontend Configuration

Create a **Web Service** on Render:

- **Environment**: `Node`
- **Root Directory**: `frontend`
- **Plan**: `Starter`
- **Build Command**:
  ```bash
  npm install && npm run build
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

## Troubleshooting

If you encounter build errors (such as `pydantic-core` / `maturin` failures under Python 3.14), refer to the [Render Troubleshooting Guide](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/render-troubleshooting.md).
