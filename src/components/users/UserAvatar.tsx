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

  const raw = mediaUuid.trim();

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
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

  if (mediaUrlCache.has(cleanUuid)) {
    return mediaUrlCache.get(cleanUuid) ?? null;
  }

  if (pendingMediaRequests.has(cleanUuid)) {
    return pendingMediaRequests.get(cleanUuid)!;
  }

  const promise = (async () => {
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
        const data = (await response.json()) as any;
        const url =
          data?.url ||
          data?.payload?.url ||
          data?.data?.url ||
          data?.accessUrl ||
          data?.payload?.accessUrl ||
          data?.data?.accessUrl ||
          (typeof data === "string" ? data : null);

        if (url && typeof url === "string" && url.trim()) {
          mediaUrlCache.set(cleanUuid, url.trim());
          return url.trim();
        }
      }

      const proxyUrl = `/api/media/${cleanUuid}/file`;
      mediaUrlCache.set(cleanUuid, proxyUrl);
      return proxyUrl;
    } catch {
      const proxyUrl = `/api/media/${cleanUuid}/file`;
      mediaUrlCache.set(cleanUuid, proxyUrl);
      return proxyUrl;
    } finally {
      pendingMediaRequests.delete(cleanUuid);
    }
  })();

  pendingMediaRequests.set(cleanUuid, promise);
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
      const raw = data?.data ?? data?.payload ?? data;
      const rawList = Array.isArray(raw)
        ? raw
        : raw?.items ??
          raw?.contents ??
          raw?.content ??
          raw?.profiles ??
          [];

      const profiles: any[] = Array.isArray(rawList) ? rawList : [];

      // Find the default profile (crown / isDefault), or self profile, or active profile, or first profile
      const defaultProfile =
        profiles.find((p) => p.isDefault === true) ||
        profiles.find((p) => p.relationship === "SELF") ||
        profiles.find((p) => p.active === true || p.isActive === true) ||
        profiles[0];

      const foundAvatar =
        defaultProfile?.avatarMediaUuid ||
        defaultProfile?.avatarMedia?.uuid ||
        defaultProfile?.avatarUrl ||
        defaultProfile?.imageUrl ||
        defaultProfile?.photoUrl ||
        defaultProfile?.profileImage ||
        defaultProfile?.profileImageUrl ||
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
  fallbackImageUrl,
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
    setHasError(false);

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
          setResolvedUrl(url);
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

        const accessUrl = await fetchMediaAccessUrl(foundAvatar);
        if (!cancelled) {
          setResolvedUrl(accessUrl);
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
  const activeImageUrl = !hasError && resolvedUrl ? resolvedUrl : fallbackImageUrl || null;

  return (
    <div className={containerClassName}>
      {activeImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeImageUrl}
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
