# TradeVision AI

An enterprise AI trading automation platform. Users can automate trading strategies, copy top traders, manage risk in real time, and connect brokers — powered by institutional-grade AI running 24/7.

## Run & Operate

- **Frontend** — `pnpm --filter @workspace/tradevision run dev` (port 5000, webview)
- **API server** — `pnpm --filter @workspace/api-server run dev` (port 8081, console)
- **DB schema push** — `pnpm --filter @workspace/db run push` (dev only, uses `DATABASE_URL`)
- **Production seed** — `pnpm --filter @workspace/scripts run seed:prod` (idempotent)
- **API codegen** — `pnpm --filter @workspace/api-spec run codegen` (regenerate hooks + Zod schemas from OpenAPI spec)
- **Typecheck** — `pnpm run typecheck`

## Required environment

| Secret | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-provided by Replit DB) |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/tradevision)
- **API**: Express 5 (artifacts/api-server, port 8081)
- **DB**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod (zod/v4), drizzle-zod
- **Auth**: Replit OIDC (openid-client), session via cookie
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec`)

## Where things live

| Path | Purpose |
|---|---|
| `artifacts/tradevision/src/` | React frontend (pages, components, hooks) |
| `artifacts/api-server/src/` | Express API (routes, middleware, lib) |
| `lib/db/src/schema/` | Drizzle schema — source of truth for DB shape |
| `lib/api-spec/` | OpenAPI spec — source of truth for API contract |
| `lib/api-client-react/` | Generated React Query hooks (from codegen) |
| `lib/api-zod/` | Generated Zod schemas (from codegen) |
| `scripts/` | Seed scripts and post-merge setup |

## Architecture decisions

- Session auth via HTTP-only cookie (not Authorization header) — required for Replit OIDC proxy.
- `upsertUser` has an email-conflict fallback: updates by email when the OIDC `id` differs (handles re-linked accounts).
- Company setup (`POST /api/company/setup`) auto-creates the owner member record + 3 default departments.
- All dashboard/analytics/trades routes return 0/empty when no broker is configured — no fake data.
- Trade execution requires real broker equity; `execute` endpoint validates this before placing orders.

## Product

- **Landing page** — marketing site with pricing, product tour, and sign-up CTA
- **Dashboard** — portfolio overview, P&L, positions, and live signals
- **Bots** — create, configure, start/stop/pause AI trading bots with 8 built-in strategy templates
- **Strategy marketplace** — browse and copy community strategies
- **Risk management** — configurable risk profiles per bot/account
- **Backtesting** — historical strategy testing
- **Company admin** — 10-tab admin portal at `/company-admin` (members, departments, billing, KYC, etc.)
- **Broker connections** — connect real brokers; analytics populate once connected

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT hardcode `PORT` in the tradevision dev script — Replit artifact workflows inject it dynamically.
- After any DB schema change, run `pnpm --filter @workspace/db run push` before restarting the API.
- After any API spec change, run codegen before touching the frontend hooks.
- `zod` must be an explicit dependency in `api-server` (not just a transitive dep) — required for Zod v4 resolution.
