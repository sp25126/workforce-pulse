# Vercel Verification Checklist

Use this checklist to verify that a Vercel deployment is correctly configured and successfully serving the Next.js frontend application.

## 1. Configuration Verification
- [ ] **Root Directory Correct**: In Vercel Project Settings > General, the Root Directory is set exactly to `frontend`.
- [ ] **Framework Preset Correct**: The Framework Preset is automatically detected and set to `Next.js`.
- [ ] **No Harmful Overrides**: There is no `vercel.json` file incorrectly forcing single-page app (SPA) rewrites for the App Router.

## 2. Codebase Verification
- [ ] **Homepage Route Exists**: The file `frontend/app/page.tsx` exists and exports a valid React component.
- [ ] **Layout Exists**: The file `frontend/app/layout.tsx` exists to provide the root HTML document structure.

## 3. Post-Deployment QA
- [ ] **Build Succeeds**: The Vercel build log completes successfully without missing dependency errors.
- [ ] **No 404 at Root**: Visiting the production URL `/` correctly returns the React application, not a Vercel `404: NOT_FOUND` screen.
- [ ] **Client-Side Navigation Works**: Clicking internal links within the dashboard transitions smoothly without full page reloads.
- [ ] **Direct Nested URL Works**: Manually refreshing a nested route (e.g., `/settings` or `/dashboard`) loads the page correctly without returning a 404.
- [ ] **Backend Connection Active**: The frontend successfully connects to the Render backend (confirm `NEXT_PUBLIC_API_BASE_URL` is configured in Vercel Environment Variables).
