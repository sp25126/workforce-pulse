# Architecture

Workforce Pulse is structured as a modern monorepo with distinct separation of concerns:

## Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Role**: Presentation layer. Responsible for rendering the UI, routing, and managing client-side state. Communicates with the backend exclusively via REST APIs.

## Backend (`/backend`)
- **Framework**: FastAPI
- **Language**: Python
- **Role**: Core application logic, ETL processing, and API layer.
- **Structure**:
  - `/api`: API routes and controllers (FastAPI routers).
  - `/core`: Application configuration and shared utilities (e.g., settings, security).
  - `/services`: Business logic, such as ETL pipelines and data aggregations.
  - `/models`: Database schemas (to be added in Step 2).
  - `/schemas`: Pydantic models for request/response validation.

## Data Flow
1. Client requests data from the Next.js frontend.
2. Next.js fetches data from the FastAPI backend (either via server components or client-side fetch).
3. FastAPI processes the request, utilizing `/services` for business logic.
4. (Future) Services query the database via `/models`.

## Deployment
- **Frontend**: Vercel (Edge-optimized, serverless SSR).
- **Backend**: Railway (Containerized Python environment).
- **Database**: Neon Postgres.
