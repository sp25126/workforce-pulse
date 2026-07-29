# Vercel Deployment Guide

This guide ensures the **Workforce Pulse Frontend (Next.js)** is deployed correctly on Vercel without returning `404: NOT_FOUND` errors.

---

## 1. Correct Root Directory Setting (CRITICAL)

Because this repository is a monorepo, the Vercel project MUST be explicitly configured to build from the `frontend/` directory. By default, Vercel looks at the root of the repo, finds no Next.js app, and deploys an empty folder (causing the 404 error).

**To fix this in Vercel:**
1. Go to your **Project Dashboard** in Vercel.
2. Click **Settings** (top navigation).
3. On the **General** tab, scroll down to **Root Directory**.
4. Click **Edit**, enter exactly `frontend`, and click **Save**.
5. Redeploy your project.

---

## 2. Framework Preset & Build Command

When the **Root Directory** is correctly set to `frontend`, Vercel automatically detects Next.js.
Verify these settings in **Settings > General**:
- **Framework Preset**: `Next.js`
- **Build Command**: `next build` (Leave as default/empty)
- **Output Directory**: `.next` (Leave as default/empty)
- **Install Command**: `npm install` (Leave as default/empty)

---

## 3. Environment Variables

Your Vercel deployment requires the backend URL to function.
In **Settings > Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://workforce-pulse-backend.onrender.com` | Ensure there is NO trailing slash. |

---

## 4. Homepage Route Verification

This project uses the Next.js **App Router**. The primary entry point for the frontend is located at:
`frontend/app/page.tsx`

If `frontend/app/page.tsx` exists and the Root Directory is set to `frontend`, Vercel will correctly route `/` to your application.

---

## 5. Common 404 Causes on Vercel

If you see a `404: NOT_FOUND` page after a successful build:
- **Missing Root Directory**: You forgot to set Root Directory to `frontend`.
- **Bad `vercel.json` Rewrite**: A `vercel.json` file in the root is hijacking routes. (This project does NOT use a `vercel.json` file; avoid creating one unless necessary for advanced edge routing).
- **No Homepage**: The `frontend/app/page.tsx` file was accidentally deleted.

## Rollback Notes
If a deployment fails, go to the **Deployments** tab in Vercel, click the three dots (`...`) next to the previous successful deployment, and select **Promote to Production** to instantly rollback.
