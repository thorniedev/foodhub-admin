"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";

import {
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Share2,
  Store as StoreIcon,
  X,
} from "lucide-react";

import type {
  Store,
  StoreOperatingStatus,
  StoreSocialLink,
  UpdateStorePayload,
} from "@/src/types/shop";

import { imageUrlOrNull } from "@/src/lib/shopFormat";
import StoreMediaUploader from "./StoreMediaUploader";
import StoreSelect from "./StoreSelect";
import StoreSocialLinksEditor, {
  getSocialLinksError,
} from "./StoreSocialLinksEditor";

type FormState = {
  storeName: string;
  description: string;
  addressLine: string;
  city: string;
  province: string;
  countryCode: string;
  timezone: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  email: string;
  logoMediaUuid: string;
  coverMediaUuid: string;
  priceLevel: string;
  hygieneRating: string;
  operatingStatus: StoreOperatingStatus;
};

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
  const [values, setValues] = useState<FormState | null>(null);
  const [socialLinks, setSocialLinks] = useState<StoreSocialLink[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  /*
   * Load existing store data
   */
  useEffect(() => {
    if (!store) {
      setValues(null);
      setSocialLinks([]);
      return;
    }

    setSocialLinks(
      [...(store.socialLinks ?? [])]
        .sort(
          (first, second) =>
            (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
        )
        .map((link, index) => ({
          platform: link.platform,
          profileUrl: link.profileUrl ?? "",
          displayOrder: Number(link.displayOrder) || index + 1,
        })),
    );

    const addressText = store.addressLine ?? "";
    let autoCity = store.city ?? "";
    let autoProvince = store.province ?? "";

    if (!autoCity || !autoProvince) {
      if (/Phnom\s*Penh|ភ្នំពេញ/i.test(addressText)) {
        if (!autoCity) autoCity = "Phnom Penh";
        if (!autoProvince) autoProvince = "Phnom Penh";
      } else if (/Siem\s*Reap|សៀមរាប/i.test(addressText)) {
        if (!autoCity) autoCity = "Siem Reap";
        if (!autoProvince) autoProvince = "Siem Reap";
      } else if (/Battambang|បាត់ដំបង/i.test(addressText)) {
        if (!autoCity) autoCity = "Battambang";
        if (!autoProvince) autoProvince = "Battambang";
      } else if (/Sihanouk|ព្រះសីហនុ/i.test(addressText)) {
        if (!autoCity) autoCity = "Preah Sihanouk";
        if (!autoProvince) autoProvince = "Preah Sihanouk";
      } else if (/Kampot|កំពត/i.test(addressText)) {
        if (!autoCity) autoCity = "Kampot";
        if (!autoProvince) autoProvince = "Kampot";
      }
    }

    setValues({
      storeName: store.storeName ?? "",
      description: store.description ?? "",
      addressLine: store.addressLine ?? "",
      city: autoCity,
      province: autoProvince,
      countryCode: store.countryCode ?? "KH",
      timezone: store.timezone ?? "Asia/Phnom_Penh",
      latitude: String(store.latitude ?? ""),
      longitude: String(store.longitude ?? ""),
      phoneNumber: store.phoneNumber ?? "",
      email: store.email ?? "",
      logoMediaUuid: store.logoMediaUuid ?? "",
      coverMediaUuid: store.coverMediaUuid ?? "",

      priceLevel: store.priceLevel == null ? "" : String(store.priceLevel),

      hygieneRating:
        store.hygieneRating == null ? "" : String(store.hygieneRating),

      operatingStatus: store.operatingStatus ?? "UNKNOWN",
    });

    setLocalError(null);
  }, [store]);

  /*
   * Disable background page scrolling
   */
  useEffect(() => {
    if (!store) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [store]);

  if (!store || !values) return null;

  const set = (key: keyof FormState, value: string) => {
    setValues((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const latitude = Number(values.latitude);
    const longitude = Number(values.longitude);

    /*
     * Latitude validation
     */
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setLocalError("Latitude ត្រូវនៅចន្លោះ -90 និង 90។");

      return;
    }

    /*
     * Longitude validation
     */
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setLocalError("Longitude ត្រូវនៅចន្លោះ -180 និង 180។");

      return;
    }

    /*
     * Social links validation.
     *
     * The list is always sent, so removing a row here removes it on the store.
     */
    const cleanedSocialLinks = socialLinks
      .map((link, index) => ({
        platform: link.platform.trim(),
        profileUrl: link.profileUrl.trim(),
        displayOrder: Number(link.displayOrder) || index + 1,
      }))
      .filter((link) => link.platform && link.profileUrl);

    const socialLinksError = getSocialLinksError(cleanedSocialLinks);

    if (socialLinksError) {
      setLocalError(socialLinksError);

      return;
    }

    setLocalError(null);

    await onSubmit({
      storeName: values.storeName.trim(),

      description: values.description.trim() || null,

      addressLine: values.addressLine.trim(),

      city: values.city.trim() || null,

      province: values.province.trim() || null,

      countryCode: values.countryCode.trim().toUpperCase(),

      timezone: values.timezone.trim(),

      latitude,

      longitude,

      phoneNumber: values.phoneNumber.trim() || null,

      email: values.email.trim() || null,

      logoMediaUuid: values.logoMediaUuid.trim() || null,

      coverMediaUuid: values.coverMediaUuid.trim() || null,

      priceLevel: values.priceLevel.trim() ? Number(values.priceLevel) : null,

      hygieneRating: values.hygieneRating.trim()
        ? Number(values.hygieneRating)
        : null,

      operatingStatus: values.operatingStatus,

      /*
       * Sending the field replaces the store's links, so only send it when the
       * current links are known (or the admin added some). Omitting it leaves
       * whatever the store already has untouched.
       */
      ...(Array.isArray(store.socialLinks) || cleanedSocialLinks.length > 0
        ? { socialLinks: cleanedSocialLinks }
        : {}),
    });
  };

  return (
    <div
      className="
        fixed inset-0 z-[120]
        flex items-center justify-center
        bg-black/40
        p-4
        backdrop-blur-[3px]
      "
    >
      {/* Modal */}
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-5xl
          overflow-y-auto
          rounded-3xl
          border border-gray-100
          bg-white
          shadow-2xl

          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            sticky top-0 z-30
            flex items-center justify-between
            border-b border-gray-100
            bg-white/95
            px-6 py-5
            backdrop-blur-md
            sm:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4">
            {/* Header icon */}
            <div
              className="
                flex h-12 w-12
                shrink-0
                items-center justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              <Pencil size={24} />
            </div>

            {/* Header text */}
            <div className="min-w-0">
              <p
                className="
                  text-3xl
                  font-semibold
                  text-primary-800
                "
              >
                កែប្រែព័ត៌មានហាង
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-lg
                  text-gray-500
                "
              >
                {store.storeName}
              </p>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="
              flex h-11 w-11
              shrink-0
              items-center justify-center
              rounded-full
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-4
              focus:ring-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={submit} className="space-y-6 p-6 sm:p-8">
          {/* ================= STORE INFO ================= */}
          <Section icon={<StoreIcon size={22} />} title="ព័ត៌មានហាង">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="ឈ្មោះហាង"
                value={values.storeName}
                onChange={(value) => set("storeName", value)}
                required
              />

              <Field
                label="Country code"
                value={values.countryCode}
                onChange={(value) => set("countryCode", value)}
                required
              />

              <Field
                label="Timezone"
                value={values.timezone}
                onChange={(value) => set("timezone", value)}
                required
              />

              {/* Operating Status */}
              <label className="block">
                <FieldLabel>Operating status</FieldLabel>

                <StoreSelect
                  value={values.operatingStatus}
                  onChange={(value) => set("operatingStatus", value)}
                  options={[
                    {
                      value: "OPEN",
                      label: "OPEN",
                    },
                    {
                      value: "CLOSED",
                      label: "CLOSED",
                    },
                    {
                      value: "TEMPORARILY_CLOSED",
                      label: "TEMPORARILY_CLOSED",
                    },
                    {
                      value: "UNKNOWN",
                      label: "UNKNOWN",
                    },
                  ]}
                />
              </label>

              {/* Description */}
              <label className="block sm:col-span-2">
                <FieldLabel>ការពិពណ៌នា</FieldLabel>

                <textarea
                  rows={4}
                  value={values.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder="បញ្ចូលការពិពណ៌នាអំពីហាង..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    px-4 py-3.5
                    text-lg
                    leading-7
                    text-gray-800
                    outline-none
                    transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-primary-600
                    focus:bg-white
                    focus:ring-4
                    focus:ring-primary-100
                  "
                />
              </label>
            </div>
          </Section>

          {/* ================= LOCATION ================= */}
          <Section icon={<MapPin size={22} />} title="ព័ត៌មានទីតាំង">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  value={values.addressLine}
                  onChange={(value) => set("addressLine", value)}
                  required
                />
              </div>

              <Field
                label="City"
                value={values.city}
                onChange={(value) => set("city", value)}
              />

              <Field
                label="Province"
                value={values.province}
                onChange={(value) => set("province", value)}
              />

              <Field
                label="Latitude"
                type="number"
                step="any"
                value={values.latitude}
                onChange={(value) => set("latitude", value)}
                required
              />

              <Field
                label="Longitude"
                type="number"
                step="any"
                value={values.longitude}
                onChange={(value) => set("longitude", value)}
                required
              />
            </div>
          </Section>

          {/* ================= CONTACT ================= */}
          <Section icon={<Phone size={22} />} title="ព័ត៌មានទំនាក់ទំនង">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Phone"
                value={values.phoneNumber}
                onChange={(value) => set("phoneNumber", value)}
              />

              <Field
                label="Email"
                type="email"
                value={values.email}
                onChange={(value) => set("email", value)}
              />

              <Field
                label="Price level"
                type="number"
                value={values.priceLevel}
                onChange={(value) => set("priceLevel", value)}
              />

              <Field
                label="Hygiene rating"
                type="number"
                step="0.1"
                value={values.hygieneRating}
                onChange={(value) => set("hygieneRating", value)}
              />
            </div>
          </Section>

          {/* ================= SOCIAL LINKS ================= */}
          <Section icon={<Share2 size={22} />} title="Social links">
            <StoreSocialLinksEditor
              links={socialLinks}
              onChange={setSocialLinks}
              disabled={saving}
            />
          </Section>

          {/* ================= MEDIA ================= */}
          <Section icon={<ImageIcon size={22} />} title="រូបភាពហាង">
            <div className="grid gap-5 lg:grid-cols-2">
              <StoreMediaUploader
                label="រូបសញ្ញាហាង (Logo)"
                purpose="STORE_LOGO"
                mediaUuid={values.logoMediaUuid}
                fallbackUrl={
                  store.logoMediaUuid ? null : imageUrlOrNull(store.logoUrl)
                }
                onMediaUuidChange={(uuid) => set("logoMediaUuid", uuid)}
                variant="logo"
              />

              <StoreMediaUploader
                label="រូបគម្របហាង (Cover Banner)"
                purpose="STORE_COVER"
                mediaUuid={values.coverMediaUuid}
                fallbackUrl={
                  store.coverMediaUuid
                    ? null
                    : imageUrlOrNull(store.coverImageUrl)
                }
                onMediaUuidChange={(uuid) => set("coverMediaUuid", uuid)}
                variant="cover"
              />
            </div>
          </Section>

          {/* ================= ERROR ================= */}
          {localError && (
            <div
              className="
                flex items-start
                gap-3
                rounded-2xl
                border border-red-100
                bg-red-50
                px-5 py-4
                text-lg
                leading-7
                text-red-600
              "
            >
              <AlertTriangle size={21} className="mt-0.5 shrink-0" />

              <span>{localError}</span>
            </div>
          )}

          {/* ================= ACTION BUTTONS ================= */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-gray-100
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            {/* Cancel */}
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                bg-white
                px-7
                text-lg
                font-medium
                text-gray-600
                transition
                hover:border-primary-200
                hover:bg-primary-50
                hover:text-primary-800
                focus:outline-none
                focus:ring-4
                focus:ring-primary-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              បោះបង់
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                bg-primary-800
                px-7
                text-lg
                font-medium
                text-white
                transition
                hover:bg-primary-900
                focus:outline-none
                focus:ring-4
                focus:ring-primary-200
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving && <Loader2 size={20} className="animate-spin" />}
              រក្សាទុក
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-5
        sm:p-6
      "
    >
      {/* Section heading */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="
            flex h-11 w-11
            shrink-0
            items-center justify-center
            rounded-xl
            bg-primary-50
            text-primary-800
          "
        >
          {icon}
        </div>

        <p
          className="
            text-3xl
            font-semibold
            text-primary-800
          "
        >
          {title}
        </p>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        mb-2
        block
        text-lg
        font-medium
        text-primary-800
      "
    >
      {children}
    </span>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>

      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-[52px]
          w-full
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          px-4
          text-lg
          text-gray-800
          outline-none
          transition
          placeholder:text-gray-400
          hover:border-gray-300
          focus:border-primary-600
          focus:bg-white
          focus:ring-4
          focus:ring-primary-100
        "
      />
    </label>
  );
}
