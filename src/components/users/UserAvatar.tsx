"use client";

import { useEffect, useState } from "react";
import { initials } from "@/src/lib/userProfileFormat";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

// In-memory cache for media access URLs to prevent redundant network calls
const mediaUrlCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

async function fetchMediaAccessUrl(mediaUuid: string): Promise<string | null> {
  if (mediaUrlCache.has(mediaUuid)) {
    return mediaUrlCache.get(mediaUuid) ?? null;
  }

  if (pendingRequests.has(mediaUuid)) {
    return pendingRequests.get(mediaUuid)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(
        `/api/media/${encodeURIComponent(mediaUuid)}/access-url`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { url?: string };
      if (data?.url) {
        mediaUrlCache.set(mediaUuid, data.url);
        return data.url;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingRequests.delete(mediaUuid);
    }
  })();

  pendingRequests.set(mediaUuid, promise);
  return promise;
}

export interface UserAvatarProps {
  name?: string | null;
  avatarMediaUuid?: string | null;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  textClassName?: string;
  containerClassName?: string;
}

export default function UserAvatar({
  name = "User",
  avatarMediaUuid,
  imageUrl,
  alt,
  className = "h-full w-full object-cover",
  textClassName = "",
  containerClassName = "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 text-lg font-semibold text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100",
}: UserAvatarProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() => {
    if (imageUrl) {
      return resolveFoodHubCatalogImageUrl(imageUrl) || imageUrl;
    }
    if (avatarMediaUuid && mediaUrlCache.has(avatarMediaUuid)) {
      return mediaUrlCache.get(avatarMediaUuid)!;
    }
    return null;
  });

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (imageUrl) {
      const resolved = resolveFoodHubCatalogImageUrl(imageUrl) || imageUrl;
      setResolvedUrl(resolved);
      setHasError(false);
      return;
    }

    if (!avatarMediaUuid) {
      setResolvedUrl(null);
      setHasError(false);
      return;
    }

    if (mediaUrlCache.has(avatarMediaUuid)) {
      setResolvedUrl(mediaUrlCache.get(avatarMediaUuid)!);
      setHasError(false);
      return;
    }

    void fetchMediaAccessUrl(avatarMediaUuid).then((url) => {
      if (!cancelled) {
        if (url) {
          setResolvedUrl(url);
          setHasError(false);
        } else {
          setResolvedUrl(null);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [avatarMediaUuid, imageUrl]);

  const displayInitials = initials(name || "User");

  return (
    <div className={containerClassName}>
      {resolvedUrl && !hasError ? (
        <img
          src={resolvedUrl}
          alt={alt || name || "User avatar"}
          className={className}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <span className={textClassName}>{displayInitials}</span>
      )}
    </div>
  );
}
