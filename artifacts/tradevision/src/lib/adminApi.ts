function normalizeApiBaseUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.origin;
  } catch {
    return "";
  }
}

const configuredApiBase = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const fallbackApiBase = window.location.origin;
const apiBase = configuredApiBase || fallbackApiBase;

export function buildAdminApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`/api${normalizedPath}`, apiBase).toString();
}
