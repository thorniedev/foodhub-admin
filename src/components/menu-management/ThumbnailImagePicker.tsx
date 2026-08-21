"use client";

import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import React, { type ChangeEvent, useEffect, useRef, useState } from "react";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const ACCEPTED = "image/png,image/jpeg,image/gif,image/webp";
const MAX_SIZE = 10 * 1024 * 1024;

interface ThumbnailImagePickerProps {
  value: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
  onExistingChange?: (url: string | null) => void;
  label?: string;
  sublabel?: string;
}

export default function ThumbnailImagePicker({
  value,
  onChange,
  existingUrl,
  onExistingChange,
  label = "រូបភាព Thumbnail (រូបភាពតំណាង)",
  sublabel = "រូបភាពចម្បងដែលបង្ហាញលើបញ្ជី Website និងទំព័រមុខម្ហូប",
}: ThumbnailImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resolvedExistingUrl, setResolvedExistingUrl] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Handle newly selected File object URL
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      setImgError(false);
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);
    setImgError(false);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  // 2. Resolve existing URL or Media UUID
  useEffect(() => {
    let cancelled = false;
    const trimmed = String(existingUrl ?? "").trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") {
      setResolvedExistingUrl(null);
      setLoadingExisting(false);
      setImgError(false);
      return;
    }

    setImgError(false);

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (UUID_REGEX.test(trimmed)) {
      setLoadingExisting(true);
      fetch(`/api/media/${encodeURIComponent(trimmed)}/access-url`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Status " + res.status);
          return res.json();
        })
        .then((data) => {
          if (!cancelled) {
            const url =
              data?.url || data?.payload?.url || data?.data?.url || data?.accessUrl;
            setResolvedExistingUrl(url || resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
            setLoadingExisting(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResolvedExistingUrl(resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
            setLoadingExisting(false);
          }
        });
    } else {
      setResolvedExistingUrl(resolveFoodHubCatalogImageUrl(trimmed) || trimmed);
      setLoadingExisting(false);
    }

    return () => {
      cancelled = true;
    };
  }, [existingUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      setError("អនុញ្ញាតតែ PNG, JPEG, GIF និង WebP។");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("រូបភាពត្រូវតែតូចជាង 10MB។");
      return;
    }

    setError(null);
    setImgError(false);
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setImgError(false);
    if (onExistingChange) {
      onExistingChange(null);
    }
  };

  const activeDisplayUrl = previewUrl || resolvedExistingUrl;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">{label}</h4>
          <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
          Required / ចាំបាច់
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={ACCEPTED}
        onChange={handleFileChange}
      />

      {loadingExisting ? (
        <div className="flex h-44 w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : activeDisplayUrl ? (
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          {/* Thumbnail preview image */}
          <div className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gray-100 shadow-sm">
            {imgError ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-2 text-center text-gray-400">
                <span className="text-3xl">🍜</span>
                <span className="mt-1.5 text-[10px] font-bold text-gray-400 leading-tight">
                  មិនអាចទាញយករូបភាព
                </span>
              </div>
            ) : (
              <img
                src={activeDisplayUrl}
                alt="Thumbnail preview"
                className="h-full w-full object-cover transition group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            )}
            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              {previewUrl ? "រូបថ្មី (New)" : "Thumbnail"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-1 flex-col justify-center gap-2.5">
            <p className="text-xs font-semibold text-gray-700">
              {previewUrl
                ? "បានជ្រើសរូបភាពថ្មីរួចរាល់"
                : imgError
                ? "រូបភាពបច្ចុប្បន្នមានបញ្ហា សូមផ្លាស់ប្តូររូបថ្មី"
                : "រូបភាព Thumbnail បច្ចុប្បន្ន"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs transition hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700"
              >
                <RefreshCw size={13} />
                ផ្លាស់ប្តូររូបភាព (Change)
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
              >
                <Trash2 size={13} />
                ដកចេញ (Remove)
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              អនុញ្ញាតទម្រង់ PNG, JPEG, WebP (អតិបរមា 10MB)
            </p>
          </div>
        </div>
      ) : (
        /* Empty dropzone */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50/80 active:scale-[0.99]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-[#137A3D]">
            <UploadCloud size={20} />
          </div>
          <span className="mt-2 text-sm font-bold">+ បង្ហោះរូបភាព Thumbnail (Upload Thumbnail)</span>
          <span className="mt-0.5 text-[11px] text-gray-400">
            ចុចដើម្បីជ្រើសរើសរូបភាពចម្បង (PNG, JPEG, WebP)
          </span>
        </button>
      )}

      {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
