# AI Developer Prompts

This document contains concise, reusable prompts to assist developers when working with AI coding assistants on this codebase.

---

## 1. Backend Development Prompt

Use this prompt when asking an AI to add or modify backend APIs or business logic:

```text
Act as a senior FastAPI developer. Analyze the Workforce Pulse backend structure in `/backend`.
We are using Python 3.12.8, FastAPI, and SQLAlchemy 2.0.
When modifying or adding new routes/services:
1. Ensure all database operations and imports of pandas, numpy, and SQLAlchemy are lazy-loaded inside function scopes to avoid module-level startup fragility.
2. Maintain standard route structures and do not introduce database queries or executions at import time.
3. Make sure Pydantic response models and schemas are used for input/output sanitization.
Here is the code I want to modify: [Insert Code / Requirements]
```

---

## 2. Frontend Development Prompt

Use this prompt when asking an AI to modify frontend UI components or pages:

```text
Act as a senior Next.js App Router and TypeScript developer. Analyze the frontend code in `/frontend`.
We use TailwindCSS for styling and React/TypeScript for components.
When modifying pages or UI components:
1. Adhere strictly to the Next.js App Router patterns.
2. Keep component layouts responsive and touch-friendly (supporting mobile viewports).
3. Do not modify the existing UI colors, typography, or theme variables unless requested.
4. Ensure all API calls use the custom base URL configured via NEXT_PUBLIC_API_BASE_URL.
Here is the component to modify: [Insert Component / Code]
```

---

## 3. Debugging Prompt

Use this prompt when hitting errors locally or in production:

```text
Act as an expert software debugger. I am running a FastAPI backend and Next.js frontend.
Here is the error traceback and context:
---
[Insert Traceback / Error Logs]
---
1. Identify the root cause (check if it is related to unpinned versions, database connections, CORS settings, or import-time side-effects).
2. Propose a minimal, stable fix that does not introduce additional dependencies or change the core structure.
```

---

## 4. Deployment Prompt

Use this prompt when preparing for Render or Supabase deployment updates:

```text
Act as a DevOps platform engineer. We deploy our FastAPI backend and Next.js frontend to Render, connected to Supabase.
Here is our current render.yaml configuration:
---
[Insert render.yaml or build logs]
---
Identify if there are any risks of build compilation errors (such as missing pre-compiled wheels), improper start commands, or incorrect environment variables. Give a direct solution.
```

---

## 5. Bring Your Own Key (BYOK) Integration Prompt

Use this prompt when extending or updating the BYOK encryption/fallback settings:

```text
Act as a security-minded developer. In `/backend/app/services/ai_settings.py`, we manage BYOK settings by encrypting keys using cryptography Fernet before persisting them to PostgreSQL/Supabase, falling back to local memory memory cache if the DB is offline.
Help me implement the following changes while ensuring:
1. API keys are never exposed in logs or API responses (they must remain encrypted in DB and redacted in output schemas).
2. The database operations do not block startup imports (use local imports).
[Insert BYOK changes requested]
```
