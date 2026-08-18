"use client";

import { useEffect, useState } from "react";
import type { FoodRecord } from "@/src/types/menu-management";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractFirstFoodMedia(item: FoodRecord): { directUrl: string | null; mediaUuid: string | null } {
  const candidateUrls = [
    item.primaryMediaUrls?.[0],
    item.thumbnail,
    item.imageUrl,
    item.images?.[0],
    item.gallery?.[0],
    (item as any)?.media?.[0]?.url,
    (item as any)?.media?.[0]?.accessUrl,
  ];

  for (const candidate of candidateUrls) {
    if (typeof candidate === "string" && candidate.trim()) {
      const trimmed = candidate.trim();
      if (UUID_REGEX.test(trimmed)) {
        return { directUrl: null, mediaUuid: trimmed };
      }
      if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("/Image/") ||
        trimmed.startsWith("/images/")
      ) {
        return { directUrl: trimmed, mediaUuid: null };
      }
    }
  }

  const candidateUuids = [
    item.primaryMediaUuid,
    item.thumbnailMediaUuid,
    item.primaryMediaUuids?.[0],
    item.galleryMediaUuids?.[0],
    (item as any)?.mediaUuid,
    (item as any)?.media?.[0]?.uuid,
    (item as any)?.media?.[0],
  ];

  for (const candidate of candidateUuids) {
    if (typeof candidate === "string" && candidate.trim() && UUID_REGEX.test(candidate.trim())) {
      return { directUrl: null, mediaUuid: candidate.trim() };
    }
  }

  return { directUrl: null, mediaUuid: null };
}

export default function FoodAvatar({
  item,
  alt,
  fallbackEmoji = "🍽️",
  className = "h-full w-full object-cover",
}: {
  item: FoodRecord;
  alt: string;
  fallbackEmoji?: string;
  className?: string;
}) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { directUrl, mediaUuid } = extractFirstFoodMedia(item);

    if (directUrl) {
      setResolvedUrl(directUrl);
      setHasError(false);
      return;
    }

    if (!mediaUuid) {
      setResolvedUrl(null);
      setHasError(false);
      return;
    }

    async function fetchAccessUrl(uuid: string) {
      try {
        const response = await fetch(
          `/api/media/${encodeURIComponent(uuid)}/access-url`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Media fetch status: ${response.status}`);
        }

        const data = await response.json();
        const accessUrl = data?.url || data?.payload?.url || data?.data?.url;

        if (!cancelled && typeof accessUrl === "string" && accessUrl.trim()) {
          setResolvedUrl(accessUrl);
          setHasError(false);
        } else if (!cancelled) {
          setResolvedUrl(null);
        }
      } catch (_err) {
        if (!cancelled) {
          setResolvedUrl(null);
          setHasError(true);
        }
      }
    }

    void fetchAccessUrl(mediaUuid);

    return () => {
      cancelled = true;
    };
  }, [item]);

  if (!resolvedUrl || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg text-gray-300">
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
