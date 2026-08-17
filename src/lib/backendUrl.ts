export function getBackendApiBaseUrl(): string {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:7070/api/v1";

  const clean = configured.trim().replace(/\/+$/, "");

  if (clean.endsWith("/api/v1")) {
    return clean;
  }

  return `${clean}/api/v1`;
}
