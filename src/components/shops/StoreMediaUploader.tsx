"use client";

import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { uploadStoreMediaFile } from "@/src/lib/storeMediaClient";
import { compressImage } from "@/src/utils/imageCompression";
import type { StoreMediaPurpose } from "@/src/types/media";

interface StoreMediaUploaderProps {
  label: string;
  purpose: StoreMediaPurpose;
  mediaUuid: string;
  onMediaUuidChange: (uuid: string) => void;
  variant?: "logo" | "cover";
  fallbackUrl?: string | null;
}

const ACCEPTED_TYPES = "image/png,image/jpeg,image/gif,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

export default function StoreMediaUploader({
  label,
  purpose,
  mediaUuid,
  onMediaUuidChange,
  variant = "cover",
  fallbackUrl,
}: StoreMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    if (mediaUuid) {
      if (!objectUrl) {
        setPreviewUrl(`/api/media/${mediaUuid}`);
      }
    } else if (fallbackUrl) {
      if (!objectUrl) {
        setPreviewUrl(fallbackUrl);
      }
    } else if (!objectUrl) {
      setPreviewUrl(null);
    }
  }, [mediaUuid, fallbackUrl, objectUrl]);

  const handleUploadFile = async (file: File) => {
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      setError("សូមជ្រើសរើសប្រភេទរូបភាព PNG, JPEG, GIF ឬ WebP។");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("ទំហំរូបភាពត្រូវតែតូចជាង ឬស្មើ 10 MB។");
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    const localPreview = URL.createObjectURL(file);
    setObjectUrl(localPreview);
    setPreviewUrl(localPreview);

    try {
      setLoading(true);
      setError(null);

      const compressedFile = await compressImage(file, 1);
      const media = await uploadStoreMediaFile(compressedFile, purpose);

      onMediaUuidChange(media.uuid);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "ការផ្ទុករូបភាពឡើងបរាជ័យ។",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      void handleUploadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleUploadFile(file);
    }
  };

  const clearImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    setObjectUrl(null);
    setPreviewUrl(null);
    setError(null);
    onMediaUuidChange("");
  };

  const previewHeight = variant === "logo" ? "h-48" : "h-56";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/50">
        <div>
          <p className="text-sm font-bold text-gray-800">{label}</p>
          <p className="text-[11px] text-gray-400">PNG, JPG, GIF or WebP · max 10 MB</p>
        </div>

        {Boolean(mediaUuid || previewUrl) && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            <span>មានរូបភាព</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview & Drop Area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex ${previewHeight} cursor-pointer items-center justify-center overflow-hidden bg-gray-50 transition ${
          isDragging ? "border-2 border-dashed border-[#137A3D] bg-emerald-50/40" : ""
        }`}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className={
                variant === "logo"
                  ? "h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                  : "h-full w-full object-cover transition duration-300 group-hover:scale-105"
              }
            />

            {/* Hover overlay to override */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadCloud size={28} className="text-white drop-shadow" />
              <span className="mt-1 text-xs font-bold text-white drop-shadow">
                ចុចដើម្បីប្តូររូបភាពថ្មី
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 text-center text-gray-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#137A3D] group-hover:scale-110 transition">
              <UploadCloud size={24} />
            </div>
            <p className="mt-2 text-xs font-bold text-gray-700">
              ចុច ឬទម្លាក់រូបភាពទីនេះ
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              {variant === "logo" ? "រូបសញ្ញា Logo ហាង" : "រូបគម្រប Cover Banner"}
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <Loader2 size={28} className="mx-auto animate-spin text-[#137A3D]" />
              <p className="mt-2 text-xs font-bold text-gray-600">កំពុង Upload រូបភាព...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 p-3 bg-white border-t border-gray-100">
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-[#137A3D] transition hover:bg-emerald-100 disabled:opacity-50"
        >
          <UploadCloud size={15} />
          {previewUrl ? "ប្តូររូបភាពថ្មី" : "ជ្រើសរើសរូបភាព"}
        </button>

        {Boolean(previewUrl || mediaUuid) && (
          <button
            type="button"
            disabled={loading}
            onClick={clearImage}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>លុប</span>
          </button>
        )}
      </div>

      {error && (
        <div className="m-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium leading-5 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
