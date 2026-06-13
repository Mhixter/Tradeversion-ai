---
name: Replit Artifact Dynamic Port
description: Replit artifact workflows inject a dynamic PORT env var; overriding it causes 502 on the external URL.
---

## Rule
Never hardcode `PORT=<number>` in the dev script of a Replit artifact workflow.

**Why:** Replit's artifact proxy assigns a dynamic port (e.g., 18792) to each artifact and injects it as `PORT`. The proxy routes external HTTPS traffic to that dynamically assigned port. If the dev script overrides `PORT` with a hardcoded value (e.g., `PORT=5000`), the app listens on the wrong port and the proxy cannot connect → HTTP 502 on the external URL.

**How to apply:**
- For `artifacts/tradevision` (and any future web artifact): set `PORT` only as a fallback default inside `vite.config.ts` (`process.env.PORT ?? "5000"`), but do NOT set `PORT=5000` in the npm/pnpm dev script.
- Other env vars (API_PORT, BASE_PATH, NODE_ENV) can stay in the script — only `PORT` must not be overridden.
- The API server (`artifacts/api-server`) is an internal service, not a webview artifact; it can keep `PORT=8081` hardcoded because the proxy doesn't route to it directly.
- Symptom of this bug: `curl localhost:<correct-port>` returns 200, but external HTTPS domain returns 502 with `content-length: 0` and no error body.
