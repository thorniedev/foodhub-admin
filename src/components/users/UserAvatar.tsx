"use client";

import { useEffect, useState } from "react";
import { initials } from "@/src/lib/userProfileFormat";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

// In-memory caches to prevent redundant network calls across user rows
const mediaUrlCache = new Map<string, string>();
const pendingMediaRequests = new Map<string, Promise<string | null>>();

const userProfileMediaCache = new Map<string, string | null>();
const pendingProfileRequests = new Map<string, Promise<string | null>>();

async function fetchMediaAccessUrl(mediaUuid: string): Promise<string | null> {
  if (!mediaUuid || typeof mediaUuid !== "string") return null;

  if (
    mediaUuid.startsWith("http://") ||
    mediaUuid.startsWith("https://") ||
    mediaUuid.startsWith("data:") ||
    mediaUuid.startsWith("/")
  ) {
    return mediaUuid;
  }

  if (mediaUrlCache.has(mediaUuid)) {
    return mediaUrlCache.get(mediaUuid) ?? null;
  }

  if (pendingMediaRequests.has(mediaUuid)) {
    return pendingMediaRequests.get(mediaUuid)!;
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

      const data = (await response.json()) as any;
      const url =
        data?.url ||
        data?.accessUrl ||
        data?.mediaUrl ||
        data?.fileUrl ||
        (typeof data === "string" ? data : null);

      if (url && typeof url === "string") {
        mediaUrlCache.set(mediaUuid, url);
        return url;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingMediaRequests.delete(mediaUuid);
    }
  })();

  pendingMediaRequests.set(mediaUuid, promise);
  return promise;
}

async function fetchUserAvatarMediaUuid(userUuid: string): Promise<string | null> {
  if (!userUuid || typeof userUuid !== "string") return null;

  if (userProfileMediaCache.has(userUuid)) {
    return userProfileMediaCache.get(userUuid) ?? null;
  }

  if (pendingProfileRequests.has(userUuid)) {
    return pendingProfileRequests.get(userUuid)!;
  }

  const promise = (async () => {
    try {
      // 1. Try admin user profiles endpoint
      let response = await fetch(
        `/api/admin/users/${encodeURIComponent(userUuid)}/profiles?page=0&size=10`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      // 2. Fallback to standard user profiles endpoint
      if (!response.ok) {
        response = await fetch(
          `/api/users/${encodeURIComponent(userUuid)}/profiles?page=0&size=10`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );
      }

      if (!response.ok) {
        userProfileMediaCache.set(userUuid, null);
        return null;
      }

      const data = await response.json();
      const profiles: any[] =
        data?.contents ??
        data?.content ??
        (Array.isArray(data) ? data : []);

      // Find the default profile (crown / isDefault), or self profile, or active profile, or first profile
      const defaultProfile =
        profiles.find((p) => p.isDefault === true) ||
        profiles.find((p) => p.relationship === "SELF") ||
        profiles.find((p) => p.active === true || p.isActive === true) ||
        profiles[0];

      const foundAvatar =
        defaultProfile?.avatarMediaUuid ||
        defaultProfile?.avatarUrl ||
        defaultProfile?.imageUrl ||
        defaultProfile?.photoUrl ||
        defaultProfile?.profileImage ||
        defaultProfile?.picture ||
        null;

      userProfileMediaCache.set(userUuid, foundAvatar);
      return foundAvatar;
    } catch {
      userProfileMediaCache.set(userUuid, null);
      return null;
    } finally {
      pendingProfileRequests.delete(userUuid);
    }
  })();

  pendingProfileRequests.set(userUuid, promise);
  return promise;
}

export const DEFAULT_AVATAR_IMAGE = "/Image/no-profile.jpg";

export interface UserAvatarProps {
  name?: string | null;
  userUuid?: string | null;
  avatarMediaUuid?: string | null;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  textClassName?: string;
  containerClassName?: string;
  fallbackImageUrl?: string;
}

export default function UserAvatar({
  name = "User",
  userUuid,
  avatarMediaUuid,
  imageUrl,
  alt,
  className = "h-full w-full object-cover",
  textClassName = "",
  containerClassName = "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 text-lg font-semibold text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100",
  fallbackImageUrl = DEFAULT_AVATAR_IMAGE,
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
  const [fallbackHasError, setFallbackHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasError(false);
    setFallbackHasError(false);

    if (imageUrl) {
      const resolved = resolveFoodHubCatalogImageUrl(imageUrl) || imageUrl;
      setResolvedUrl(resolved);
      return;
    }

    if (avatarMediaUuid) {
      if (mediaUrlCache.has(avatarMediaUuid)) {
        setResolvedUrl(mediaUrlCache.get(avatarMediaUuid)!);
        return;
      }

      void fetchMediaAccessUrl(avatarMediaUuid).then((url) => {
        if (!cancelled) {
          if (url) {
            setResolvedUrl(url);
          } else {
            setResolvedUrl(null);
          }
        }
      });
      return;
    }

    if (userUuid) {
      void fetchUserAvatarMediaUuid(userUuid).then(async (foundAvatar) => {
        if (cancelled) return;

        if (!foundAvatar) {
          setResolvedUrl(null);
          return;
        }

        if (
          foundAvatar.startsWith("http://") ||
          foundAvatar.startsWith("https://") ||
          foundAvatar.startsWith("data:") ||
          foundAvatar.startsWith("/")
        ) {
          setResolvedUrl(foundAvatar);
          return;
        }

        const accessUrl = await fetchMediaAccessUrl(foundAvatar);
        if (!cancelled) {
          if (accessUrl) {
            setResolvedUrl(accessUrl);
          } else {
            setResolvedUrl(null);
          }
        }
      });
      return;
    }

    setResolvedUrl(null);

    return () => {
      cancelled = true;
    };
  }, [avatarMediaUuid, imageUrl, userUuid]);

  const displayInitials = initials(name || "User");
  const activeImageUrl = !hasError && resolvedUrl ? resolvedUrl : fallbackImageUrl;

  return (
    <div className={containerClassName}>
      {activeImageUrl && !fallbackHasError ? (
        <img
          src={activeImageUrl}
          alt={alt || name || "User avatar"}
          className={className}
          onError={() => {
            if (!hasError && resolvedUrl) {
              setHasError(true);
            } else {
              setFallbackHasError(true);
            }
          }}
          loading="lazy"
        />
      ) : (
        <span className={textClassName}>{displayInitials}</span>
      )}
    </div>
  );
}
