---
name: TradeVision Mock Data Policy
description: Which routes are real DB, which are static platform content, and what was removed vs kept.
---

## What was cleaned up (removed hardcoded fallbacks)

### API routes — now return 0/empty when no real data:
- `dashboard/summary` — totalEquity, dailyProfit, activeBots all return real DB values; 0 when no brokers/bots configured
- `dashboard/equity-curve` — returns [] when no snapshots and equity=0; no more sin/cos fake curve
- `dashboard/signals` — now generated dynamically from strategyEngine for 4 pairs (not static JSON)
- `dashboard/recent-trades` — returns [] when no trades
- `dashboard/active-bots` — returns [] when no running bots
- `dashboard/connected-accounts` — returns [] when no brokers
- `trades/analytics` — returns 0s when no trades (was hardcoded 126/99/12540.75)
- `bots/stats` — avgWinRate returns 0 (not 68.4); newBotsThisWeek computed from DB createdAt
- `analytics/summary` — returns all zeros when no snapshots (was hardcoded 2.14/2.87 etc)
- `analytics/snapshot` (POST) — uses real broker equity/balance instead of hardcoded $245k
- `marketplace/highlights` — computed from actual marketplaceTable data
- `marketplace/top-authors` — aggregated from marketplaceTable
- `companyadmin/stats` — revenue from subscriptionsTable; openTickets=0 (not hardcoded 7)
- `companyadmin/billing` — transactions from subscriptionsTable; user names from usersTable
- `companyadmin/support` — returns [] (no fake support tickets)
- `companyadmin/live-accounts` — returns real brokersTable data (not Math.random() balances)

## What is intentionally static platform content (OK to keep)
- `copytrading/traders` — 5 platform-curated trader profiles (public marketplace content)
- `copytrading/strategies` — 5 strategy profile descriptions
- `billing/plans` — PLANS array (product catalog, not user data)
- `riskcenter/stress-tests` — scenario-based stress test with real equity as base (percentages are fixed financial model)

## Bots execute — now requires real broker
- `POST /bots/:id/execute` requires a configured broker in DB
- Returns 400 if no broker or equity=0
- Saves trade to `tradesTable`, updates bot PnL, updates broker equity/profit in DB
- Trade size = 1% of equity in lots (min 0.01)

## New endpoint
- `PATCH /api/brokers/:id` — update broker equity/balance/status after connecting

## Frontend
- `Portfolio.tsx` — replaced fake EURUSD candlestick chart with real AreaChart from `useGetPortfolioEquityCurve()`; shows "connect a broker" message when no data
- `CopyTrading.tsx` — trader list from API (static content), following returns [] from API
