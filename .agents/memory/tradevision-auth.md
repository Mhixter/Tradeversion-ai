---
name: TradeVision Auth Architecture
description: Replit OIDC auth setup, upsertUser fix, session handling, and known quirks.
---

## Auth Flow
- Uses Replit OIDC (`https://replit.com/oidc`) via `openid-client`
- `REPL_ID` is the OAuth client ID (auto-provided by Replit)
- Session stored in DB (`sessions` table) via cookie `sid`
- Login: `GET /api/login` → Replit OIDC → `GET /api/callback` → upsertUser → session cookie

## Critical: upsertUser fix
The `upsertUser` function in `artifacts/api-server/src/routes/auth.ts` must NOT include `id` in the `onConflictDoUpdate` SET clause. Including it causes a PostgreSQL error.

**Correct pattern:**
```typescript
.onConflictDoUpdate({
  target: usersTable.id,
  set: {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    profileImageUrl: userData.profileImageUrl,
    updatedAt: new Date(),
  },
})
```

**Why:** PostgreSQL rejects updating the primary key column in the DO UPDATE SET when it's also the conflict target.

## User IDs
- Replit OIDC sets `claims.sub` to the Replit numeric user ID (e.g. `"60831311"`)
- `usersTable.id` is `varchar` (not uuid), accepts numeric strings fine
- Google profile picture is passed through via `claims.picture`

## Zod
Must be explicit dep in `artifacts/api-server/package.json` — do not rely on transitive.

## LoginGate
- All sign-in buttons (Google, Apple, Sign In) call `onLogin()` → redirects to `/api/login` → Replit OIDC
- The "Continue with Google/Apple" buttons are UI labels; actual auth goes through Replit's OIDC page
