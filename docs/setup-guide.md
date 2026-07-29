# Setup Guide

This guide explains how to set up the **Workforce Pulse** application locally and deploy it to Render with Supabase.

---

## Prerequisites

- **Python**: 3.12.x
- **Node.js**: v18+ or v20+
- **Database**: PostgreSQL (Supabase recommended)
- **AI Access**: Groq API Key or compatible OpenAI alternative

---

## Local Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   python -m pip install --upgrade pip setuptools wheel
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory (use `backend/.env` or root `.env` as reference):
   ```ini
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/postgres
   GROQ_API_KEY=gsk_your_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   CORS_ORIGINS=["http://localhost:3000"]
   ENCRYPTION_SECRET_KEY=some_long_random_salt_string
   ```

5. **Start the Server**:
   ```bash
   PYTHONPATH=. uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

---

## Local Frontend Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local` inside the `frontend/` directory:
   ```ini
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The site will load at `http://localhost:3000`.

---

## Supabase Database Setup

1. **Create a New Project** on [Supabase](https://supabase.com/).
2. **Apply DB Schema**:
   Go to the Supabase SQL Editor and execute the contents of [schema.sql](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/backend/app/models/schema.sql) to set up tables.
3. **Retrieve connection string**:
   Copy the transaction/session connection URI from Project Settings > Database. Ensure you use the password you configured.

---

## Run Seed Scripts

The ETL/seed script reads local CSV and JSON datasets, normalizes them, and uploads them to the database.

1. **Verify `.env` has the correct `DATABASE_URL`**.
2. **Run the seed script**:
   ```bash
   cd backend
   python scripts/seed_supabase.py
   ```

---

## Verify Health Endpoints

- **Backend Health Check**: Open `http://127.0.0.1:8000/health` in your browser. It should return:
  ```json
  {"status": "ok", "message": "Workforce Pulse backend is running"}
  ```
- **Backend Aggregates API**: Open `http://127.0.0.1:8000/api/aggregates` in your browser. It should return the aggregated dashboard datasets.

---

## Render Deployment Setup

For deployment to Render, refer to the detailed [Render Deployment Notes](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/render-deploy.md) or use Render Blueprints with the root `render.yaml`.

---

## Troubleshooting Common Issues

### 1. Render Build fails compiling pandas from source
- **Cause**: Python runtime is not pinned or defaulting to 3.14.
- **Fix**: Verify `runtime.txt` containing `python-3.12.8` is present in both the root folder and the `backend/` subdirectory.

### 2. Database connection fails on backend startup
- **Cause**: `DATABASE_URL` is incorrect or the database is unreachable.
- **Fix**: The backend has built-in lazy connection logic. Check the warning messages in the terminal logs, verify your network settings, and check that the Supabase password does not contain unescaped special characters.

### 3. CORS issues in the frontend
- **Cause**: Backend CORS setting does not match the frontend domain.
- **Fix**: Configure `CORS_ORIGINS` in your backend env variables to `["https://your-frontend.onrender.com"]` or `["*"]`.
