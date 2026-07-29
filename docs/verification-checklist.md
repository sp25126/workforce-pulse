# Verification Checklist

Use this checklist to verify the stability, performance, and correctness of **Workforce Pulse** before committing or deploying changes.

---

## 1. Backend Verification

- [ ] **Dependencies Pinned**: Check `backend/requirements.txt` to ensure exact version locks (`fastapi==0.115.0`, `pandas==2.2.3`, `SQLAlchemy==2.0.36`, `psycopg[binary]==3.2.1`).
- [ ] **Python Runtime Pinned**: Verify `runtime.txt` at the root and in `backend/` are set to `python-3.12.9`.
- [ ] **Clean Imports (Zero Side-Effects)**: Ensure importing backend modules does not attempt DB connection:
  ```bash
  python -c "import app.main; print('Main imported successfully without DB connection!')"
  ```
- [ ] **Health Endpoint Operational**: Query `/health` locally or in production to confirm `200 OK`.
- [ ] **Aggregates Endpoint Operational**: Query `/api/aggregates` with and without filters. Confirm valid JSON payload.
- [ ] **Tests Pass**: Run the test suite:
  ```bash
  cd backend
  python -m pytest
  ```

---

## 2. Frontend Verification

- [ ] **Local Build Passes**: Build locally:
  ```bash
  cd frontend
  npm run build
  ```
- [ ] **App Loads Cleanly**: Open dashboard in browser and check for console errors.
- [ ] **Settings Load Cleanly**: Test BYOK provider configurations in Settings.
- [ ] **Mobile Layout Integrity**: Test responsive layout on narrow viewports.

---

## 3. Deployment & Security Verification

- [ ] **No Secrets Committed**: Confirm no hardcoded API keys or credentials.
- [ ] **Render Deploy Passes**: Verify Render uses Python 3.12.9 and installs pre-compiled wheels for pandas 2.2.3.
- [ ] **Troubleshooting Reference**: Consult [Render Troubleshooting Guide](file:///c:/Users/saumy/OneDrive/Desktop/workforce%20pulse/docs/render-troubleshooting.md) if any build steps fail.
