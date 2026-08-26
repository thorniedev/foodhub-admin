"use client";

import { ImagePlus, Minus, Loader2 } from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const ACCEPTED = "image/png,image/jpeg,image/gif,image/webp";
const MAX_FILES = 4;
const MAX_SIZE = 10 * 1024 * 1024;

type Preview = {
  file: File;
  url: string;
};

function ExistingImageTile({
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
    if (!trimmed) {
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
            if (url) {
              setSrc(url);
            } else {
              setSrc(resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
            }
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
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : hasError || !src ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-3xl">🍽️</span>
          <span className="mt-1 text-lg font-medium">No image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`Existing image ${index + 1}`}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      )}

      <span className="absolute left-2 top-2 rounded-lg bg-black/70 px-2.5 py-1 text-lg font-bold text-white backdrop-blur-xs">
        {index === 0 ? "Thumbnail" : `Gallery #${index}`}
      </span>

      {/* Minus / Delete Button in top-right corner */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 hover:scale-110 active:scale-95"
        title="ដករូបភាពនេះចេញ"
      >
        <Minus size={18} strokeWidth={3} />
      </button>
    </div>
  );
}

export default function ImagePicker({
  value,
  onChange,
  existingImages = [],
  onExistingChange,
  label = "រូបភាព",
}: {
  value: File[];
  onChange: (files: File[]) => void;
  existingImages?: string[];
  onExistingChange?: (images: string[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
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

    if (!selected.length) {
      return;
    }

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
    const availableSlots = MAX_FILES - (existingImages.length + value.length);
    onChange([...value, ...selected].slice(0, MAX_FILES));
  };

  const removeExisting = (indexToRemove: number) => {
    if (onExistingChange) {
      const next = existingImages.filter((_, idx) => idx !== indexToRemove);
      onExistingChange(next);
    }
  };

  const totalCount = existingImages.length + value.length;
  const canAddMore = totalCount < MAX_FILES;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-800">{label}</span>

        <span className="text-lg font-bold text-gray-400">
          {totalCount}/{MAX_FILES}
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

      {/* Grid of images */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Existing saved images */}
        {existingImages.map((rawUrl, index) => (
          <ExistingImageTile
            key={`existing-${rawUrl}-${index}`}
            rawUrl={rawUrl}
            index={index}
            onRemove={() => removeExisting(index)}
          />
        ))}

        {/* Newly uploaded files */}
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

            <span className="absolute left-2 top-2 rounded-lg bg-emerald-600 px-2.5 py-1 text-lg font-bold text-white shadow">
              រូបថ្មី #{index + 1}
            </span>

            {/* Minus / Delete Button in top-right corner */}
            <button
              type="button"
              onClick={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 hover:scale-110 active:scale-95"
              title="ដករូបភាពនេះចេញ"
            >
              <Minus size={18} strokeWidth={3} />
            </button>
          </div>
        ))}

        {/* Upload trigger tile (if less than MAX_FILES) */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 text-[#137A3D] transition hover:bg-emerald-50 hover:border-emerald-400 active:scale-95"
          >
            <ImagePlus size={28} />
            <span className="mt-2 text-lg font-bold">+ បន្ថែមរូប</span>
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-lg font-semibold text-red-500">{error}</p>}
    </div>
  );
}
