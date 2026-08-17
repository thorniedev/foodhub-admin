"use client";

import { ImagePlus, Minus, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const ACCEPTED = "image/png,image/jpeg,image/gif,image/webp";
const MAX_FILES = 4;
const MAX_SIZE = 10 * 1024 * 1024;

type Preview = {
  file: File;
  url: string;
};

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
      <div className="mb-2 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">{label}</span>

        <span className="text-lg text-gray-400">
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
        {existingImages.map((rawUrl, index) => {
          const resolved = resolveFoodHubCatalogImageUrl(rawUrl) || rawUrl;
          return (
            <div
              key={`existing-${rawUrl}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xs"
            >
              <img
                src={resolved}
                alt=""
                className="h-full w-full object-cover"
              />

              <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                {index === 0 ? "Thumbnail" : `Gallery #${index}`}
              </span>

              {/* Minus / Delete Button in top-right corner */}
              <button
                type="button"
                onClick={() => removeExisting(index)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 hover:scale-110 active:scale-95"
                title="ដករូបភាពនេះចេញ"
              >
                <Minus size={15} strokeWidth={3} />
              </button>
            </div>
          );
        })}

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

            <span className="absolute left-2 top-2 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
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

        {/* Upload trigger tile (if less than MAX_FILES) */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 text-[#137A3D] transition hover:bg-emerald-50 hover:border-emerald-400"
          >
            <ImagePlus size={24} />
            <span className="mt-2 text-xs font-bold">បន្ថែមរូប</span>
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
