"use client";

import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Share2,
  Store as StoreIcon,
  Upload,
  X,
} from "lucide-react";

import type {
  Store,
  StoreOperatingStatus,
  StoreSocialLink,
  UpdateStorePayload,
} from "@/src/types/shop";
import type { StoreMediaPurpose } from "@/src/types/media";

import { imageUrlOrNull } from "@/src/lib/shopFormat";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import { uploadStoreMediaFile } from "@/src/lib/storeMediaClient";
import { compressImage } from "@/src/utils/imageCompression";
import StoreMediaImage from "./detail/StoreMediaImage";
import StoreSelect from "./StoreSelect";
import StoreSocialLinksEditor, {
  getSocialLinksError,
} from "./StoreSocialLinksEditor";

/* ============================================================
   ZOD SCHEMA
============================================================ */

const schema = z.object({
  storeName: z
    .string()
    .min(1, "ឈ្មោះហាងត្រូវតែបញ្ចូល")
    .max(200, "ឈ្មោះហាងត្រូវតែខ្លីជាង 200 តួអក្សរ"),
  description: z.string().max(2000, "ការពិពណ៌នាត្រូវតែខ្លីជាង 2000 តួអក្សរ").optional(),
  addressLine: z.string().min(1, "អាសយដ្ឋានត្រូវតែបញ្ចូល"),
  city: z.string().optional(),
  province: z.string().optional(),
  countryCode: z
    .string()
    .min(2, "កូដប្រទេសត្រូវតែ 2 ឬ 3 តួអក្សរ")
    .max(3, "កូដប្រទេសត្រូវតែ 2 ឬ 3 តួអក្សរ"),
  timezone: z.string().min(1, "តំបន់ម៉ោងត្រូវតែបញ្ចូល"),
  latitude: z
    .string()
    .min(1, "អក្សរ Latitude ត្រូវតែបញ្ចូល")
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= -90 && n <= 90;
    }, "Latitude ត្រូវនៅចន្លោះ -90 ដល់ 90"),
  longitude: z
    .string()
    .min(1, "អក្សរ Longitude ត្រូវតែបញ្ចូល")
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= -180 && n <= 180;
    }, "Longitude ត្រូវនៅចន្លោះ -180 ដល់ 180"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\+?[\d\s\-().]{6,20}$/.test(v.trim()),
      "លេខទូរស័ព្ទមិនត្រឹមត្រូវ"
    ),
  email: z
    .string()
    .optional()
    .refine(
      (v) => !v || z.string().email().safeParse(v.trim()).success,
      "អ៊ីមែលមិនត្រឹមត្រូវ"
    ),
  logoMediaUuid: z.string().optional(),
  coverMediaUuid: z.string().optional(),
  priceLevel: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 1 && Number(v) <= 4 && Number.isInteger(Number(v))),
      "កម្រិតតម្លៃត្រូវនៅចន្លោះ 1 ដល់ 4"
    ),
  hygieneRating: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 0 && Number(v) <= 5),
      "ពិន្ទុអនាម័យត្រូវនៅចន្លោះ 0 ដល់ 5"
    ),
  operatingStatus: z.enum(["OPEN", "CLOSED", "TEMPORARILY_CLOSED"]),
});

type FormValues = z.infer<typeof schema>;

function toValidUuidOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(v) ? v : null;
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function ShopEditModal({
  store,
  saving,
  onClose,
  onSubmit,
}: {
  store: Store | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateStorePayload) => Promise<void>;
}) {
  const [socialLinks, setSocialLinks] = useState<StoreSocialLink[]>([]);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      storeName: "",
      description: "",
      addressLine: "",
      city: "",
      province: "",
      countryCode: "KH",
      timezone: "Asia/Phnom_Penh",
      latitude: "",
      longitude: "",
      phoneNumber: "",
      email: "",
      logoMediaUuid: "",
      coverMediaUuid: "",
      priceLevel: "",
      hygieneRating: "",
      operatingStatus: "OPEN",
    },
  });

  /* Load store data into form */
  useEffect(() => {
    if (!store) return;

    setSocialLinks(
      [...(store.socialLinks ?? [])]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((link, i) => ({
          platform: link.platform,
          profileUrl: link.profileUrl ?? "",
          displayOrder: Number(link.displayOrder) || i + 1,
        }))
    );

    reset({
      storeName: store.storeName ?? "",
      description: store.description ?? "",
      addressLine: store.addressLine ?? "",
      city: store.city ?? "",
      province: store.province ?? "",
      countryCode: store.countryCode ?? "KH",
      timezone: store.timezone ?? "Asia/Phnom_Penh",
      latitude: String(store.latitude ?? ""),
      longitude: String(store.longitude ?? ""),
      phoneNumber: store.phoneNumber ?? "",
      email: store.email ?? "",
      logoMediaUuid: store.logoMediaUuid ?? "",
      coverMediaUuid: store.coverMediaUuid ?? "",
      priceLevel: store.priceLevel == null ? "" : String(store.priceLevel),
      hygieneRating: store.hygieneRating == null ? "" : String(store.hygieneRating),
      operatingStatus:
        store.operatingStatus === "CLOSED"
          ? "CLOSED"
          : store.operatingStatus === "TEMPORARILY_CLOSED"
            ? "TEMPORARILY_CLOSED"
            : "OPEN",
    });

    setSocialError(null);
    setSubmitError(null);
  }, [store, reset]);

  /* Disable background scroll */
  useEffect(() => {
    if (!store) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [store]);

  if (!store) return null;

  const submit = handleSubmit(async (values) => {
    // Normalize and clean social links with consecutive displayOrders (1, 2, 3...)
    const cleanedSocialLinks = socialLinks
      .map((link) => ({
        platform: link.platform.trim(),
        profileUrl: link.profileUrl.trim(),
        displayOrder: Number(link.displayOrder) || 1,
      }))
      .filter((link) => link.platform && link.profileUrl)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((link, idx) => ({
        platform: link.platform,
        profileUrl: link.profileUrl,
        displayOrder: idx + 1,
      }));

    const err = getSocialLinksError(cleanedSocialLinks);
    if (err) { setSocialError(err); return; }
    setSocialError(null);

    // Only send socialLinks if the user actually modified them
    const origSocial = (store.socialLinks ?? []).map((l, i) => ({
      platform: l.platform,
      profileUrl: (l.profileUrl ?? "").trim(),
      displayOrder: Number(l.displayOrder) || i + 1,
    }));
    const socialLinksModified =
      JSON.stringify(cleanedSocialLinks) !== JSON.stringify(origSocial);

    try {
      setSubmitError(null);
      await onSubmit({
        storeName: values.storeName.trim(),
        description: values.description?.trim() || null,
        addressLine: values.addressLine.trim(),
        commune: store.commune ?? null,
        district: store.district ?? null,
        city: values.city?.trim() || null,
        province: values.province?.trim() || null,
        countryCode: values.countryCode.trim().toUpperCase(),
        postalCode: store.postalCode ?? null,
        timezone: values.timezone.trim(),
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        phoneNumber: values.phoneNumber?.trim() || null,
        email: values.email?.trim() || null,
        logoMediaUuid:
          toValidUuidOrNull(values.logoMediaUuid) ??
          toValidUuidOrNull(store.logoMediaUuid),
        coverMediaUuid:
          toValidUuidOrNull(values.coverMediaUuid) ??
          toValidUuidOrNull(store.coverMediaUuid),
        priceLevel: values.priceLevel?.trim() ? Number(values.priceLevel) : null,
        hygieneRating: values.hygieneRating?.trim() ? Number(values.hygieneRating) : null,
        operatingStatus: values.operatingStatus as StoreOperatingStatus,
        ...(socialLinksModified ? { socialLinks: cleanedSocialLinks } : {}),
      });
    } catch (err: unknown) {
      setSubmitError(getShopApiErrorMessage(err));
    }
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[4px]">
      {/* Modal container */}
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* ===== STICKY HEADER ===== */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#137A3D]">
              <Pencil size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-[#0F5A2C]">កែប្រែព័ត៌មានហាង</p>
              <p className="mt-0.5 truncate text-base text-gray-400">{store.storeName}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={submit} noValidate className="space-y-5 p-6 sm:p-8">

          {/* ── STORE INFO ── */}
          <FormSection icon={<StoreIcon size={20} />} title="ព័ត៌មានហាង">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ឈ្មោះហាង *" error={errors.storeName?.message}>
                <input
                  {...register("storeName")}
                  placeholder="ឧ. ហាងបាយណាគ"
                  className={inputCls(!!errors.storeName)}
                />
              </Field>

              <Field label="ស្ថានភាពដំណើរការ *" error={errors.operatingStatus?.message}>
                <Controller
                  name="operatingStatus"
                  control={control}
                  render={({ field }) => (
                    <StoreSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "OPEN", label: "បើក" },
                        { value: "CLOSED", label: "បិទ" },
                        { value: "TEMPORARILY_CLOSED", label: "បិទបណ្តោះអាសន្ន" },
                      ]}
                    />
                  )}
                />
              </Field>

              <Field label="ប្រទេស *" error={errors.countryCode?.message}>
                <input
                  {...register("countryCode")}
                  placeholder="KH"
                  maxLength={3}
                  className={inputCls(!!errors.countryCode)}
                />
              </Field>

              <Field label="តំបន់ម៉ោង *" error={errors.timezone?.message}>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <StoreSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "Asia/Phnom_Penh", label: "Asia/Phnom_Penh (ICT +7)" },
                        { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT +7)" },
                        { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (ICT +7)" },
                        { value: "Asia/Singapore", label: "Asia/Singapore (SGT +8)" },
                        { value: "UTC", label: "UTC ±0" },
                      ]}
                    />
                  )}
                />
              </Field>

              <Field label="ការពិពណ៌នា" error={errors.description?.message} className="sm:col-span-2">
                <textarea
                  {...register("description")}
                  rows={4}
                  spellCheck={false}
                  autoComplete="off"
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                  placeholder="ការពិពណ៌នាអំពីហាង..."
                  className={`${inputCls(!!errors.description)} !h-auto resize-none`}
                />
              </Field>
            </div>
          </FormSection>

          {/* ── LOCATION ── */}
          <FormSection icon={<MapPin size={20} />} title="ព័ត៌មានទីតាំង">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="អាសយដ្ឋានលម្អិត *" error={errors.addressLine?.message} className="sm:col-span-2">
                <input
                  {...register("addressLine")}
                  placeholder="ឧ. ផ្លូវ 310, ភ្នំពេញ"
                  className={inputCls(!!errors.addressLine)}
                />
              </Field>

              <Field label="ក្រុង / ខេត្ត" error={errors.city?.message}>
                <input
                  {...register("city")}
                  placeholder="ឧ. ភ្នំពេញ"
                  className={inputCls(!!errors.city)}
                />
              </Field>

              <Field label="ខេត្ត / ឃុំ" error={errors.province?.message}>
                <input
                  {...register("province")}
                  placeholder="ឧ. ភ្នំពេញ"
                  className={inputCls(!!errors.province)}
                />
              </Field>

              <Field label="Latitude *" error={errors.latitude?.message}>
                <input
                  {...register("latitude")}
                  type="number"
                  step="any"
                  placeholder="ឧ. 11.5564"
                  className={inputCls(!!errors.latitude)}
                />
              </Field>

              <Field label="Longitude *" error={errors.longitude?.message}>
                <input
                  {...register("longitude")}
                  type="number"
                  step="any"
                  placeholder="ឧ. 104.9282"
                  className={inputCls(!!errors.longitude)}
                />
              </Field>
            </div>
          </FormSection>

          {/* ── CONTACT ── */}
          <FormSection icon={<Phone size={20} />} title="ព័ត៌មានទំនាក់ទំនង">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="លេខទូរស័ព្ទ" error={errors.phoneNumber?.message}>
                <input
                  {...register("phoneNumber")}
                  type="tel"
                  placeholder="ឧ. +855 12 345 678"
                  className={inputCls(!!errors.phoneNumber)}
                />
              </Field>

              <Field label="អ៊ីមែល" error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="ឧ. store@example.com"
                  className={inputCls(!!errors.email)}
                />
              </Field>

              <Field label="កម្រិតតម្លៃ (1–4)" error={errors.priceLevel?.message}>
                <Controller
                  name="priceLevel"
                  control={control}
                  render={({ field }) => (
                    <StoreSelect
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={[
                        { value: "", label: "— មិនបានកំណត់" },
                        { value: "1", label: "កម្រិតទាប (ថោក)" },
                        { value: "2", label: "កម្រិតមធ្យម (សមរម្យ)" },
                        { value: "3", label: "កម្រិតខ្ពស់ (ថ្លៃ)" },
                        { value: "4", label: "កម្រិតប្រណិត (ថ្លៃខ្លាំង)" },
                      ]}
                    />
                  )}
                />
              </Field>

              <Field label="ពិន្ទុអនាម័យ (0–5)" error={errors.hygieneRating?.message}>
                <input
                  {...register("hygieneRating")}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="ឧ. 4.7"
                  className={inputCls(!!errors.hygieneRating)}
                />
              </Field>
            </div>
          </FormSection>

          {/* ── SOCIAL LINKS ── */}
          <FormSection icon={<Share2 size={20} />} title="បណ្ដាញសង្គម">
            <StoreSocialLinksEditor
              links={socialLinks}
              onChange={(links) => { setSocialLinks(links); setSocialError(null); }}
              disabled={saving}
            />
            {socialError && (
              <ErrorBanner message={socialError} />
            )}
          </FormSection>

          {/* ── MEDIA: ONLY 2 INTERACTIVE CARDS ── */}
          <FormSection icon={<ImageIcon size={20} />} title="រូបភាពហាង">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Card 1: Logo */}
              <Controller
                name="logoMediaUuid"
                control={control}
                render={({ field }) => (
                  <SingleStoreImagePicker
                    label="រូបសញ្ញាហាង (Logo)"
                    purpose="STORE_LOGO"
                    mediaUuid={field.value ?? ""}
                    originalMediaUuid={store.logoMediaUuid}
                    originalImageUrl={imageUrlOrNull(store.logoUrl)}
                    onMediaUuidChange={field.onChange}
                    variant="logo"
                    disabled={saving}
                  />
                )}
              />

              {/* Card 2: Cover */}
              <Controller
                name="coverMediaUuid"
                control={control}
                render={({ field }) => (
                  <SingleStoreImagePicker
                    label="រូបគម្របហាង (Cover)"
                    purpose="STORE_COVER"
                    mediaUuid={field.value ?? ""}
                    originalMediaUuid={store.coverMediaUuid}
                    originalImageUrl={imageUrlOrNull(store.coverImageUrl)}
                    onMediaUuidChange={field.onChange}
                    variant="cover"
                    disabled={saving}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* ── SUBMIT ERROR BANNER ── */}
          {submitError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-bold">បរាជ័យក្នុងការរក្សាទុក</p>
                <p className="mt-0.5 font-normal text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          {/* ── ACTIONS ── */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-7 text-base font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#137A3D] px-8 text-base font-semibold text-white shadow-sm transition hover:bg-[#0f6833] disabled:opacity-60"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   HELPER: inputCls
============================================================ */

function inputCls(hasError: boolean) {
  return [
    "h-12 w-full rounded-xl border bg-gray-50 px-4 text-base text-gray-800 outline-none transition",
    "placeholder:text-gray-400",
    "hover:border-gray-300",
    "focus:border-[#137A3D] focus:bg-white focus:ring-2 focus:ring-[#137A3D]/15",
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100"
      : "border-gray-200",
  ].join(" ");
}

/* ============================================================
   SINGLE STORE IMAGE PICKER (CLICK IMAGE TO REPLACE)
============================================================ */

const ACCEPTED_TYPES = "image/png,image/jpeg,image/gif,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

function SingleStoreImagePicker({
  label,
  purpose,
  mediaUuid,
  originalMediaUuid,
  originalImageUrl,
  onMediaUuidChange,
  variant,
  disabled = false,
}: {
  label: string;
  purpose: StoreMediaPurpose;
  mediaUuid: string;
  originalMediaUuid: string | null | undefined;
  originalImageUrl: string | null;
  onMediaUuidChange: (uuid: string) => void;
  variant: "logo" | "cover";
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
      setError("គាំទ្រតែប្រភេទរូបភាព PNG, JPEG, GIF និង WebP ប៉ុណ្ណោះ។");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("ទំហំរូបភាពមិនត្រូវលើសពី 10 MB ឡើយ។");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(previewUrl);

    try {
      setLoading(true);
      setError(null);

      const compressedFile = await compressImage(file, 1);
      const media = await uploadStoreMediaFile(compressedFile, purpose);
      onMediaUuidChange(media.uuid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ការ upload រូបភាពបានបរាជ័យ។");
      URL.revokeObjectURL(previewUrl);
      setLocalPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setError(null);
    onMediaUuidChange("");
  };

  const hasNewUpload = Boolean(mediaUuid && localPreview);
  const hasOriginal = Boolean(originalMediaUuid || originalImageUrl);
  const previewHeight = variant === "logo" ? "h-48" : "h-56";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-gray-200">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-base font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">ចុចលើរូបភាពដើម្បីប្តូរ</p>
        </div>

        {hasNewUpload ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              រូបភាពថ្មី
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="កំណត់ដើមវិញ"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        ) : hasOriginal ? (
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
            រូបភាពបច្ចុប្បន្ន
          </span>
        ) : (
          <span className="text-xs text-gray-400">មិនទាន់មាន</span>
        )}
      </div>

      {/* Clickable Image Preview Container */}
      <div className="p-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || loading}
        />

        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
          aria-label={`ផ្លាស់ប្តូរ ${label}`}
          className={`
            group relative flex ${previewHeight} w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center outline-none transition
            hover:border-[#137A3D]/50 hover:bg-emerald-50/20
            focus:border-[#137A3D] focus:ring-2 focus:ring-[#137A3D]/20
            disabled:cursor-not-allowed disabled:opacity-70
          `}
        >
          {/* 1. If newly selected local image */}
          {localPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localPreview}
              alt={label}
              className={
                variant === "logo"
                  ? "h-full w-full object-contain p-4"
                  : "h-full w-full object-cover"
              }
            />
          ) : originalMediaUuid ? (
            /* 2. If store has media UUID */
            <StoreMediaImage
              mediaUuid={originalMediaUuid}
              alt={label}
              className={
                variant === "logo"
                  ? "h-full w-full object-contain p-4"
                  : "h-full w-full object-cover"
              }
            />
          ) : originalImageUrl ? (
            /* 3. If fallback URL exists */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={originalImageUrl}
              alt={label}
              className={
                variant === "logo"
                  ? "h-full w-full object-contain p-4"
                  : "h-full w-full object-cover"
              }
            />
          ) : (
            /* 4. Empty State */
            <div className="flex flex-col items-center justify-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D] transition group-hover:scale-105">
                <Camera size={24} />
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-700">ចុចដើម្បី Upload</p>
              <p className="mt-0.5 text-xs text-gray-400">PNG, JPG, WebP ក្រោម 10MB</p>
            </div>
          )}

          {/* Hover Overlay indicating click to replace */}
          {(localPreview || hasOriginal) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-200 group-hover:bg-black/40 group-focus:bg-black/40">
              <div className="flex scale-95 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#137A3D] opacity-0 shadow-lg transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus:scale-100 group-focus:opacity-100">
                <Upload size={16} />
                <span>ចុចដើម្បីប្តូររូប</span>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
              <Loader2 size={28} className="animate-spin text-[#137A3D]" />
              <p className="mt-2 text-xs font-semibold text-gray-700">កំពុង Upload...</p>
            </div>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   FORM SECTION
============================================================ */

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-gray-100 bg-gray-50/50 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#137A3D]">
          {icon}
        </div>
        <p className="text-xl font-bold text-[#0F5A2C]">{title}</p>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required = false,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  const isRequired = required || label.includes("*");
  const cleanLabel = label.replace(/\s*\*+/g, "").trim();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {cleanLabel}
        {isRequired && <span className="ml-1 text-red-500 font-bold">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
          <AlertTriangle size={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   ERROR BANNER
============================================================ */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
