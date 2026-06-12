---
name: TradeVision Workflows
description: Two-workflow setup for frontend and API server; vite proxy for /api
---

## Workflow Setup

Two separate workflows configured:

**API Server**
- Command: `PORT=8081 pnpm --filter @workspace/api-server dev`
- Port: 8081
- Type: console

**TradeVision (Frontend)**
- Command: `PORT=8080 BASE_PATH=/ API_PORT=8081 pnpm --filter @workspace/tradevision dev`
- Port: 8080 (maps to external port 80)
- Type: webview

## Vite Proxy
Vite dev server proxies `/api/*` to `http://localhost:8081` (controlled by `API_PORT` env var). This is in `artifacts/tradevision/vite.config.ts`.

**Why:** The frontend and backend run on separate ports; Vite's proxy is the cleanest way to forward /api calls in dev without CORS issues.

## Port Mapping (.replit)
- 8080 → 80 (main webview)
- 8081 → 8081 (API, also accessible)
