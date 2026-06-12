---
name: TradeVision Admin Portal
description: Full platform admin portal at /company-admin with 8 management tabs
---

## Route
`/company-admin` — handled in App.tsx AppRouter, bypasses Replit OIDC auth entirely.

## Credentials
Hardcoded in `artifacts/api-server/src/routes/companyadmin.ts`:
- Email: saidumuhammed664@gmail.com
- Pass: Mhixter664@gmail.com
- Never expose in logs.

## Admin Tabs
1. **Overview** — stats + quick actions panel
2. **Companies** — all registered companies
3. **Users** — all platform users
4. **Bot Control** — start/stop/pause individual bots or all at once
5. **Billing** — revenue stats, plan breakdown, payment gateway config (Stripe/PayPal/Crypto)
6. **Support** — ticket management with status updates
7. **Live Accounts** — trading account monitoring + suspend/activate
8. **Roles** — RBAC role/permission overview

## API Endpoints (all under /api/company-admin/)
- POST auth, GET stats, GET companies, GET users
- GET/POST bots, POST bots/:id/start|stop|pause, POST bots/start-all|stop-all
- GET billing, GET/PATCH support/:id, GET live-accounts, POST live-accounts/:id/suspend|activate
- GET roles, PATCH members/:id/role

## Sidebar Link
Admin portal link added to sidebar bottom (opens in new tab).
Company management removed from regular sidebar nav (admin-only).
