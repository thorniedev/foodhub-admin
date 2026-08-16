"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { CheckCircle2, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

import { uploadStoreMediaFile } from "@/src/lib/storeMediaClient";
import { compressImage } from "@/src/utils/imageCompression";

import type { StoreMediaPurpose } from "@/src/types/media";

interface StoreMediaUploaderProps {
  label: string;
  purpose: StoreMediaPurpose;
  mediaUuid: string;
  onMediaUuidChange: (uuid: string) => void;
  variant?: "logo" | "cover";
}

const ACCEPTED_TYPES = "image/png,image/jpeg,image/gif,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

export default function StoreMediaUploader({
  label,
  purpose,
  mediaUuid,
  onMediaUuidChange,
  variant = "cover",
}: StoreMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    if (objectUrl) {
      return;
    }

    if (mediaUuid) {
      setPreviewUrl(`/api/media/${mediaUuid}`);
      return;
    }

    setPreviewUrl(null);
  }, [mediaUuid, objectUrl]);

  const replacePreviewObjectUrl = (url: string | null) => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(url);
    setPreviewUrl(url);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        file.type,
      )
    ) {
      setError("Only PNG, JPEG, GIF and WebP images are supported.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Image must be 10 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);

    try {
      setLoading(true);
      setError(null);

      const compressedFile = await compressImage(file, 1);
      const media = await uploadStoreMediaFile(compressedFile, purpose);

      replacePreviewObjectUrl(localPreview);
      onMediaUuidChange(media.uuid);
    } catch (uploadError) {
      URL.revokeObjectURL(localPreview);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(null);
    setPreviewUrl(null);
    setError(null);
    onMediaUuidChange("");
  };

  const previewHeight = variant === "logo" ? "h-56" : "h-64";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xl font-semibold text-primary-800">{label}</p>
          <p className="mt-1 text-lg leading-7 text-gray-500">
            PNG, JPG, GIF or WebP · max 10 MB
          </p>
        </div>

        {mediaUuid && (
          <div className="inline-flex min-h-10 w-fit shrink-0 items-center gap-2 rounded-full bg-primary-50 px-4 text-lg font-medium text-primary-700">
            <CheckCircle2 size={20} />
            រូបភាពបានភ្ជាប់
          </div>
        )}
      </div>

      {/* =====================================================
          CLICK IMAGE AREA TO UPLOAD / REPLACE
      ====================================================== */}
      <div className="relative p-5">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          aria-label={mediaUuid ? `Replace ${label}` : `Upload ${label}`}
          className={`
            group
            relative
            flex
            ${previewHeight}
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border-2
            border-dashed
            border-gray-200
            bg-gray-50
            text-center
            outline-none
            transition
            hover:border-secondary-300
            hover:bg-secondary-50/40
            focus:border-secondary-400
            focus:ring-4
            focus:ring-secondary-100
            disabled:cursor-not-allowed
            disabled:opacity-70
          `}
        >
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className={
                  variant === "logo"
                    ? "h-full w-full object-contain p-6"
                    : "h-full w-full object-cover"
                }
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40 group-focus:bg-black/40">
                <div className="translate-y-2 rounded-full bg-white/95 px-5 py-3 text-lg font-semibold text-secondary-700 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                  <span className="inline-flex items-center gap-2">
                    <Upload size={20} />
                    ចុចដើម្បីប្តូររូបភាព
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600 transition group-hover:bg-secondary-100 group-hover:text-secondary-700">
                <ImageIcon size={32} />
              </div>

              <p className="mt-4 text-lg font-semibold text-secondary-600">
                Upload រូបភាព
              </p>

              <p className="mt-2 text-lg leading-7 text-gray-500">
                ជ្រើសរើសរូបភាពពីឧបករណ៍របស់អ្នក
              </p>
            </div>
          )}
        </button>

        {/* ===================================================
            LOADING OVERLAY
        ==================================================== */}
        {loading && (
          <div className="absolute inset-5 z-20 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-primary-700"
              />
              <p className="mt-3 text-lg font-medium text-gray-600">
                កំពុង Upload...
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            REMOVE ACTION
        ==================================================== */}
        {mediaUuid && !loading && (
          <button
            type="button"
            onClick={clearImage}
            className="absolute right-8 top-8 z-30 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-lg font-medium text-red-600 shadow-md transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={20} />
            លុប
          </button>
        )}
      </div>

      {/* =====================================================
          HELPER / ERROR
      ====================================================== */}
      <div className="border-t border-gray-100 px-5 py-4">
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-lg leading-7 text-red-600">
            {error}
          </div>
        ) : (
          <p className="text-lg leading-7 text-gray-500">
            {mediaUuid
              ? "ចុចលើរូបភាព ដើម្បីជ្រើសរើសរូបថ្មីជំនួស។"
              : "Upload ពី File "}
          </p>
        )}
      </div>
    </div>
  );
}
