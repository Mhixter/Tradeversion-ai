---
name: Refer Project Module
description: Trading automation module at /company-admin/refer-project; MetaApi REST connector; real MT5 history + live balance fetching
---

# Refer Project Module

Full trading automation module at `/company-admin/refer-project`. 5 DB tables: `rp_accounts`, `rp_positions`, `rp_logs`, `rp_settings`, `rp_ai_config`.

## Auth
Server-side Bearer token on all routes (`requireRPAdmin`). Also accepts OIDC session (req.user). Token = base64(`email:password`). Credentials hardcoded server-side (single-owner app by design).

## Worker lifecycle
- `workerManager` starts on server boot, recovers all `status=active` accounts
- `AccountWorker` per account: 30s tick loop
- Balance/equity is fetched EVERY tick regardless of `settings.enabled`
- Worker uses **lazy broker connect**: connect() returns ok=true when account is DEPLOYED (even if broker not yet connected). Tick loop calls syncRegionFromProvisioning() + getAccountInfo() every 30s — when client API responds, markConnected() is called. Worker NEVER stops permanently just because MetaApi hasn't connected to the broker yet.

## MetaApi Connector (MetaApiRestConnector)
- Does NOT implement MT5Connector (different connect() return type: { ok, error? } vs boolean)
- Provisioning URL: `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai`
- Client URL: `https://mt-client-api-v1.{region}.agiliumtrade.agiliumtrade.ai`
- **MetaApi plan cannot create accounts (403 on POST /accounts).** provision() ONLY finds existing accounts — throws clear error if login not found. User must click Verify first.
- provision() is PUBLIC (needed by sync-balance route)
- provision() flow:
  1. Fetch full account list (GET /accounts?limit=100)
  2. Validate stored ID belongs to this mt5Login (prevents wrong-account reuse)
  3. Filter by login, prefer CONNECTED > any other state
  4. Save best-match ID to DB
- connect() flow: provision() → deploy (best-effort, 409/422 ok) → tryClientApiAllRegions() → return { ok: true } immediately (lazy: broker connects in background)
- getDealHistory(days) and getRealOpenPositions() call syncRegionFromProvisioning() first (fixes region mismatch)
- KNOWN_REGIONS tried in order: london, vint-hill, new-york, us-east, singapore
- stale-ID clearing only when provisioning GET /accounts/{id} explicitly returns 404

## Live Balance Sync (bypasses worker)
`POST /api/refer-project/accounts/:id/sync-balance`
- Instantiates MetaApiRestConnector directly (no worker needed)
- Calls provision() → finds account by login/stored-ID, saves ID to DB, resolves region
- Calls getAccountInfo() via client API (requires broker CONNECTED on MetaApi)
- On failure: calls connect() to trigger deploy + region update, then retries getAccountInfo() once
- Saves real balance/equity to DB on success
- Returns { balance, equity, margin, freeMargin } + detailed hint if it fails

## Real MT5 History Route
`GET /api/refer-project/accounts/:id/mt5-history?days=30`
- Returns `{ deals, positions, metaApiAccountId }` on success
- Returns 422 if no metaApiAccountId, 503 if no token, 502 if MetaApi unreachable
- Uses `Promise.allSettled` so partial success is possible (warning field if one fails)

## Diagnostic Route
`GET /api/refer-project/accounts/:id/metaapi-status`
- Returns live state from MetaApi provisioning API: id, state, connectionStatus, region, clientApiUrl

## Trade Monitor UI (TradeMonitor.tsx)
Two tabs:
- **Real MT5 Account** — fetches real deal history + open positions from MetaApi client API
- **Bot Trades** — shows positions from rp_positions table (opened by our AI bot)

## Connected Accounts UI (ConnectedAccounts.tsx)
- Shows `#ID` column (DB id) so users can always map "account #4 = ara"
- **Sync Balance button** (dollar sign icon) — calls POST sync-balance, shows spinner on balance cell, shows error inline
- Verify button (wifi icon) — auto-triggers syncBalance after successful live verify
- Balance cell shows red error hint inline if sync fails

## Railway deployment
- Repo: `Mhixter/Tradeversion-ai`, branch `main`, auto-deploy
- After pushing, Railway deploys in ~2 min; no manual restart needed
- Railway Logs show raw console.log output (MetaApiConnector messages) for deep debugging
- **XM account 302504487 verified on XMGlobal-MT5 6** (not XMTrading-MT5 6)
- Deployment logs visible in Replit "Deployment logs" tab (proxied from Railway)

## Key constraints
- MetaApi plan: can READ/DEPLOY accounts but cannot CREATE (403). Always use Verify button to register.
- The account sometimes takes >2 min for broker connection — worker retries every 30s silently
- Simulated balance ($16k) was from old SimulatedMT5Connector; no simulation fallback in current code
- **Sync Balance button** is the fastest way to get real balance — no worker dependency, just click it
