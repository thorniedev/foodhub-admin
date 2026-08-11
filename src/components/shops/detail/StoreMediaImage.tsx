"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaAccessUrlResponse {
  uuid: string;
  url: string;
  expiresAt: string;
}

interface StoreMediaImageProps {
  mediaUuid: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export default function StoreMediaImage({
  mediaUuid,
  alt,
  className = "h-full w-full object-cover",
  fallbackClassName = "",
}: StoreMediaImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      if (!mediaUuid) {
        setImageUrl(null);
        setFailed(false);
        return;
      }

      try {
        setLoading(true);
        setFailed(false);

        const response = await fetch(
          `/api/media/${encodeURIComponent(mediaUuid)}/access-url`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Media request failed: ${response.status}`);
        }

        const data = (await response.json()) as MediaAccessUrlResponse;

        if (!cancelled && data.url) {
          setImageUrl(data.url);
        }
      } catch (error) {
        console.error("[STORE MEDIA IMAGE]", { mediaUuid, error });

        if (!cancelled) {
          setImageUrl(null);
          setFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadImage();

    return () => {
      cancelled = true;
    };
  }, [mediaUuid]);

  if (loading) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-50 ${fallbackClassName}`}
      >
        <Loader2 size={26} className="animate-spin text-[#137A3D]" />
      </div>
    );
  }

  if (!mediaUuid || !imageUrl || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-300 ${fallbackClassName}`}
      >
        <ImageIcon size={30} />
        {failed && <span className="mt-2 text-xs">Image unavailable</span>}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
