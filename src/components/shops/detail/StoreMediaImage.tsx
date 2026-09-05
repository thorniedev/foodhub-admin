"use client";

import { Loader2, Store as StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const mediaUrlCache = new Map<string, string>();
const pendingMediaRequests = new Map<string, Promise<string | null>>();

interface StoreMediaImageProps {
  mediaUuid?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIcon?: React.ReactNode;
}

export default function StoreMediaImage({
  mediaUuid,
  alt,
  className = "h-full w-full object-cover",
  fallbackClassName = "",
  fallbackIcon,
}: StoreMediaImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    if (!mediaUuid || !String(mediaUuid).trim()) return null;
    const raw = String(mediaUuid).trim();
    if (
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("blob:") ||
      raw.startsWith("data:") ||
      raw.startsWith("/Image/") ||
      raw.startsWith("/images/")
    ) {
      return raw;
    }
    if (
      raw.startsWith("/api/v1/") ||
      raw.startsWith("/api/") ||
      raw.startsWith("api/")
    ) {
      return resolveFoodHubCatalogImageUrl(raw) || raw;
    }
    const cleanUuid = raw
      .replace(/^\/api\/(v1\/)?media\//, "")
      .replace(/\/access-url$/, "")
      .trim();
    return mediaUrlCache.get(cleanUuid) ?? null;
  });
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!mediaUuid || !String(mediaUuid).trim()) {
      setImageUrl(null);
      setFailed(false);
      setLoading(false);
      return;
    }

    const raw = String(mediaUuid).trim();

    // 1. If it is already a direct URL (remote, data URL, blob, or public image path)
    if (
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("blob:") ||
      raw.startsWith("data:") ||
      raw.startsWith("/Image/") ||
      raw.startsWith("/images/")
    ) {
      setImageUrl(raw);
      setFailed(false);
      setLoading(false);
      return;
    }

    // 2. If it is a catalog or media proxy path
    if (
      raw.startsWith("/api/v1/") ||
      raw.startsWith("/api/") ||
      raw.startsWith("api/")
    ) {
      const resolved = resolveFoodHubCatalogImageUrl(raw);
      setImageUrl(resolved || raw);
      setFailed(false);
      setLoading(false);
      return;
    }

    // 3. Extract pure UUID if embedded in a path
    const cleanUuid = raw
      .replace(/^\/api\/(v1\/)?media\//, "")
      .replace(/\/access-url$/, "")
      .trim();

    if (UUID_REGEX.test(cleanUuid)) {
      if (mediaUrlCache.has(cleanUuid)) {
        setImageUrl(mediaUrlCache.get(cleanUuid)!);
        setFailed(false);
        setLoading(false);
        return;
      }

      async function fetchAccessUrl() {
        try {
          setLoading(true);
          setFailed(false);

          if (pendingMediaRequests.has(cleanUuid)) {
            const cachedUrl = await pendingMediaRequests.get(cleanUuid);
            if (!cancelled && cachedUrl) {
              setImageUrl(cachedUrl);
              setLoading(false);
              return;
            }
          }

          const fetchPromise = (async () => {
            try {
              const response = await fetch(
                `/api/media/${encodeURIComponent(cleanUuid)}/access-url`,
                {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                },
              );

              if (response.ok) {
                const data = await response.json();
                const extracted =
                  data?.url ||
                  data?.payload?.url ||
                  data?.data?.url ||
                  data?.accessUrl ||
                  data?.payload?.accessUrl ||
                  data?.data?.accessUrl;

                if (typeof extracted === "string" && extracted.trim()) {
                  return extracted.trim();
                }
              }
            } catch {
              // Ignore and fall through to proxy file
            }
            return `/api/media/${cleanUuid}/file`;
          })();

          pendingMediaRequests.set(cleanUuid, fetchPromise);
          const finalUrl = await fetchPromise;
          pendingMediaRequests.delete(cleanUuid);

          if (finalUrl) {
            mediaUrlCache.set(cleanUuid, finalUrl);
            if (!cancelled) {
              setImageUrl(finalUrl);
            }
          }
        } catch (_err) {
          if (!cancelled) {
            const fallbackFile = `/api/media/${cleanUuid}/file`;
            mediaUrlCache.set(cleanUuid, fallbackFile);
            setImageUrl(fallbackFile);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      void fetchAccessUrl();
    } else {
      const resolved = resolveFoodHubCatalogImageUrl(raw);
      setImageUrl(resolved || raw);
      setLoading(false);
      setFailed(false);
    }

    return () => {
      cancelled = true;
    };
  }, [mediaUuid]);

  if (loading) {
    if (fallbackIcon) {
      return <>{fallbackIcon}</>;
    }
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-50 ${fallbackClassName}`}
      >
        <Loader2 size={18} className="animate-spin text-[#137A3D]" />
      </div>
    );
  }

  if (!imageUrl || failed) {
    if (fallbackIcon) {
      return <>{fallbackIcon}</>;
    }
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-50 text-gray-400 ${fallbackClassName}`}
      >
        <StoreIcon size={20} className="text-primary-800 shrink-0" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => {
        const cleanUuid = String(mediaUuid ?? "")
          .trim()
          .replace(/^\/api\/(v1\/)?media\//, "")
          .replace(/\/access-url$/, "")
          .replace(/\/file$/, "")
          .trim();
        const fallbackUrl = `/api/media/${cleanUuid}/file`;

        if (UUID_REGEX.test(cleanUuid) && imageUrl !== fallbackUrl) {
          setImageUrl(fallbackUrl);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
