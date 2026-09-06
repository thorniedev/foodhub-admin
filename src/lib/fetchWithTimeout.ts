/**
 * fetch() with a hard timeout.
 *
 * The Keycloak/backend calls in the auth proxy routes had no timeout of their
 * own, so a slow or wedged upstream left the Next.js route handler pending
 * forever - which left the browser's RTK Query call stuck on isLoading
 * forever too, with no error surfaced and nothing for the UI to react to.
 */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
