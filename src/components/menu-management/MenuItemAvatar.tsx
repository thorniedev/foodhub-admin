"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItemRecord } from "@/src/types/menu-management";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getMenuItemImageSource(item: MenuItemRecord): {
  url: string | null;
  uuid: string | null;
} {
  const candidateList = [
    item.thumbnail,
    item.imageUrl,
    item.primaryMediaUrls?.[0],
    item.images?.[0],
    item.gallery?.[0],
    (item as any)?.media?.[0]?.url,
    (item as any)?.media?.[0]?.accessUrl,
    (item as any)?.media?.[0]?.fileUrl,
    item.food?.thumbnail,
    item.food?.imageUrl,
    item.food?.primaryMediaUrls?.[0],
    item.food?.images?.[0],
    item.food?.gallery?.[0],
    (item.food as any)?.media?.[0]?.url,
    (item.food as any)?.media?.[0]?.accessUrl,
    (item.food as any)?.media?.[0]?.fileUrl,
    item.primaryMediaUuid,
    item.thumbnailMediaUuid,
    item.primaryMediaUuids?.[0],
    item.galleryMediaUuids?.[0],
    (item as any)?.mediaUuid,
    (item as any)?.media?.[0]?.uuid,
    (item as any)?.media?.[0],
    item.food?.primaryMediaUuid,
    item.food?.thumbnailMediaUuid,
    item.food?.primaryMediaUuids?.[0],
    item.food?.galleryMediaUuids?.[0],
    (item.food as any)?.mediaUuid,
    (item.food as any)?.media?.[0]?.uuid,
  ];

  for (const candidate of candidateList) {
    if (typeof candidate === "string" && candidate.trim()) {
      const trimmed = candidate.trim();

      // If it is a raw UUID
      if (UUID_REGEX.test(trimmed)) {
        return {
          url: resolveFoodHubCatalogImageUrl(trimmed),
          uuid: trimmed,
        };
      }

      const resolved = resolveFoodHubCatalogImageUrl(trimmed);
      if (resolved) {
        return { url: resolved, uuid: null };
      }
    }
  }

  return { url: null, uuid: null };
}

export default function MenuItemAvatar({
  item,
  alt,
  fallbackEmoji = "🍲",
  className = "h-full w-full object-cover",
}: {
  item: MenuItemRecord;
  alt: string;
  fallbackEmoji?: string;
  className?: string;
}) {
  const { url: initialUrl, uuid: rawUuid } = useMemo(
    () => getMenuItemImageSource(item),
    [item],
  );

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(initialUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const { url, uuid } = getMenuItemImageSource(item);
    setResolvedUrl(url);
    setHasError(false);

    // If we only have a media UUID, also attempt to resolve access-url as backup if direct /file fails
    if (uuid) {
      let cancelled = false;
      fetch(`/api/media/${encodeURIComponent(uuid)}/access-url`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled) return;
          const accessUrl =
            data?.url ||
            data?.payload?.url ||
            data?.data?.url ||
            data?.accessUrl ||
            data?.payload?.accessUrl;
          if (typeof accessUrl === "string" && accessUrl.trim()) {
            setResolvedUrl(accessUrl.trim());
          }
        })
        .catch(() => {
          // Keep the direct /file URL
        });

      return () => {
        cancelled = true;
      };
    }
  }, [item]);

  if (!resolvedUrl || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
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
