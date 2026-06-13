---
name: TradeVision Workflows
description: Active artifact workflows, port rules, and rebuild behavior.
---

## Active Workflows

**`artifacts/api-server: API Server`**
- Dev script: `export PORT=8081 NODE_ENV=development && pnpm run build && pnpm run start`
- Port: 8081 (hardcoded — OK for internal service, not a webview artifact)
- **IMPORTANT**: This server builds-then-starts and does NOT watch for file changes. Any route or code change requires a workflow restart to take effect.

**`artifacts/tradevision: web`**
- Dev script: `BASE_PATH=/ API_PORT=8081 vite --config vite.config.ts --host 0.0.0.0`
- Port: injected dynamically by Replit (e.g. 18792). **Never hardcode `PORT=` in this script** — Replit's proxy routes the external domain to this dynamic port; overriding it causes 502.
- Vite HMR works — frontend changes appear immediately without restart.

## Proxy
Vite proxies `/api/*` → `http://localhost:8081` and `/ws` → `ws://localhost:8081` (see vite.config.ts).

## Why Artifact Workflows
The old "Project" parallel runner + "API Server" + "TradeVision" standalone workflows caused port-conflict loops. Deleted those; the Replit artifact workflows (`artifacts/…`) are the correct mechanism — they register with the Replit proxy and handle dynamic port injection.
