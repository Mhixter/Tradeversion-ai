---
name: Refer Project Module
description: Trading automation panel at /company-admin/refer-project — DB schema, MetaApi integration, worker architecture, auth.
---

## Module location
`artifacts/api-server/src/refer-project/` + `artifacts/tradevision/src/pages/ReferProject/`

## DB tables (rp_*)
5 tables: `rp_settings`, `rp_accounts`, `rp_positions`, `rp_logs`, `rp_ai_config`.
`rp_accounts` has `metaApiAccountId` (varchar) and `verificationStatus` (varchar: unverified|verifying|verified|failed).

## Auth
Server-side Bearer token on all routes (`requireRPAdmin`). Token = `base64(email:pass)` hardcoded in `routes.ts`. All account responses go through `sanitizeAccount()` — strips `tradingPassword`/`investorPassword` including the `PUT /accounts/:id` response.

## Connector architecture
`MT5Connector` interface in `mt5Connector.ts`. Two impls:
- `SimulatedMT5Connector` — random-walk prices, shared `simulator` singleton
- `MetaApiRestConnector` (`metaApiConnector.ts`) — MetaApi REST API via native fetch; real balance/equity/positions; simulated candles/ticks/trade execution

`AccountWorker.initConnector()` (inside startup try/catch): uses MetaApiRestConnector when `METAAPI_TOKEN` env var is set AND account has `tradingPassword` in DB; falls back to SimulatedMT5Connector otherwise. If MetaApi connect fails (network/creds), worker falls back to simulation rather than erroring.

## Zero-balance suppression
In `accountWorker.tick()`: when `usingMetaApi && currentBalance === 0`, trade opening is skipped silently (no log spam). Sim mode is never suppressed.

## MetaApi 204 handling
`provFetch`/`clientFetch` check `res.status === 204` before calling `res.json()` — returns `undefined` safely. Never use string-matching on error messages to detect 204.

## Verification status semantics
`verifyMetaApiAccount()` returns `{ tokenValid, accountFound }`.
- `accountFound` → "verified" (account is provisioned on MetaApi)
- `tokenValid && !accountFound` → stays "unverified" (token works, not yet provisioned)
- `!tokenValid` → "failed"
Do NOT map `tokenValid` alone to "verified" — that's a false positive.

## Replit dev network
MetaApi provisioning domain (`mt-provisioning-api-v1.agiliumtrade.ai`) is DNS-blocked in the Replit dev sandbox. The fallback path to simulation handles this. Live MetaApi data works only in deployed (production) environment.

## Worker boot
`workerManager.start()` called fire-and-forget in `app.ts`. Restores all accounts with `status = active` from DB on boot.
