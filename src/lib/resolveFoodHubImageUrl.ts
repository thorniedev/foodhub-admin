const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const MEDIA_PATH_REGEX =
  /^(?:\/?api)?(?:\/v1)?\/media\/([0-9a-fA-F-]+)(?:\/(file|access-url|download))?$/i;

export function resolveFoodHubCatalogImageUrl(
  value?: string | null,
): string | null {
  const url = String(value ?? "").trim();

  if (!url) {
    return null;
  }

  // Already a complete remote URL or browser-local blob/data URL.
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  // Handle /api/v1/media/{uuid} or /api/media/{uuid} (with optional sub-path)
  const mediaMatch = url.match(MEDIA_PATH_REGEX);
  if (mediaMatch) {
    const uuid = mediaMatch[1];
    const action = mediaMatch[2]?.toLowerCase();
    if (action === "access-url") {
      return `/api/media/${uuid}/access-url`;
    }
    return `/api/media/${uuid}/file`;
  }

  // Handle direct UUID strings
  if (UUID_REGEX.test(url)) {
    return `/api/media/${url}/file`;
  }

  // Handle backend-relative catalog paths
  if (url.startsWith("/api/v1/catalog/")) {
    return url.replace("/api/v1/catalog/", "/api/catalog/");
  }

  if (url.startsWith("api/v1/catalog/")) {
    return `/${url.replace("api/v1/catalog/", "api/catalog/")}`;
  }

  if (url.startsWith("/api/catalog/")) {
    return url;
  }

  return url.startsWith("/") ? url : `/${url}`;
}

