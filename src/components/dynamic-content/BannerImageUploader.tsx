"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { compressImage } from "@/src/utils/imageCompression";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface BannerImageUploaderProps {
  /** Newly selected file for this banner, if any. */
  file: File | null;
  /** Existing backend image URL, shown when no new file has been picked yet. */
  existingImageUrl?: string | null;
  onChange: (file: File | null) => void;
  label?: string;
  required?: boolean;
}

export default function BannerImageUploader({
  file,
  existingImageUrl,
  onChange,
  label = "រូបភាព",
  required = false,
}: BannerImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;

    if (!ACCEPTED_MIME_TYPES.includes(selected.type)) {
      setError("សូមជ្រើសរើសរូបភាពប្រភេទ JPEG, PNG ឬ WebP។");
      return;
    }

    setError(null);
    try {
      const compressed = await compressImage(selected, 1);
      onChange(compressed);
    } catch {
      onChange(selected);
    }
  };

  const displayUrl =
    previewUrl ?? resolveFoodHubCatalogImageUrl(existingImageUrl);

  return (
    <div>
      <label className="mb-2 block text-xl font-semibold text-[#F97316]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {displayUrl ? (
        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <Image
            src={displayUrl}
            alt="Banner preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
            }}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/70"
          >
            ប្តូររូបភាព
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:bg-gray-100"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <span className="text-sm font-medium">ចុចទីនេះដើម្បីបញ្ចូលរូបភាព</span>
            <span className="text-xs text-gray-400">JPEG, PNG, WebP</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
