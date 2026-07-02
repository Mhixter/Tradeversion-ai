/**
 * Shared API helpers for Refer Project pages.
 * Automatically injects the admin Bearer token on every request.
 */
const TOKEN_KEY = "rp_admin_token";

function authHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

function getHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
  return { "Authorization": `Bearer ${token}` };
}

export async function rpGet(path: string): Promise<Response> {
  return fetch(path, { headers: getHeaders() });
}

export async function rpPost(path: string, body?: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: body !== undefined ? authHeaders() : getHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function rpPatch(path: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

export async function rpDelete(path: string): Promise<Response> {
  return fetch(path, { method: "DELETE", headers: getHeaders() });
}

/** Store the admin token on login (called from CompanyAdminPortal after successful auth). */
export function storeRPToken(email: string, password: string): void {
  const token = btoa(`${email}:${password}`);
  sessionStorage.setItem(TOKEN_KEY, token);
}
