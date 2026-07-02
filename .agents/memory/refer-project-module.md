---
name: Refer Project Module
description: XM MT5 trading automation admin module — architecture, auth pattern, and critical constraints.
---

## What it is
Isolated admin-only trading automation module accessible at `/company-admin/refer-project`.
Completely separate from the existing trading engine — zero impact when disabled.

## Key architecture decisions

**Auth pattern (both layers):**
- Frontend: `ReferProject/index.tsx` checks `sessionStorage["company_admin_session"]`; if missing, redirects to `/company-admin`.
- Backend: all `/api/refer-project/*` routes gated by `requireRPAdmin` middleware (`Authorization: Bearer base64(email:pass)`).
- Token stored to sessionStorage `rp_admin_token` by `storeRPToken()` called in CompanyAdminPortal after successful login.
- All 8 sub-pages use `rpGet/rpPost/rpPatch/rpDelete` from `ReferProject/rpApi.ts` — never raw fetch.

**DB tables (all use `rp_` prefix, pushed with drizzle-kit push):**
- `rp_settings` — singleton (id=1), module on/off + all trading rules
- `rp_accounts` — XM MT5 accounts (credentials stored in DB; never returned via API — sanitizeAccount strips them)
- `rp_positions` — open/closed trades with timer and AI confidence
- `rp_logs` — all events (rpLog() is fire-and-forget, never throws)
- `rp_ai_config` — singleton (id=1), indicator weights + signal thresholds

**Worker lifecycle:**
- `workerManager.start()` called on API server boot (fire-and-forget in app.ts); restores workers for all active accounts.
- One `AccountWorker` per account — 30s tick interval, reconnects automatically.
- Position limit enforcement: `openedThisTick` counter tracks per-tick opens; `openBySymbol` map updated after each open for correct per-symbol cap.

**Why:** Keep the module fully isolated so it can be enabled/disabled without touching the existing app.

## Route structure
`/api/refer-project/settings` GET/PATCH  
`/api/refer-project/ai-config` GET/PATCH  
`/api/refer-project/accounts` GET/POST + /:id DELETE/PUT/start/stop/test-connection  
`/api/refer-project/dashboard` GET  
`/api/refer-project/positions` GET  
`/api/refer-project/stats` GET  
`/api/refer-project/logs` GET  

## Frontend pages (all at ReferProject/)
index.tsx (router/sidebar), Dashboard.tsx, ConnectedAccounts.tsx, TradingRules.tsx, AIDecisionEngine.tsx, TradeMonitor.tsx, Statistics.tsx, Logs.tsx, Settings.tsx

## Navigation entry point
CompanyAdminPortal.tsx Quick Actions section — "Refer Project" button navigates via `window.location.href`.
App.tsx AppRouter checks `/company-admin/refer-project` BEFORE the generic `/company-admin` guard.

## MT5 connectivity
Currently simulated via `SimulatedMT5Connector` (random-walk price model, shared singleton).
Real MT5 requires MetaApi.cloud or Python bridge — swap `SimulatedMT5Connector` for a real implementation of the `MT5Connector` interface in accountWorker.ts constructor.
