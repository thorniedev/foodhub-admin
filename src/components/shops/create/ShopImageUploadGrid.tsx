"use client";

import { useRef } from "react";
import { FolderOpen, X } from "lucide-react";

interface ShopImageUploadGridProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ShopImageUploadGrid({
  images,
  onChange,
  maxImages = 4,
}: ShopImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const remaining = maxImages - images.length;
    const newUrls = Array.from(files)
      .slice(0, remaining)
      .map((file) => URL.createObjectURL(file));
    onChange([...images, ...newUrls]);
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const slots = Array.from({ length: maxImages }, (_, i) => images[i] ?? null);

  return (
    <div>
      <label className="text-base text-gray-800 mb-3 block">
        ជ្រើសរើសរូបភាពរបស់អ្នក <span className="text-red-500">*</span>
      </label>

      <div className="bg-gray-100 rounded-2xl p-8 flex flex-col items-center">
        <div className="bg-white rounded-xl p-4 mb-4">
          <FolderOpen size={28} className="text-emerald-700" />
        </div>
        <p className="text-lg font-semibold text-gray-800 mb-6">
          ដាក់រូបថតរបស់អ្នកនៅទីនេះ
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="grid grid-cols-4 gap-4 w-full max-w-md">
          {slots.map((src, i) =>
            src ? (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`upload-${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-600 hover:text-red-500 shadow"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 bg-transparent hover:bg-white/50 transition-colors"
              />
            )
          )}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-3">
        ទំហំដែលណែនាំ: 1200×900px ឬធំជាងនេះ
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full text-center text-sm text-emerald-600 font-medium hover:underline mt-1"
      >
        ✨ ប្រើរូបភាពគំរូនៃហាងអាហារ
      </button>
    </div>
  );
}