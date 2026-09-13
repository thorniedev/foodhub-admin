export const DEFAULT_AUTH_RETURN_PATH = "/";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

/**
 * Only allow application-local redirect paths.
 *
 * Besides protocol-relative URLs, backslashes are rejected because URL
 * parsers can normalize them into slashes and accidentally create an
 * external redirect.
 */
export function getSafeAuthReturnPath(
  value: string | null | undefined,
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    CONTROL_CHARACTER_PATTERN.test(value)
  ) {
    return DEFAULT_AUTH_RETURN_PATH;
  }

  return value;
}

export function createAuthReturnUrl(
  value: string | null | undefined,
  appUrl: string,
): URL {
  const baseUrl = new URL(appUrl.endsWith("/") ? appUrl : `${appUrl}/`);
  const returnUrl = new URL(getSafeAuthReturnPath(value), baseUrl);

  if (returnUrl.origin !== baseUrl.origin) {
    return new URL(DEFAULT_AUTH_RETURN_PATH, baseUrl);
  }

  return returnUrl;
}

export function getEffectiveAppUrl(request: { nextUrl: URL }): string {
  // If accessed via localhost or 127.0.0.1, always preserve localhost origin & port
  if (
    request.nextUrl.hostname === "localhost" ||
    request.nextUrl.hostname === "127.0.0.1"
  ) {
    return request.nextUrl.origin;
  }

  const configured =
    process.env.ADMIN_APP_URL || process.env.APP_URL;

  if (configured && process.env.NODE_ENV !== "development") {
    return configured;
  }

  return request.nextUrl.origin;
}
