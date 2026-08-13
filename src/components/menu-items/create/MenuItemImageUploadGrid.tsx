"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";

import {
  type MenuItemMediaPurpose,
  uploadMenuItemMediaFile,
} from "@/src/lib/menuItemMediaClient";

interface ImageValue {
  uuid: string;
  previewUrl: string;
}

interface MenuItemImageUploadGridProps {
  label?: string;
  values: string[];
  onChange: (uuids: string[]) => void;
  mode: "FOOD" | "MENU_ITEM";
  maxImages?: number;
}

const ACCEPT = "image/png,image/jpeg,image/gif,image/webp";

export default function MenuItemImageUploadGrid({
  label = "រូបភាព",
  values,
  onChange,
  mode,
  maxImages = 4,
}: MenuItemImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<ImageValue[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purposeForIndex = (index: number): MenuItemMediaPurpose => {
    if (mode === "FOOD") {
      return "CATALOG_FOOD_PRIMARY";
    }

    return index === 0 ? "MENU_ITEM_PRIMARY" : "MENU_ITEM_GALLERY";
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const remaining = Math.max(maxImages - values.length, 0);
    const selected = files.slice(0, remaining);

    if (selected.length === 0) {
      setError(`អាចបញ្ចូលរូបភាពបានអតិបរមា ${maxImages} រូប។`);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const nextUuids = [...values];
      const nextPreviews = [...previews];

      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index];
        const overallIndex = nextUuids.length;
        const previewUrl = URL.createObjectURL(file);

        try {
          const media = await uploadMenuItemMediaFile(
            file,
            purposeForIndex(overallIndex),
          );

          nextUuids.push(media.uuid);
          nextPreviews.push({ uuid: media.uuid, previewUrl });
        } catch (uploadError) {
          URL.revokeObjectURL(previewUrl);
          throw uploadError;
        }
      }

      setPreviews(nextPreviews);
      onChange(nextUuids);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "មិនអាចផ្ទុករូបភាពបានទេ។",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (uuid: string) => {
    const preview = previews.find((item) => item.uuid === uuid);
    if (preview) {
      URL.revokeObjectURL(preview.previewUrl);
    }

    setPreviews((current) => current.filter((item) => item.uuid !== uuid));
    onChange(values.filter((item) => item !== uuid));
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D]">
            <ImageIcon size={20} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">{label}</h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              PNG, JPEG, GIF ឬ WebP · អតិបរមា {maxImages} រូប · 10MB ក្នុងមួយរូប
            </p>
          </div>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500">
          {values.length}/{maxImages}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {values.map((uuid) => {
          const preview = previews.find((item) => item.uuid === uuid)?.previewUrl;

          return (
            <div
              key={uuid}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Uploaded preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-2 text-center text-gray-400">
                  <ImageIcon size={24} />
                  <span className="mt-2 line-clamp-2 text-[11px]">{uuid}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeImage(uuid)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-500 shadow transition hover:bg-red-50"
                aria-label="Remove image"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}

        {values.length < maxImages && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 text-[#137A3D] transition hover:bg-emerald-50 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={26} className="animate-spin" />
            ) : values.length === 0 ? (
              <Upload size={26} />
            ) : (
              <Plus size={26} />
            )}
            <span className="mt-2 text-sm font-bold">
              {uploading ? "កំពុងផ្ទុក..." : "បន្ថែមរូប"}
            </span>
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
