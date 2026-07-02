/**
 * Shared API helpers for Refer Project pages.
 * Auth strategy (in priority order):
 *  1. OIDC session cookie — sent automatically via credentials:'include' (works on Railway/production)
 *  2. Bearer token in sessionStorage — fallback for legacy portal login flow
 */
const TOKEN_KEY = "rp_admin_token";

function authHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function getHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
  if (!token) return {};
  return { "Authorization": `Bearer ${token}` };
}

export async function rpGet(path: string): Promise<Response> {
  return fetch(path, { headers: getHeaders(), credentials: "include" });
}

export async function rpPost(path: string, body?: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: body !== undefined ? authHeaders() : getHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
}

export async function rpPatch(path: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });
}

export async function rpDelete(path: string): Promise<Response> {
  return fetch(path, { method: "DELETE", headers: getHeaders(), credentials: "include" });
}

/** Store the admin token on login (called from CompanyAdminPortal after successful auth). */
export function storeRPToken(email: string, password: string): void {
  const token = btoa(`${email}:${password}`);
  sessionStorage.setItem(TOKEN_KEY, token);
}
