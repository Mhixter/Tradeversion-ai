const APP_BASE_PATH = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function normalizeApiBaseUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, "").replace(/\/api$/, "");
    return `${parsed.origin}${normalizedPath}`;
  } catch {
    return "";
  }
}

const configuredApiBase = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const fallbackApiBase = `${window.location.origin}${APP_BASE_PATH}`;
const apiBase = configuredApiBase || fallbackApiBase;

export function buildAdminApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase}/api${normalizedPath}`;
}
