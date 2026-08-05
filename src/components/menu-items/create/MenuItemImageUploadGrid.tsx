"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface MenuItemImageUploadGridProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export default function MenuItemImageUploadGrid({ imageUrl, onChange }: MenuItemImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    onChange(URL.createObjectURL(file));
  };

  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">រូបភាព</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
      />
      {imageUrl ? (
        <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="menu item" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-gray-500 hover:text-red-500"
          >
            <X size={14} />
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium text-gray-700 px-3 py-1.5 rounded-lg hover:bg-white"
          >
            ប្តូររូបភាព
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full max-w-xs aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          <ImagePlus size={28} className="text-gray-400" />
          <span className="text-sm text-gray-500">ចុចដើម្បីជ្រើសរើសរូបភាព</span>
        </button>
      )}
    </div>
  );
}