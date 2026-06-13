---
name: TradeVision Admin Portal
description: Full platform admin portal at /company-admin with 10 management tabs, credentials, and implemented features.
---

## Route
`/company-admin` — handled in App.tsx AppRouter, bypasses Replit OIDC auth entirely.

## Credentials
Hardcoded in `artifacts/api-server/src/routes/companyadmin.ts`:
- Email: saidumuhammed664@gmail.com
- Pass: Mhixter664@gmail.com
- Never expose in logs.

## Admin Tabs (10)
1. **Overview** — stats + quick actions panel
2. **Companies** — all registered companies
3. **Users** — all platform users
4. **Bots** — start/stop/pause individual bots or all at once
5. **Live Test** — LiveTradingTerminal paper trading
6. **Billing** — revenue stats, plan breakdown, payment gateway config (Stripe/PayPal/Crypto modal)
7. **Support** — ticket management with status updates
8. **Live Accounts** — trading account monitoring + suspend/activate
9. **Roles** — RBAC with invite member form + inline role editor
10. **Testimonials** — add/edit/reorder/delete landing page testimonials

## API Endpoints (all under /api/company-admin/)
- POST auth, GET stats, GET companies, GET users
- GET/POST bots, POST bots/:id/start|stop|pause, POST bots/start-all|stop-all
- GET billing, GET/PATCH support/:id, GET live-accounts, POST live-accounts/:id/suspend|activate
- GET roles, PATCH members/:id/role
- POST invite-member (takes email, companyId, role — creates user + member record)
- POST payment-gateway/:name/configure (Stripe/PayPal/Crypto — saves to localStorage)

## DB Schema Note
- All IDs in companiesTable, companyMembersTable are `varchar` — never parseInt them
- `companyMembersTable.id` default is string literal "gen_random_uuid()", not sql function
