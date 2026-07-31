"use client";

import { FolderOpen, X } from "lucide-react";
import { useRef } from "react";

interface ImageUploadGridProps {
  images: string[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}

export default function ImageUploadGrid({
  images,
  onAdd,
  onRemove,
}: ImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-emerald-600 rounded-xl p-3">
          <FolderOpen size={28} className="text-white" />
        </div>
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        ដាក់រូបថតរបស់អ្នកនៅទីនេះ
      </h2>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto mb-4">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`upload-${i}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-gray-500 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onAdd(e.target.files)}
      />

      <p className="text-xs text-gray-400 mb-1">
        ទំហំដែលណែនាំ: 1200×900px ឬធំជាងនេះ
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        className="text-sm text-emerald-600 font-medium hover:underline"
      >
        ✨ ប្រើរូបភាពគំរូនៃអាហារ
      </button>
    </div>
  );
}