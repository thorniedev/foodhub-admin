"use client";

import { ImagePlus, X } from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const ACCEPTED =
  "image/png,image/jpeg,image/gif,image/webp";

const MAX_FILES = 4;
const MAX_SIZE = 10 * 1024 * 1024;

type Preview = {
  file: File;
  url: string;
};

export default function ImagePicker({
  value,
  onChange,
  label = "រូបភាព",
}: {
  value: File[];
  onChange: (files: File[]) => void;
  label?: string;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [previews, setPreviews] =
    useState<Preview[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const next = value.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(next);

    return () => {
      next.forEach(({ url }) =>
        URL.revokeObjectURL(url),
      );
    };
  }, [value]);

  const handleFiles = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = Array.from(
      event.target.files ?? [],
    );

    event.target.value = "";

    if (!selected.length) {
      return;
    }

    const invalid = selected.find(
      (file) =>
        ![
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ].includes(file.type),
    );

    if (invalid) {
      setError(
        "អនុញ្ញាតតែ PNG, JPEG, GIF និង WebP។",
      );
      return;
    }

    const tooLarge = selected.find(
      (file) => file.size > MAX_SIZE,
    );

    if (tooLarge) {
      setError(
        "រូបភាពនីមួយៗត្រូវតែតូចជាង 10MB។",
      );
      return;
    }

    setError(null);

    onChange(
      [...value, ...selected].slice(0, MAX_FILES),
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">
          {label}
        </span>

        <span className="text-xs text-gray-400">
          {value.length}/4
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {previews.map((preview, index) => (
          <div
            key={`${preview.file.name}-${index}`}
            className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
          >
            <img
              src={preview.url}
              alt=""
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() =>
                onChange(
                  value.filter(
                    (_, itemIndex) =>
                      itemIndex !== index,
                  ),
                )
              }
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {value.length < MAX_FILES && (
          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 text-[#137A3D] transition hover:bg-emerald-50"
          >
            <ImagePlus size={24} />
            <span className="mt-2 text-xs font-bold">
              បន្ថែមរូប
            </span>
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
