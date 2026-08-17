// export function resolveFoodHubCatalogImageUrl(
//   value?: string | null,
// ): string | null {
//   const url = String(value ?? "").trim();

//   if (!url) {
//     return null;
//   }

//   // Already a complete remote URL.
//   if (
//     url.startsWith("http://") ||
//     url.startsWith("https://") ||
//     url.startsWith("blob:") ||
//     url.startsWith("data:")
//   ) {
//     return url;
//   }

//   /*
//    * Backend list/detail responses currently return image paths like:
//    *
//    * /api/v1/catalog/menu-items/{uuid}/images/1
//    * /api/v1/catalog/foods/{uuid}/images/1
//    *
//    * The Admin app does NOT expose /api/v1/catalog/*.
//    * It exposes /api/catalog/* through:
//    *
//    * src/app/api/catalog/[...path]/route.ts
//    *
//    * Therefore rewrite backend-relative paths to the local Next.js proxy.
//    */
//   if (url.startsWith("/api/v1/catalog/")) {
//     return url.replace(
//       "/api/v1/catalog/",
//       "/api/catalog/",
//     );
//   }

//   if (url.startsWith("api/v1/catalog/")) {
//     return `/${url.replace(
//       "api/v1/catalog/",
//       "api/catalog/",
//     )}`;
//   }

//   if (url.startsWith("/api/catalog/")) {
//     return url;
//   }

//   return url.startsWith("/")
//     ? url
//     : `/${url}`;
// }
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
    return `/api/media/${url}`;
  }

  if (url.startsWith("/api/v1/media/")) {
    return url.replace("/api/v1/media/", "/api/media/");
  }

  if (url.startsWith("api/v1/media/")) {
    return `/${url.replace("api/v1/media/", "api/media/")}`;
  }

  if (url.startsWith("/api/media/")) {
    return url;
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
