"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Loader2,
  Mail,
  MapPinned,
  Phone,
  Save,
  Sparkles,
  Store,
} from "lucide-react";

import { useCreateShopMutation } from "@/src/app/store/shop/shopApi";

import type {
  CreateStorePayload,
  StoreOperatingStatus,
  StoreSocialLink,
} from "@/src/types/shop";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

import GooglePlacesImportModal, {
  type GooglePlacesImportPayload,
} from "../GooglePlacesImportModal";
import { getSocialLinksError } from "../StoreSocialLinksEditor";
import ShopBasicInfoSection from "./ShopBasicInfoSection";
import ShopHoursSection from "./ShopHoursSection";
import ShopImageUploadGrid from "./ShopImageUploadGrid";
import ShopLocationSection from "./ShopLocationSection";
import ShopSocialSection from "./ShopSocialSection";

/* =========================================================
   ZOD SCHEMA
========================================================= */

const schema = z.object({
  storeName: z
    .string()
    .min(1, "ឈ្មោះហាងត្រូវតែបញ្ចូល")
    .max(200, "ឈ្មោះហាងត្រូវតែខ្លីជាង 200 តួអក្សរ"),

  description: z
    .string()
    .max(2000, "ការពិពណ៌នាត្រូវតែខ្លីជាង 2000 តួអក្សរ")
    .optional(),

  addressLine: z.string().min(1, "អាសយដ្ឋានត្រូវតែបញ្ចូល"),
  commune:     z.string().optional(),
  district:    z.string().optional(),
  city:        z.string().optional(),
  province:    z.string().optional(),

  countryCode: z
    .string()
    .min(2, "កូដប្រទេសត្រូវតែ 2 ឬ 3 តួអក្សរ")
    .max(3, "កូដប្រទេសត្រូវតែ 2 ឬ 3 តួអក្សរ"),

  postalCode: z.string().optional(),

  timezone: z.string().min(1, "តំបន់ម៉ោងត្រូវតែបញ្ចូល"),

  latitude: z
    .string()
    .min(1, "Latitude ត្រូវតែបញ្ចូល")
    .refine(
      (v) => { const n = Number(v); return Number.isFinite(n) && n >= -90 && n <= 90; },
      "Latitude ត្រូវនៅចន្លោះ -90 ដល់ 90",
    ),

  longitude: z
    .string()
    .min(1, "Longitude ត្រូវតែបញ្ចូល")
    .refine(
      (v) => { const n = Number(v); return Number.isFinite(n) && n >= -180 && n <= 180; },
      "Longitude ត្រូវនៅចន្លោះ -180 ដល់ 180",
    ),

  phoneNumber: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\+?[\d\s\-().]{6,20}$/.test(v.trim()),
      "លេខទូរស័ព្ទមិនត្រឹមត្រូវ",
    ),

  email: z
    .string()
    .optional()
    .refine(
      (v) => !v || z.string().email().safeParse(v.trim()).success,
      "អ៊ីមែលមិនត្រឹមត្រូវ",
    ),

  logoMediaUuid:  z.string().optional(),
  coverMediaUuid: z.string().optional(),

  priceLevel: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 1 && Number(v) <= 4 && Number.isInteger(Number(v))),
      "កម្រិតតម្លៃត្រូវនៅចន្លោះ 1 ដល់ 4",
    ),

  hygieneRating: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 0 && Number(v) <= 5),
      "ពិន្ទុអនាម័យត្រូវនៅចន្លោះ 0 ដល់ 5",
    ),

  operatingStatus: z.enum([
    "OPEN",
    "CLOSED",
    "TEMPORARILY_CLOSED",
    "PERMANENTLY_CLOSED",
    "UNKNOWN",
  ]),
});

type FormValues = z.infer<typeof schema>;

/* =========================================================
   INITIAL VALUES
========================================================= */

const initialValues: FormValues = {
  storeName:      "",
  description:    "",
  addressLine:    "",
  commune:        "",
  district:       "",
  city:           "Phnom Penh",
  province:       "Phnom Penh",
  countryCode:    "KH",
  postalCode:     "",
  timezone:       "Asia/Phnom_Penh",
  latitude:       "11.5484",
  longitude:      "104.9307",
  phoneNumber:    "",
  email:          "",
  logoMediaUuid:  "",
  coverMediaUuid: "",
  priceLevel:     "2",
  hygieneRating:  "",
  operatingStatus:"OPEN",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CreateShopForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onTouched", // show error after field is blurred
  });

  const [socialLinks, setSocialLinks] = useState<StoreSocialLink[]>([]);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationFailed, setValidationFailed] = useState(false);

  const [createShop, { isLoading }] = useCreateShopMutation();

  /* Watch fields to pass as controlled values to child sections */
  const watchedBasic = useWatch({
    control,
    name: [
      "storeName", "description", "countryCode",
      "timezone", "priceLevel", "hygieneRating", "operatingStatus",
    ],
  });

  const watchedLocation = useWatch({
    control,
    name: [
      "addressLine", "commune", "district",
      "city", "province", "postalCode", "latitude", "longitude",
    ],
  });

  /* =======================================================
     SAMPLE DATA
  ======================================================= */

  const fillSampleData = () => {
    const runId = Math.floor(1000 + Math.random() * 9000);
    reset({
      storeName:      `Sovann Kitchen ${runId}`,
      description:    "Postman automated store",
      addressLine:    "No. 25, Street 360, Phnom Penh",
      commune:        "Boeng Keng Kang",
      district:       "Chamkar Mon",
      city:           "Phnom Penh",
      province:       "Phnom Penh",
      countryCode:    "KH",
      postalCode:     "120102",
      timezone:       "Asia/Phnom_Penh",
      latitude:       "11.5484",
      longitude:      "104.9307",
      phoneNumber:    "+85512345678",
      email:          `store.${runId}@example.test`,
      logoMediaUuid:  "",
      coverMediaUuid: "",
      priceLevel:     "2",
      hygieneRating:  "4.5",
      operatingStatus:"OPEN",
    });
    setSocialLinks([{
      platform: "FACEBOOK",
      profileUrl: "https://www.facebook.com/sovannkhmerkitchen/",
      displayOrder: 1,
    }]);
    setValidationFailed(false);
    setError(null);
  };

  /* =======================================================
     IMPORT FROM GOOGLE MAPS
  ======================================================= */

  const handleImportFromGoogle = (payload: GooglePlacesImportPayload) => {
    const current = getValues();
    const next: Partial<FormValues> = {};

    if (!current.storeName.trim() && payload.displayName && payload.displayName !== "Google Place") {
      next.storeName = payload.displayName;
    }

    /*
     * Build an addressLine fallback from whatever address data is available
     * so the required field is never left empty after an import.
     */
    if (!current.addressLine.trim()) {
      const addr = payload.address;
      const resolved =
        addr.formattedAddress ??
        ([addr.district, addr.city ?? addr.province, "Cambodia"]
          .filter(Boolean)
          .join(", ") || null);


      if (resolved) next.addressLine = resolved;
    }

    if (!current.commune?.trim()  && payload.address.commune)  next.commune  = payload.address.commune;
    if (!current.district?.trim() && payload.address.district) next.district = payload.address.district;
    if (!current.city?.trim()     && payload.address.city)     next.city     = payload.address.city;
    if (!current.province?.trim() && payload.address.province) next.province = payload.address.province;
    if (!current.postalCode?.trim()&& payload.address.postalCode) next.postalCode = payload.address.postalCode;

    if (payload.latitude  !== null) next.latitude  = String(payload.latitude);
    if (payload.longitude !== null) next.longitude = String(payload.longitude);

    if (
      (!current.timezone.trim() || current.timezone === "Asia/Phnom_Penh") &&
      payload.timezone
    ) {
      next.timezone = payload.timezone;
    }

    if (Object.keys(next).length > 0) {
      reset({ ...current, ...next }, { keepDirty: true, keepDirtyValues: true });
    }

    if (payload.logoMediaUuid)  setValue("logoMediaUuid",  payload.logoMediaUuid,  { shouldDirty: true });
    if (payload.coverMediaUuid) setValue("coverMediaUuid", payload.coverMediaUuid, { shouldDirty: true });

    setValidationFailed(false);
    setError(null);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submit = handleSubmit(
    async (values) => {
      setValidationFailed(false);
      setError(null);

      try {
        const cleanedSocialLinks = socialLinks
          .map((link, i) => ({
            platform:     link.platform.trim(),
            profileUrl:   link.profileUrl.trim(),
            displayOrder: Number(link.displayOrder) || i + 1,
          }))
          .filter((l) => l.platform && l.profileUrl);

        if (cleanedSocialLinks.length > 0) {
          const socialLinksError = getSocialLinksError(cleanedSocialLinks);
          if (socialLinksError) { setError(socialLinksError); return; }
        }

        const body: CreateStorePayload = {
          storeName:      values.storeName.trim(),
          description:    values.description?.trim() || null,
          addressLine:    values.addressLine.trim(),
          commune:        values.commune?.trim()     || null,
          district:       values.district?.trim()    || null,
          city:           values.city?.trim()        || null,
          province:       values.province?.trim()    || null,
          countryCode:    values.countryCode.trim().toUpperCase(),
          postalCode:     values.postalCode?.trim()  || null,
          timezone:       values.timezone.trim(),
          latitude:       Number(values.latitude),
          longitude:      Number(values.longitude),
          phoneNumber:    values.phoneNumber?.trim() || null,
          email:          values.email?.trim()       || null,
          logoMediaUuid:  values.logoMediaUuid?.trim()  || null,
          coverMediaUuid: values.coverMediaUuid?.trim() || null,
          priceLevel:     values.priceLevel?.trim() ? Number(values.priceLevel) : null,
          hygieneRating:  values.hygieneRating?.trim() ? Number(values.hygieneRating) : null,
          operatingStatus:values.operatingStatus as StoreOperatingStatus,
          ...(cleanedSocialLinks.length > 0 ? { socialLinks: cleanedSocialLinks } : {}),
        };

        const store = await createShop(body).unwrap();
        router.push(store?.uuid ? `/shops/${store.uuid}` : "/shops");
        router.refresh();
      } catch (requestError) {
        console.error("[CreateShopForm] API error:", requestError);
        setError(getShopApiErrorMessage(requestError));
      }
    },
    /* onInvalid — fires when Zod validation fails */
    (fieldErrors) => {
      console.warn("[CreateShopForm] Validation errors:", fieldErrors);
      setValidationFailed(true);
    },
  );

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <Link
              href="/shops"
              className="
                inline-flex min-h-11 items-center justify-center gap-2
                rounded-full bg-white/15 px-4 text-lg font-medium text-white
                transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20
              "
            >
              <ArrowLeft size={20} />
              ត្រឡប់ទៅបញ្ជីហាង
            </Link>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Store size={25} />
              </div>
              <div className="min-w-0">
                <p className="text-5xl font-bold text-accent-400">បង្កើតហាងថ្មី</p>
                <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                  បំពេញព័ត៌មានហាងដោយដៃ ឬប្រើ Google Maps ដើម្បីនាំចូលព័ត៌មានហាងដោយស្វ័យប្រវត្តិ។
                </p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center xl:justify-end">
            <button
              type="button"
              onClick={fillSampleData}
              className="
                inline-flex min-h-12 w-full shrink-0 whitespace-nowrap items-center justify-center
                gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2.5
                text-lg font-medium text-white backdrop-blur-sm transition
                hover:bg-white/25 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-auto
              "
            >
              <Sparkles size={18} />
              បំពេញទិន្នន័យគំរូ
            </button>

            <button
              type="button"
              onClick={() => setGoogleOpen(true)}
              className="
                inline-flex min-h-12 w-full shrink-0 whitespace-nowrap items-center justify-center
                gap-2 rounded-full bg-white px-5 py-2.5
                text-lg font-bold text-primary-800 shadow-sm transition
                hover:bg-primary-50 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-auto
              "
            >
              <MapPinned size={20} className="text-primary-700 shrink-0" />
              ទាញយកទិន្នន័យពី Google Maps
            </button>
          </div>
        </div>
      </section>

      {/* =================================================
          CREATE FORM
      ================================================== */}

      <form onSubmit={submit} noValidate className="space-y-6">

        {/* BASIC INFO */}
        <ShopBasicInfoSection
          values={{
            storeName:       watchedBasic?.[0] ?? "",
            description:     watchedBasic?.[1] ?? "",
            countryCode:     watchedBasic?.[2] ?? "",
            timezone:        watchedBasic?.[3] ?? "",
            priceLevel:      watchedBasic?.[4] ?? "",
            hygieneRating:   watchedBasic?.[5] ?? "",
            operatingStatus: (watchedBasic?.[6] as StoreOperatingStatus) ?? "OPEN",
          }}
          onChange={(key, val) => {
            setValue(key as keyof FormValues, val, { shouldValidate: true });
          }}
          errors={{
            storeName:       errors.storeName,
            description:     errors.description,
            countryCode:     errors.countryCode,
            timezone:        errors.timezone,
            priceLevel:      errors.priceLevel,
            hygieneRating:   errors.hygieneRating,
            operatingStatus: errors.operatingStatus,
          }}
        />

        {/* LOCATION */}
        <ShopLocationSection
          values={{
            addressLine: watchedLocation?.[0] ?? "",
            commune:     watchedLocation?.[1] ?? "",
            district:    watchedLocation?.[2] ?? "",
            city:        watchedLocation?.[3] ?? "",
            province:    watchedLocation?.[4] ?? "",
            postalCode:  watchedLocation?.[5] ?? "",
            latitude:    watchedLocation?.[6] ?? "",
            longitude:   watchedLocation?.[7] ?? "",
          }}
          onChange={(key, val) => {
            setValue(key as keyof FormValues, val, { shouldValidate: true });
          }}
          errors={{
            addressLine: errors.addressLine,
            commune:     errors.commune,
            district:    errors.district,
            city:        errors.city,
            province:    errors.province,
            postalCode:  errors.postalCode,
            latitude:    errors.latitude,
            longitude:   errors.longitude,
          }}
        />

        {/* CONTACT */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Phone size={22} />
            </div>
            <p className="text-2xl font-bold text-[#0F5A2C]">ទំនាក់ទំនង</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Phone */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-lg font-medium text-primary-800">
                <Phone size={19} className="text-primary-700" />
                លេខទូរស័ព្ទ
              </span>
              <input
                {...register("phoneNumber")}
                type="tel"
                placeholder="ឧ. +855 12 345 678"
                className={`
                  h-[52px] w-full rounded-xl border bg-gray-50 px-4
                  text-lg text-gray-800 outline-none transition
                  placeholder:text-gray-400 hover:border-gray-300
                  focus:bg-white focus:ring-4
                  ${errors.phoneNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"}
                `}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-lg text-red-600">{errors.phoneNumber.message}</p>
              )}
            </label>

            {/* Email */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-lg font-medium text-primary-800">
                <Mail size={19} className="text-primary-700" />
                អ៊ីមែល
              </span>
              <input
                {...register("email")}
                type="email"
                placeholder="example@foodhub.com"
                className={`
                  h-[52px] w-full rounded-xl border bg-gray-50 px-4
                  text-lg text-gray-800 outline-none transition
                  placeholder:text-gray-400 hover:border-gray-300
                  focus:bg-white focus:ring-4
                  ${errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"}
                `}
              />
              {errors.email && (
                <p className="mt-1 text-lg text-red-600">{errors.email.message}</p>
              )}
            </label>
          </div>
        </section>

        {/* IMAGE */}
        <Controller
          name="logoMediaUuid"
          control={control}
          render={({ field: { value: logo } }) => (
            <Controller
              name="coverMediaUuid"
              control={control}
              render={({ field: { value: cover } }) => (
                <ShopImageUploadGrid
                  logoMediaUuid={logo ?? ""}
                  coverMediaUuid={cover ?? ""}
                  onChange={(key, val) => setValue(key as "logoMediaUuid" | "coverMediaUuid", val)}
                />
              )}
            />
          )}
        />

        {/* SOCIAL LINKS */}
        <ShopSocialSection links={socialLinks} onChange={setSocialLinks} />

        {/* HOURS */}
        <ShopHoursSection />

        {/* VALIDATION BANNER — visible when Zod rejects the submit */}
        {validationFailed && !error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-lg leading-7 text-amber-800">
            ⚠️ សូមបំពេញព័ត៌មានដែលចាំបាច់ (ចំណាំ: ឈ្មោះហាង, អាសយដ្ឋាន, Latitude, Longitude) មុននឹងបង្កើតហាង។
          </div>
        )}

        {/* API ERROR BANNER */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            FIXED FOOTER ACTIONS
        ================================================== */}

        <div
          className="
            fixed bottom-4 left-4 right-4 z-[80]
            flex flex-col-reverse gap-3
            rounded-2xl border border-gray-100 bg-white/95 p-3
            shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl

            sm:left-auto sm:right-6
            sm:flex-row sm:items-center sm:justify-end
            sm:rounded-full sm:p-2
          "
        >
          <Link
            href="/shops"
            className="
              inline-flex min-h-[52px] w-full items-center justify-center
              rounded-full border border-gray-200 bg-white px-7
              text-lg font-medium text-gray-600 transition
              hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800
              focus:outline-none focus:ring-4 focus:ring-primary-100 sm:w-auto
            "
          >
            បោះបង់
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="
              inline-flex min-h-[52px] w-full items-center justify-center gap-2
              rounded-full bg-primary-800 px-7
              text-lg font-semibold text-white shadow-sm transition
              hover:bg-primary-900
              focus:outline-none focus:ring-4 focus:ring-primary-200
              disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto
            "
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isLoading ? "កំពុងបង្កើត..." : "បង្កើតហាង"}
          </button>
        </div>
      </form>

      {/* GOOGLE PLACES MODAL — direct create path (createStoreFromGoogle) */}
      <GooglePlacesImportModal
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
      />
    </div>
  );
}
