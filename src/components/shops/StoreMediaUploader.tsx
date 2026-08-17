"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import {
  CheckCircle2,
  FileCode,
  ImageIcon,
  Link2,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import {
  importStoreMediaFromUrl,
  uploadStoreMediaFile,
} from "@/src/lib/storeMediaClient";
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

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uuidInput, setUuidInput] = useState(mediaUuid || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url" | "uuid">("upload");
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
    setUuidInput(mediaUuid || "");
    if (mediaUuid && !previewUrl) {
      setPreviewUrl(`/api/media/${mediaUuid}`);
    }
  }, [mediaUuid, previewUrl]);

  const replacePreviewObjectUrl = (url: string | null) => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(url);

    if (url) {
      setPreviewUrl(url);
    }
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

  const handleImportUrl = async () => {
    const cleanUrl = imageUrlInput.trim();

    if (!cleanUrl) {
      setError("Please paste an image URL.");
      return;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError("Please enter a valid image URL.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const media = await importStoreMediaFromUrl(cleanUrl, purpose);

      replacePreviewObjectUrl(null);
      setPreviewUrl(cleanUrl);
      onMediaUuidChange(media.uuid);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Image URL import failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyUuid = () => {
    const clean = uuidInput.trim();
    if (!clean) {
      clearImage();
      return;
    }
    setError(null);
    onMediaUuidChange(clean);
    setPreviewUrl(`/api/media/${clean}`);
  };

  const clearImage = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(null);
    setPreviewUrl(null);
    setImageUrlInput("");
    setUuidInput("");
    setError(null);

    onMediaUuidChange("");
  };

  const previewHeight = variant === "logo" ? "h-44" : "h-52";

  return (
    <div className="overflow-hidden rounded-[22px] border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-[#F97316]">{label}</p>
            <p className="mt-1 text-sm text-gray-400">
              PNG, JPG, GIF or WebP · max 10 MB
            </p>
          </div>

          {mediaUuid && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <CheckCircle2 size={14} />
              Attached
            </div>
          )}
        </div>
      </div>

      <div
        className={`relative flex ${previewHeight} items-center justify-center overflow-hidden bg-gray-50`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className={
              variant === "logo"
                ? "h-full w-full object-contain p-5"
                : "h-full w-full object-cover"
            }
          />
        ) : (
          <div className="text-center text-gray-300">
            <ImageIcon size={38} className="mx-auto" />
            <p className="mt-2 text-xs font-semibold">No image selected</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#137A3D]"
              />
              <p className="mt-2 text-xs font-bold text-gray-500">
                Uploading...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-gray-50 p-1.5">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition ${
              mode === "upload"
                ? "bg-white text-[#137A3D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Upload size={14} />
            Upload
          </button>

          <button
            type="button"
            onClick={() => setMode("url")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition ${
              mode === "url"
                ? "bg-white text-[#137A3D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Link2 size={14} />
            URL
          </button>

          <button
            type="button"
            onClick={() => setMode("uuid")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-black transition ${
              mode === "uuid"
                ? "bg-white text-[#137A3D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <FileCode size={14} />
            Media UUID
          </button>
        </div>

        {mode === "upload" && (
          <>
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
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-base font-semibold text-[#137A3D] transition hover:bg-emerald-100 disabled:opacity-50"
            >
              <Upload size={17} />
              {mediaUuid ? "Replace image" : "Choose image"}
            </button>
          </>
        )}

        {mode === "url" && (
          <div className="mt-3 flex">
            <input
              value={imageUrlInput}
              onChange={(event) => setImageUrlInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleImportUrl();
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="h-11 min-w-0 flex-1 rounded-l-xl border border-r-0 border-gray-200 px-3 text-base outline-none focus:border-[#136C34]"
            />

            <button
              type="button"
              disabled={loading || !imageUrlInput.trim()}
              onClick={() => void handleImportUrl()}
              className="rounded-r-xl bg-[#136C34] px-4 text-base text-white disabled:opacity-50"
            >
              Import
            </button>
          </div>
        )}

        {mode === "uuid" && (
          <div className="mt-3 flex">
            <input
              value={uuidInput}
              onChange={(event) => setUuidInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleApplyUuid();
                }
              }}
              placeholder="Paste media UUID (e.g. 5f894f27-...)"
              className="h-11 min-w-0 flex-1 rounded-l-xl border border-r-0 border-gray-200 px-3 text-xs font-mono outline-none focus:border-[#136C34]"
            />

            <button
              type="button"
              onClick={handleApplyUuid}
              className="rounded-r-xl bg-[#136C34] px-4 text-base text-white hover:bg-[#0f592b]"
            >
              Set
            </button>
          </div>
        )}

        {mediaUuid && (
          <div className="mt-2 flex items-center justify-between">
            <span className="truncate text-[11px] font-mono text-gray-400">
              ID: {mediaUuid}
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={clearImage}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
