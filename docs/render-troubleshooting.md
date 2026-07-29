# Render Deployment Troubleshooting Guide

This document provides actionable steps to diagnose and resolve deployment failures on Render for **Workforce Pulse**.

---

## 1. Render Uses the Wrong Python Version (e.g. Python 3.14)

### Symptoms
- Render build logs show `Using Python 3.14.0` or `Building wheel for pandas (pyproject.toml) ... error`.
- Build fails during Cython or C++ compilation of pandas/numpy.

### Cause
Render defaults to its latest available Python image if it cannot detect runtime configuration.

### Fix
1. Ensure `runtime.txt` containing `python-3.12.9` is present in both the repository root and the `backend/` subdirectory.
2. In the Render Dashboard under **Environment Settings**, verify that the key `PYTHON_VERSION` is explicitly set to `3.12.9`.
3. In `render.yaml`, verify `envVars` lists `- key: PYTHON_VERSION` with `value: 3.12.9`.

---

## 2. Pandas Compiles from Source

### Symptoms
- Long build execution times followed by GCC / Cython compiler errors.

### Cause
The python version in use does not have pre-compiled wheels published for pandas 2.2.3.

### Fix
- Ensure Python runtime is pinned to **3.12.9** and `requirements.txt` locks `pandas==2.2.3`.
- Verify the build command upgrades `pip`, `setuptools`, and `wheel` before installing requirements:
  ```bash
  python -m pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
  ```

---

## 3. Startup Import Errors or DB Connection Crashes

### Symptoms
- Render app crashes during startup with `OperationalError`, `ConnectionRefused`, or `ModuleNotFoundError`.

### Cause
Importing routes or modules at top level executes DB connection code before environment variables are injected or while the DB is starting up.

### Fix
- All heavy database initialization logic (e.g. `ensure_ai_settings_table()`) is placed inside FastAPI's `lifespan` handler in `backend/app/main.py`.
- Service functions lazy-load `create_engine` and `text` inside function bodies rather than module top level.
- Test import sanity locally:
  ```bash
  python -c "import app.main; print('Import clean!')"
  ```

---

## 4. Root Directory & Path Resolution Issues

### Symptoms
- Render reports `No module named app` or `FileNotFoundError: requirements.txt`.

### Cause
The Render Web Service is set to the repository root instead of the `backend/` directory.

### Fix
1. In Render Dashboard > Service Settings, set **Root Directory** to `backend`.
2. Confirm **Build Command** is `pip install -r requirements.txt` or `python -m pip install --upgrade pip setuptools wheel && pip install -r requirements.txt`.
3. Confirm **Start Command** is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
