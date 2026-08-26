"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface BannerMediaImageProps {
  mediaUrlOrUuid?: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onImageResolved?: (url: string) => void;
}

export default function BannerMediaImage({
  mediaUrlOrUuid,
  alt,
  className = "h-full w-full object-cover",
  fallbackIcon,
  onImageResolved,
}: BannerMediaImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!mediaUrlOrUuid || !String(mediaUrlOrUuid).trim()) {
      setImageUrl(null);
      setFailed(false);
      setLoading(false);
      return;
    }

    const raw = String(mediaUrlOrUuid).trim();

    // 1. Direct web / data / blob URL
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
      onImageResolved?.(raw);
      return;
    }

    // 2. Extract UUID if present
    const cleanUuid = raw
      .replace(/^\/api\/(v1\/)?media\//, "")
      .replace(/\/access-url$/, "")
      .replace(/\/file$/, "")
      .trim();

    if (UUID_REGEX.test(cleanUuid)) {
      async function fetchAccessUrl() {
        try {
          setLoading(true);
          setFailed(false);

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

            if (!cancelled && typeof extracted === "string" && extracted.trim()) {
              const directUrl = extracted.trim();
              setImageUrl(directUrl);
              onImageResolved?.(directUrl);
              return;
            }
          }

          if (!cancelled) {
            const fallbackFileUrl = `/api/media/${cleanUuid}/file`;
            setImageUrl(fallbackFileUrl);
            onImageResolved?.(fallbackFileUrl);
          }
        } catch {
          if (!cancelled) {
            const fallbackFileUrl = `/api/media/${cleanUuid}/file`;
            setImageUrl(fallbackFileUrl);
            onImageResolved?.(fallbackFileUrl);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      void fetchAccessUrl();
    } else {
      const resolved = resolveFoodHubCatalogImageUrl(raw) || raw;
      setImageUrl(resolved);
      setLoading(false);
      setFailed(false);
      onImageResolved?.(resolved);
    }

    return () => {
      cancelled = true;
    };
  }, [mediaUrlOrUuid, onImageResolved]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-emerald-50/50">
        <Loader2 size={16} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!imageUrl || failed) {
    if (fallbackIcon) return <>{fallbackIcon}</>;
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
        <ImageIcon size={18} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => {
        // If pre-signed URL or direct file fails, fallback to standard catalog / proxy file
        if (imageUrl.includes("/access-url") || imageUrl.includes("s3.") || imageUrl.includes("amazonaws.com") || imageUrl.includes("googleapi")) {
          const raw = String(mediaUrlOrUuid || "").trim();
          const cleanUuid = raw.replace(/^\/api\/(v1\/)?media\//, "").replace(/\/access-url$/, "").trim();
          if (UUID_REGEX.test(cleanUuid)) {
            setImageUrl(`/api/media/${cleanUuid}/file`);
            return;
          }
        }
        setFailed(true);
      }}
      loading="lazy"
    />
  );
}
