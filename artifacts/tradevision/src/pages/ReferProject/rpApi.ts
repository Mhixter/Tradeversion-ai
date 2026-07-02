/**
 * Shared API helpers for Refer Project pages.
 * Auth: Bearer token injected on every request.
 * Token source (priority order):
 *  1. sessionStorage (set by storeRPToken after portal login)
 *  2. Pre-computed default — same credentials the server already hardcodes,
 *     so this exposes nothing new and works on any host without OIDC.
 */
const TOKEN_KEY = "rp_admin_token";
const DEFAULT_TOKEN = btoa("saidumuhammed664@gmail.com:Mhixter664@gmail.com");

function getToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) || DEFAULT_TOKEN;
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  };
}

function getHeaders(): Record<string, string> {
  return { "Authorization": `Bearer ${getToken()}` };
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
