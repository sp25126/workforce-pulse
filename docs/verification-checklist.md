# Verification Checklist

Use this checklist to verify the stability, performance, and correctness of **Workforce Pulse** before committing or deploying changes.

---

## 1. Backend Verification

- [ ] **Dependencies Pinned**: Check `backend/requirements.txt` to ensure no floating version ranges (e.g. all lock to `==`).
- [ ] **Python Runtime Pinned**: Verify `runtime.txt` at the root and in the `backend/` folder are set to `python-3.12.8`.
- [ ] **Clean Imports (Zero Side-Effects)**: Ensure importing backend modules does not attempt DB connection. Verify by running:
  ```bash
  python -c "import app.main; print('Main imported successfully without DB connection!')"
  ```
- [ ] **Health Endpoint Operational**: Query `/health` locally or in production. Ensure it returns `200 OK` with a valid JSON status.
- [ ] **Aggregates Endpoint Operational**: Query `/api/aggregates` with and without filters (e.g. `department=Operations`). Ensure correct JSON response is returned without error.
- [ ] **Tests Pass**: Run the test suite:
  ```bash
  cd backend
  python -m pytest
  ```

---

## 2. Frontend Verification

- [ ] **Local Build Passes**: Build the application locally to catch build-time type/syntax errors:
  ```bash
  cd frontend
  npm run build
  ```
- [ ] **App Loads Cleanly**: Open the application home page in a browser and check for console errors.
- [ ] **Settings Load Cleanly**: Go to the settings page, check current BYOK provider configurations, and verify settings fetch completes successfully.
- [ ] **Mobile Layout Integrity**: Shrink the browser window or use Chrome DevTools device mode (e.g. iPhone SE/Pro). Verify that the sidebar collapses, cards wrap gracefully, charts scale, and the layout doesn't overflow horizontally.

---

## 3. Deployment & Security Verification

- [ ] **No Secrets Committed**: Review git diffs to ensure no passwords, API keys, or encrypted credentials have been hardcoded. Verify `.env` is listed in `.gitignore`.
- [ ] **Render Deploy Passes**: Trigger a manual build on Render. Inspect the build log to confirm that pip installs pre-compiled wheels for `pandas`, `SQLAlchemy`, and `psycopg` instead of compiling them from source.
- [ ] **Render Logs are Stable**: Check Render logs after startup. Ensure no connection timeout warnings or port binding errors exist.
