# Render Deployment Troubleshooting Guide

This document provides actionable steps to diagnose and resolve deployment failures on Render for **Workforce Pulse**.

---

## 1. Error: `pydantic-core` / `maturin` Failed (`Read-only file system os error 30`)

### Full Error Traceback Example
```text
Preparing metadata (pyproject.toml): finished with status 'error'
  error: subprocess-exited-with-error
  × Preparing metadata (pyproject.toml) did not run successfully.
      warning: failed to write cache, path: /usr/local/cargo/registry/... Read-only file system (os error 30)
      error: failed to create directory `/usr/local/cargo/registry/cache/...`
      Caused by: Read-only file system (os error 30)
      💥 maturin failed
      Caused by: Cargo metadata failed.
      Error running maturin: Command '['maturin', 'pep517', 'write-dist-info', ..., '/opt/render/project/src/.venv/bin/python3.14']' returned non-zero exit status 1.
error: metadata-generation-failed
× Encountered error while generating package metadata.
╰─> pydantic-core
```

### Root Cause
Look at the path in the traceback: `/opt/render/project/src/.venv/bin/python3.14`.
Render is building against **Python 3.14**. Since `pydantic-core` (written in Rust) does not publish pre-compiled wheel binaries for unreleased/experimental Python 3.14, `pip` falls back to building it from source using Rust/Maturin. Maturin attempts to write to `/usr/local/cargo/registry`, which fails because Render's build container filesystem is read-only outside the project directory.

### Exact Fix Steps

#### Step 1: Force Render to use Python 3.12.9
In the **Render Dashboard**:
1. Open your backend service (`workforce-pulse-backend`).
2. Go to **Environment** settings.
3. Add or edit the environment variable:
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.12.9`
4. Under **Settings**, verify **Root Directory** is set to `backend`.

#### Step 2: Clear the Cached Virtual Environment
Render caches the `.venv` directory between builds. If `.venv` was created with Python 3.14, changing `PYTHON_VERSION` may not recreate `.venv` automatically.
- In the Render Dashboard, click **Manual Deploy** > **Clear build cache & deploy**.

#### Step 3: Enforce Binary Wheel Installation
In `render.yaml` and build commands, use `--only-binary=:all:` to force `pip` to install pre-compiled wheel binaries and reject source compilation:
```bash
python -m pip install --upgrade pip setuptools wheel && pip install --only-binary=:all: -r requirements.txt
```

---

## 2. Error: `pandas` Compiles from Source

### Cause
Python version in use (e.g. Python 3.14) has no pre-compiled wheels for pandas 2.2.3.

### Fix
- Ensure Python runtime is pinned to **3.12.9** (`runtime.txt` and `PYTHON_VERSION=3.12.9`).
- Clear Render build cache and redeploy.

---

## 3. Startup Import Errors or DB Connection Crashes

### Cause
Importing routes or modules at top level executes DB connection code before environment variables are injected or while the DB is starting up.

### Fix
- All heavy database initialization logic (e.g. `ensure_ai_settings_table()`) is placed inside FastAPI's `lifespan` handler in `backend/app/main.py`.
- Service functions lazy-load `create_engine` and `text` inside function bodies rather than module top level.
- Test import sanity locally:
  ```bash
  python -c "import app.main; print('Import clean!')"
  ```
