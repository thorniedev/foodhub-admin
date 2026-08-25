"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type {
  AdminBannerResponse,
  BannerCategory,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "../../types/banner";
import { BANNER_CATEGORIES, BANNER_CATEGORY_LABELS } from "../../types/banner";
import { resolveImageUrl } from "../../services/adminBannerApi";
import { compressImage } from "../../utils/imageCompression";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface BannerFormModalProps {
  open?: boolean;
  onClose: () => void;
  editing: AdminBannerResponse | null;
  defaultCategory?: BannerCategory;
  onSaved?: (banner: AdminBannerResponse) => void;
  onSaveSubmit?: (
    payload: CreateBannerPayload | UpdateBannerPayload,
    imageFile?: File | null,
  ) => Promise<AdminBannerResponse | void>;
}

export default function BannerFormModal({
  open = true,
  onClose,
  editing,
  defaultCategory = "MAIN",
  onSaved,
  onSaveSubmit,
}: BannerFormModalProps) {
  const isEditing = Boolean(editing);

  // Form states
  const [category, setCategory] = useState<BannerCategory>(
    editing?.category || defaultCategory,
  );
  const [title, setTitle] = useState(editing?.title || "");
  const [location, setLocation] = useState(editing?.location || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    editing?.imageUrl || null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync editing item on mount or change
  useEffect(() => {
    if (editing) {
      setCategory(editing.category);
      setTitle(editing.title || "");
      setLocation(editing.location || "");
      setDescription(editing.description || "");
      setExistingImageUrl(editing.imageUrl || null);
      setImageFile(null);
      setImagePreview(null);
    } else {
      setCategory(defaultCategory);
      setTitle("");
      setLocation("");
      setDescription("");
      setExistingImageUrl(null);
      setImageFile(null);
      setImagePreview(null);
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [editing, defaultCategory]);

  // Clear location if category is changed away from LOCATION
  useEffect(() => {
    if (category !== "LOCATION") {
      setLocation("");
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.location;
        return next;
      });
    }
  }, [category]);

  // Revoke object URL on unmount or file change
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const handleFileSelection = async (file: File | undefined | null) => {
    if (!file) return;

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "សូមជ្រើសរើសរូបភាពប្រភេទ JPEG, PNG ឬ WebP (Valid image types only).",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "ទំហំរូបភាពត្រូវតែតូចជាង 5MB (Image size must be less than 5MB).",
      }));
      return;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    try {
      const compressed = await compressImage(file, 1);
      setImageFile(compressed);
    } catch {
      setImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      void handleFileSelection(droppedFile);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "សូមបញ្ចូលចំណងជើងបែនណឺ (Title is required).";
    } else if (title.trim().length > 255) {
      errors.title = "ចំណងជើងមិនអាចលើសពី ២៥៥ តួអក្សរឡើយ (Max 255 chars).";
    }

    if (category === "LOCATION") {
      if (!location.trim()) {
        errors.location =
          "សូមបញ្ជាក់ទីតាំងសម្រាប់ Category LOCATION (Location is required).";
      } else if (location.trim().length > 100) {
        errors.location =
          "ទីតាំងមិនអាចលើសពី ១០០ តួអក្សរឡើយ (Max 100 chars).";
      }
    }

    if (!isEditing && !imageFile) {
      errors.image = "សូមបញ្ចូលរូបភាពសម្រាប់បែនណឺ (Banner image is required).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError(null);

    const payload: CreateBannerPayload = {
      category,
      title: title.trim(),
      location: category === "LOCATION" ? location.trim() || null : null,
      description: description.trim() || null,
    };

    try {
      if (onSaveSubmit) {
        const result = await onSaveSubmit(payload, imageFile);
        if (result && onSaved) onSaved(result);
      } else {
        // Fallback directly to adminBannerApi service
        const { adminBannerApi } = await import("../../services/adminBannerApi");
        let result: AdminBannerResponse;
        if (isEditing && editing) {
          result = await adminBannerApi.updateBanner(
            editing.id,
            payload,
            imageFile,
          );
        } else {
          result = await adminBannerApi.createBanner(
            payload,
            imageFile as File,
          );
        }
        if (onSaved) onSaved(result);
      }
      onClose();
    } catch (err: any) {
      if (err?.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setGeneralError(
        err?.message || "មានបញ្ហាក្នុងការរក្សាទុកបែនណឺ សូមព្យាយាមម្តងទៀត។",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDisplayUrl =
    imagePreview || (existingImageUrl ? resolveImageUrl(existingImageUrl) : null);

  if (!open) return null;

  return (
    <Dialog.Root open onOpenChange={(isOpen) => !isOpen && !isSubmitting && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[2px] transition-opacity" />
        <Dialog.Popup className="fixed inset-0 z-[150] flex items-center justify-center p-4 outline-none">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl transition-all">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-7 py-6 backdrop-blur-xs">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {isEditing
                    ? "កែសម្រួលផ្ទាំងបែនណឺ (Edit Banner)"
                    : "បន្ថែមផ្ទាំងបែនណឺថ្មី (Create Banner)"}
                </p>
                <p className="mt-1 text-lg text-gray-500">
                  {isEditing
                    ? "ផ្លាស់ប្តូរព័ត៌មាន ឬរូបភាពរបស់បែនណឺ"
                    : "កំណត់រូបភាព ចំណងជើង និងប្រភេទបែនណឺ"}
                </p>
              </div>
              <Dialog.Close
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={22} />
              </Dialog.Close>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 p-7" noValidate>
              {/* Image Uploader */}
              <div>
                <label className="mb-2 block text-lg font-bold text-gray-800">
                  រូបភាពបែនណឺ (Banner Image)
                  {!isEditing && <span className="text-red-500"> *</span>}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_MIME_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    void handleFileSelection(file);
                  }}
                />

                {activeDisplayUrl ? (
                  <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:flex-row">
                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:w-60">
                      <img
                        src={activeDisplayUrl}
                        alt="Banner Preview"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/60 px-3 py-1 text-lg font-bold text-white backdrop-blur-xs">
                        {imagePreview ? "រូបភាពថ្មី (New)" : "បច្ចុប្បន្ន (Current)"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-center gap-3">
                      <p className="text-lg font-semibold text-gray-700">
                        {imageFile ? imageFile.name : "បានជ្រើសរូបភាពរួចរាល់"}
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg font-bold text-gray-700 shadow-xs hover:bg-gray-50 hover:text-emerald-700"
                        >
                          ប្តូររូបភាព (Change)
                        </button>
                        {imageFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-lg font-bold text-red-600 hover:bg-red-100"
                          >
                            ដកចេញ (Remove)
                          </button>
                        )}
                      </div>
                      <p className="text-lg text-gray-500">
                        JPEG, PNG, WebP (អតិបរមា 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${isDragging
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-gray-300 bg-gray-50/60 hover:border-emerald-400 hover:bg-emerald-50/20"
                      }`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <UploadCloud size={28} />
                    </div>
                    <span className="mt-3 text-lg font-bold text-gray-800">
                      ចុចដើម្បីជ្រើសរើស ឬទម្លាក់រូបភាពទីនេះ
                    </span>
                    <span className="mt-1 text-lg text-gray-500">
                      គាំទ្រ JPEG, PNG, WebP (ទំហំអតិបរមា 5MB)
                    </span>
                  </div>
                )}

                {fieldErrors.image && (
                  <p className="mt-2 text-lg font-semibold text-red-500">
                    {fieldErrors.image}
                  </p>
                )}
              </div>

              {/* Category & Conditional Location */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-bold text-gray-800">
                    ប្រភេទ (Category) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as BannerCategory)
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-lg font-medium text-gray-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
                    >
                      {BANNER_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {BANNER_CATEGORY_LABELS[cat] || cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  {fieldErrors.category && (
                    <p className="mt-2 text-lg font-semibold text-red-500">
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                {/* Conditional Location Field */}
                {category === "LOCATION" && (
                  <div>
                    <label className="mb-2 block text-lg font-bold text-gray-800">
                      ទីតាំង (Location) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.location;
                          return next;
                        });
                      }}
                      placeholder="ឧ. Siem Reap, Phnom Penh..."
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
                    />
                    {fieldErrors.location && (
                      <p className="mt-2 text-lg font-semibold text-red-500">
                        {fieldErrors.location}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-lg font-bold text-gray-800">
                  ចំណងជើង (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                  }}
                  placeholder="ឧ. ពិធីបុណ្យអុំទូក ឬ មុខម្ហូបពិសេសប្រចាំខែ"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg font-medium text-gray-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
                />
                {fieldErrors.title && (
                  <p className="mt-2 text-lg font-semibold text-red-500">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-lg font-bold text-gray-800">
                  ការពិពណ៌នា (Description - Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="សរសេរការពិពណ៌នាសង្ខេបអំពីបែនណឺនេះ..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-lg font-medium text-gray-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10"
                />
                {fieldErrors.description && (
                  <p className="mt-2 text-lg font-semibold text-red-500">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Notice */}
              {!isEditing && (
                <p className="text-lg text-gray-500">
                  ℹ️ ផ្ទាំងបែនណឺដែលបានបង្កើតថ្មី នឹងស្ថិតក្នុងស្ថានភាព Draft (មិនទាន់ផ្សាយ) ជាលំនាំដើម។ អ្នកអាចបើកប៊ូតុងផ្សាយនៅពេលក្រោយ។
                </p>
              )}

              {/* General Error Alert */}
              {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-lg font-semibold text-red-600">
                  {generalError}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-lg font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#137A3D] px-7 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-[#0f6331] active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ImageIcon size={20} />
                  )}
                  {isSubmitting
                    ? "កំពុងរក្សាទុក..."
                    : isEditing
                      ? "កែសម្រួលបែនណឺ"
                      : "បង្កើតបែនណឺ"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
