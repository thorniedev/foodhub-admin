"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadStoreMediaFile } from "@/src/lib/storeMediaClient";
import { resolveMediaUrl } from "@/src/utils/imageUrl";
import { compressImage } from "@/src/utils/imageCompression";
import Image from "next/image";

interface BannerImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function BannerImageUploader({
  value,
  onChange,
  label = "URL រូបភាព",
}: BannerImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const compressedFile = await compressImage(file, 1); // Compress to 1MB limit for Java backend
      const media = await uploadStoreMediaFile(compressedFile, "STORE_COVER");
      const url = await resolveMediaUrl(media.uuid);
      onChange(url);
    } catch (err: any) {
      console.error("[BannerImageUploader Error]", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-xl font-semibold text-[#F97316]">
        {label}
      </label>

      {value ? (
        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <Image
            src={value}
            alt="Uploaded banner"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !loading && inputRef.current?.click()}
          className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:bg-gray-100 ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-[#136C34]">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-sm font-medium">កំពុងផ្ទុករូបភាព...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-gray-400" />
              <span className="text-sm font-medium">ចុចទីនេះដើម្បីបញ្ចូលរូបភាព</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
