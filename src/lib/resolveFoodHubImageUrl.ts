export function resolveFoodHubCatalogImageUrl(
  value?: string | null,
): string | null {
  const url = String(value ?? "").trim();

  if (!url) {
    return null;
  }

  // Already a complete remote URL.
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  // If value is a Media UUID (e.g. "ec7bf8c1-b30b-4409-a21f-06d874feb607")
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url)) {
    return `/api/media/${url}/file`;
  }

  if (url.startsWith("/api/v1/media/")) {
    const mediaPath = url.replace("/api/v1/media/", "/api/media/");
    return mediaPath.match(/^\/api\/media\/[0-9a-f-]{36}$/i)
      ? `${mediaPath}/file`
      : mediaPath;
  }

  if (url.startsWith("api/v1/media/")) {
    const mediaPath = `/${url.replace("api/v1/media/", "api/media/")}`;
    return mediaPath.match(/^\/api\/media\/[0-9a-f-]{36}$/i)
      ? `${mediaPath}/file`
      : mediaPath;
  }

  if (url.startsWith("/api/media/")) {
    return url.match(/^\/api\/media\/[0-9a-f-]{36}$/i)
      ? `${url}/file`
      : url;
  }

  if (url.startsWith("api/media/")) {
    const mediaPath = `/${url}`;
    return mediaPath.match(/^\/api\/media\/[0-9a-f-]{36}$/i)
      ? `${mediaPath}/file`
      : mediaPath;
  }

  if (url.startsWith("/api/v1/catalog/")) {
    return url.replace(
      "/api/v1/catalog/",
      "/api/catalog/",
    );
  }

  if (url.startsWith("api/v1/catalog/")) {
    return `/${url.replace(
      "api/v1/catalog/",
      "api/catalog/",
    )}`;
  }

  if (url.startsWith("/api/catalog/")) {
    return url;
  }

  return url.startsWith("/")
    ? url
    : `/${url}`;
}
