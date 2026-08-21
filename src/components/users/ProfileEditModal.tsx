"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  Camera,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { AdminProfile, UpdateAdminProfilePayload } from "@/src/types/userProfile";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";
import { uploadCatalogMediaFile } from "@/src/lib/catalogMediaClient";
import { compressImage } from "@/src/utils/imageCompression";
import UserAvatar from "./UserAvatar";

const profileEditSchema = z.object({
  profileName: z
    .string()
    .trim()
    .min(1, "សូមបញ្ចូលឈ្មោះកម្រងព័ត៌មាន")
    .max(50, "ឈ្មោះមិនអាចលើសពី 50 តួអក្សរ"),
  relationship: z.string().min(1, "សូមជ្រើសរើសទំនាក់ទំនង"),
  gender: z.string().min(1, "សូមជ្រើសរើសភេទ"),
  dateOfBirth: z.string().min(1, "សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត"),
  preferredLanguage: z.string().min(1, "សូមជ្រើសរើសភាសា"),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

interface ProfileEditModalProps {
  profile: AdminProfile | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateAdminProfilePayload) => Promise<void>;
}

const RELATIONSHIPS = [
  { value: "SELF", label: "ខ្លួនឯង (Self)" },
  { value: "CHILD", label: "កូន (Child)" },
  { value: "SPOUSE", label: "ប្តី/ប្រពន្ធ (Spouse)" },
  { value: "PARENT", label: "ឪពុកម្តាយ (Parent)" },
  { value: "OTHER", label: "ផ្សេងៗ (Other)" },
];

const GENDERS = [
  { value: "MALE", label: "ប្រុស (Male)" },
  { value: "FEMALE", label: "ស្រី (Female)" },
  { value: "OTHER", label: "ផ្សេងទៀត (Other)" },
  { value: "PREFER_NOT_TO_SAY", label: "មិនបញ្ជាក់" },
];

export default function ProfileEditModal({
  profile,
  saving,
  onClose,
  onSubmit,
}: ProfileEditModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarMediaUuid, setAvatarMediaUuid] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      profileName: "",
      relationship: "SELF",
      gender: "MALE",
      dateOfBirth: "",
      preferredLanguage: "km",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        profileName: profile.profileName ?? "",
        relationship: profile.relationship ?? "SELF",
        gender: profile.gender ?? "MALE",
        dateOfBirth: profile.dateOfBirth ?? "",
        preferredLanguage: profile.preferredLanguage ?? "km",
      });
      setAvatarMediaUuid(profile.avatarMediaUuid ?? null);
      setAvatarPreview(null);
      setApiError(null);
    }
  }, [profile, reset]);

  if (!profile) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setUploadingAvatar(true);
    setApiError(null);

    try {
      const compressed = await compressImage(file, 1);
      const media = await uploadCatalogMediaFile(compressed, "CATALOG_FOOD_PRIMARY");
      setAvatarMediaUuid(media.uuid);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "មិនអាច Upload រូបភាពបានទេ។ សូមព្យាយាមម្តងទៀត។";
      setApiError(msg);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarMediaUuid(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onFormSubmit = async (data: ProfileEditFormData) => {
    setApiError(null);
    try {
      await onSubmit({
        profileName: data.profileName,
        relationship: data.relationship,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        preferredLanguage: data.preferredLanguage,
        avatarMediaUuid: avatarMediaUuid || undefined,
      });
      onClose();
    } catch (err) {
      setApiError(getAdminApiErrorMessage(err));
    }
  };

  const isBusy = saving || isSubmitting || uploadingAvatar;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
      <div className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800 text-white shadow-md shadow-primary-900/20 ring-1 ring-primary-700/20">
              <Pencil size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">
                កែប្រែកម្រងព័ត៌មាន
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                កែប្រែព័ត៌មានផ្ទាល់ខ្លួនរបស់ Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-4 p-6 sm:p-8">
            {apiError && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1 font-medium">{apiError}</div>
              </div>
            )}

            {/* Avatar Uploader */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-5 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isBusy}
              />

              <div className="relative group">
                <div
                  onClick={() => !isBusy && fileInputRef.current?.click()}
                  className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-primary-200 bg-white text-primary-700 shadow-md transition hover:border-primary-500 hover:shadow-lg"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : avatarMediaUuid ? (
                    <UserAvatar
                      name={profile.profileName}
                      avatarMediaUuid={avatarMediaUuid}
                      containerClassName="h-full w-full flex items-center justify-center"
                    />
                  ) : uploadingAvatar ? (
                    <Loader2 size={24} className="animate-spin text-primary-700" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-primary-700">
                      <Camera size={26} />
                    </div>
                  )}
                </div>

                {(avatarPreview || avatarMediaUuid) && !isBusy && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title="លុបរូបភាព"
                    className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => !isBusy && fileInputRef.current?.click()}
                  className="text-sm font-bold text-primary-800 transition hover:text-primary-900"
                >
                  {uploadingAvatar ? "កំពុង Upload រូបភាព..." : avatarPreview || avatarMediaUuid ? "ប្តូររូបភាព Profile" : "+ ជ្រើសរើសរូបភាព Profile"}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG ឬ WEBP (ទំហំអតិបរមា 5MB)</p>
              </div>
            </div>

            {/* Profile Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                ឈ្មោះកម្រងព័ត៌មាន (Profile Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("profileName")}
                disabled={isBusy}
                placeholder="ឧ. គណនីផ្ទាល់ខ្លួន ឬ ឈ្មោះកូន"
                className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                  errors.profileName
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.profileName && (
                <p className="text-xs font-medium text-red-500">{errors.profileName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Relationship */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  ទំនាក់ទំនង (Relationship) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("relationship")}
                  disabled={isBusy}
                  className={`h-12 w-full rounded-2xl border bg-white px-3 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                    errors.relationship
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                  }`}
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.label}
                    </option>
                  ))}
                </select>
                {errors.relationship && (
                  <p className="text-xs font-medium text-red-500">{errors.relationship.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  ភេទ (Gender) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("gender")}
                  disabled={isBusy}
                  className={`h-12 w-full rounded-2xl border bg-white px-3 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                    errors.gender
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                  }`}
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-xs font-medium text-red-500">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  ថ្ងៃខែឆ្នាំកំណើត (DOB) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  disabled={isBusy}
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                    errors.dateOfBirth
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs font-medium text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  ភាសា (Language) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("preferredLanguage")}
                  disabled={isBusy}
                  className={`h-12 w-full rounded-2xl border bg-white px-3 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                    errors.preferredLanguage
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                  }`}
                >
                  <option value="km">ភាសាខ្មែរ (Khmer)</option>
                  <option value="en">English</option>
                </select>
                {errors.preferredLanguage && (
                  <p className="text-xs font-medium text-red-500">{errors.preferredLanguage.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:px-8">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-base font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-800 px-6 py-2.5 text-base font-bold text-white shadow-md shadow-primary-900/20 transition-all hover:bg-primary-900 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : (
                <>
                  <Save size={18} />
                  រក្សាទុកការកែប្រែ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
