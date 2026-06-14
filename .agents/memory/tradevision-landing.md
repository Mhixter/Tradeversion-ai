---
name: TradeVision Landing Page
description: How the landing page routing and mobile/desktop split works
---

# Landing Page Architecture

## Routing
- Unauthenticated users hit `PublicRouter` which has a catch-all `<Route>` rendering `<Landing onLogin={login} />`
- This means `/` and any unknown route shows the full landing page (NOT LoginGate)
- `/faq`, `/blog`, `/contact`, `/signup`, etc. have their own routes above the catch-all

## Mobile vs Desktop split
- `<MobileOnboarding>` renders with `lg:hidden fixed inset-0` — hidden at ≥1024px
- Desktop landing is `<div className="hidden lg:block">` — visible at ≥1024px
- Both render in the DOM; CSS breakpoints control visibility

## Key lesson
- The old catch-all was `<LoginGate>` which caused desktop visitors to see a simple sign-in box instead of the full landing page
- Fix: replace catch-all with `<Landing onLogin={login} />`

## Color policy
- NO violet, purple, indigo anywhere in the app
- Primary = lemon green `hsl(82 78% 42%)`
- Gradients: `from-primary to-emerald-*` or `from-primary to-lime-*`
- Semantic blues preserved only for: VISA brand (Settings), PayPal brand, Manager role distinction
