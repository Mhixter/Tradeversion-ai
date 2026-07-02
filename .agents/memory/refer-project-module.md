---
name: Refer Project Module
description: Trading automation module at /company-admin/refer-project; MetaApi REST connector; real MT5 history fetching
---

# Refer Project Module

Full trading automation module at `/company-admin/refer-project`. 5 DB tables: `rp_accounts`, `rp_positions`, `rp_logs`, `rp_settings`, `rp_ai_config`.

## Auth
Server-side Bearer token on all routes (`requireRPAdmin`). Also accepts OIDC session (req.user). Token = base64(`email:password`).

## Worker lifecycle
- `workerManager` starts on server boot, recovers all `status=active` accounts
- `AccountWorker` per account: 30s tick loop
- Balance/equity is fetched EVERY tick regardless of `settings.enabled`
- When MetaApi connect() fails → worker stops with `status=error` (no simulation fallback since 2026-07-02)

## MetaApi Connector (MetaApiRestConnector)
- Provisioning URL: `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai`
- Client URL: `https://mt-client-api-v1.{region}.agiliumtrade.agiliumtrade.ai`
- connect() flow: provision() → try deploy (best-effort, ignore 409/422) → try clientFetch immediately → poll waitConnected(120s)
- provision() returns true if account already CONNECTED (skips /deploy)
- getDealHistory(days) and getRealOpenPositions() THROW on failure (callers handle errors)

## Real MT5 History Route
`GET /api/refer-project/accounts/:id/mt5-history?days=30`
- Returns `{ deals, positions, metaApiAccountId }` on success
- Returns 422 if no metaApiAccountId, 503 if no token, 502 if MetaApi unreachable
- Uses `Promise.allSettled` so partial success is possible

## Trade Monitor UI (TradeMonitor.tsx)
Two tabs:
- **Real MT5 Account** — fetches real deal history + open positions from MetaApi client API
- **Bot Trades** — shows positions from rp_positions table (opened by our AI bot)

**Why:**
- The simulated connector generated fake balances (10_000 + random * 40_000 = ~$16k)
- Real balance must come from MetaApi `getAccountInfo()` via client API
- Real trade history (manually placed MT5 trades) requires MetaApi history-deals endpoint

## Railway deployment
- Repo: `Mhixter/Tradeversion-ai`, branch `main`, auto-deploy
- After pushing, user must Stop→Start the worker on Connected Accounts page to pick up new code
- Railway Logs show raw console.warn output (MetaApiConnector messages) not in rpLogs UI
