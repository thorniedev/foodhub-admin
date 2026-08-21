"use client";

import { ImagePlus, Loader2, Minus } from "lucide-react";
import React, { type ChangeEvent, useEffect, useRef, useState } from "react";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const ACCEPTED = "image/png,image/jpeg,image/gif,image/webp";
const MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_MAX = 4;

interface GalleryImagePickerProps {
  value: File[];
  onChange: (files: File[]) => void;
  existingUrls?: string[];
  onExistingChange?: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
  sublabel?: string;
}

function ExistingGalleryTile({
  rawUrl,
  index,
  onRemove,
}: {
  rawUrl: string;
  index: number;
  onRemove: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trimmed = String(rawUrl ?? "").trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") {
      setLoading(false);
      return;
    }

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (UUID_REGEX.test(trimmed)) {
      setLoading(true);
      fetch(`/api/media/${encodeURIComponent(trimmed)}/access-url`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Status " + res.status);
          return res.json();
        })
        .then((data) => {
          if (!cancelled) {
            const url =
              data?.url || data?.payload?.url || data?.data?.url || data?.accessUrl;
            setSrc(url || resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSrc(resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
            setLoading(false);
          }
        });
    } else {
      setSrc(resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [rawUrl]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-xs">
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        </div>
      ) : hasError || !src ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-2xl">🖼️</span>
          <span className="mt-1 text-[10px]">No image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`Gallery image ${index + 1}`}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      )}

      <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
        Gallery #{index + 1}
      </span>

      {/* Minus / Delete Button in top-right corner */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 hover:scale-110 active:scale-95"
        title="ដករូបភាពនេះចេញ"
      >
        <Minus size={15} strokeWidth={3} />
      </button>
    </div>
  );
}

export default function GalleryImagePicker({
  value,
  onChange,
  existingUrls = [],
  onExistingChange,
  maxFiles = DEFAULT_MAX,
  label = "រូបភាព Gallery បន្ថែម (Gallery Images)",
  sublabel = "រូបភាពបន្ថែមសម្រាប់បង្ហាញក្នុងផ្ទាំងលម្អិតមុខម្ហូប (អតិបរមា 4 រូប)",
}: GalleryImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = value.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);

    return () => {
      next.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [value]);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selected.length) return;

    const invalid = selected.find(
      (file) =>
        !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
          file.type,
        ),
    );

    if (invalid) {
      setError("អនុញ្ញាតតែ PNG, JPEG, GIF និង WebP។");
      return;
    }

    const tooLarge = selected.find((file) => file.size > MAX_SIZE);
    if (tooLarge) {
      setError("រូបភាពនីមួយៗត្រូវតែតូចជាង 10MB។");
      return;
    }

    setError(null);
    const availableSlots = maxFiles - existingUrls.length;
    const allowed = [...value, ...selected].slice(0, Math.max(0, availableSlots));
    onChange(allowed);
  };

  const removeExisting = (indexToRemove: number) => {
    if (onExistingChange) {
      const next = existingUrls.filter((_, idx) => idx !== indexToRemove);
      onExistingChange(next);
    }
  };

  const totalCount = existingUrls.length + value.length;
  const canAddMore = totalCount < maxFiles;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">{label}</h4>
          <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>
        </div>

        <span className="text-xs font-bold text-gray-400">
          {totalCount}/{maxFiles}
        </span>
      </div>

      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept={ACCEPTED}
        onChange={handleFiles}
      />

      {/* Grid of gallery images */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Existing saved gallery images */}
        {existingUrls.map((rawUrl, index) => (
          <ExistingGalleryTile
            key={`existing-gallery-${rawUrl}-${index}`}
            rawUrl={rawUrl}
            index={index}
            onRemove={() => removeExisting(index)}
          />
        ))}

        {/* Newly uploaded gallery files */}
        {previews.map((preview, index) => (
          <div
            key={`${preview.file.name}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gray-50 shadow-xs"
          >
            <img
              src={preview.url}
              alt=""
              className="h-full w-full object-cover"
            />

            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
              រូបថ្មី #{index + 1}
            </span>

            {/* Minus / Delete Button in top-right corner */}
            <button
              type="button"
              onClick={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 hover:scale-110 active:scale-95"
              title="ដករូបភាពនេះចេញ"
            >
              <Minus size={15} strokeWidth={3} />
            </button>
          </div>
        ))}

        {/* Upload trigger tile (if less than maxFiles) */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 text-[#137A3D] transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]"
          >
            <ImagePlus size={24} />
            <span className="mt-2 text-xs font-bold">+ បន្ថែមរូប Gallery</span>
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
