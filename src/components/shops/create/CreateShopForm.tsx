"use client";

import { type FormEvent, useState } from "react";

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

import GooglePlacesImportModal from "../GooglePlacesImportModal";
import { getSocialLinksError } from "../StoreSocialLinksEditor";
import ShopBasicInfoSection from "./ShopBasicInfoSection";
import ShopHoursSection from "./ShopHoursSection";
import ShopImageUploadGrid from "./ShopImageUploadGrid";
import ShopLocationSection from "./ShopLocationSection";
import ShopSocialSection from "./ShopSocialSection";

/* =========================================================
   TYPES
========================================================= */

type FormState = {
  storeName: string;
  description: string;
  addressLine: string;
  commune: string;
  district: string;
  city: string;
  province: string;
  countryCode: string;
  postalCode: string;
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

/* =========================================================
   INITIAL STATE
========================================================= */

const initial: FormState = {
  storeName: "",
  description: "",
  addressLine: "",
  commune: "",
  district: "",
  city: "Phnom Penh",
  province: "Phnom Penh",
  countryCode: "KH",
  postalCode: "",
  timezone: "Asia/Phnom_Penh",
  latitude: "11.5484",
  longitude: "104.9307",
  phoneNumber: "",
  email: "",
  logoMediaUuid: "",
  coverMediaUuid: "",
  priceLevel: "2",
  hygieneRating: "",
  operatingStatus: "OPEN",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CreateShopForm() {
  const router = useRouter();

  const [values, setValues] = useState(initial);

  const [socialLinks, setSocialLinks] = useState<StoreSocialLink[]>([]);

  const [googleOpen, setGoogleOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [createShop, { isLoading }] = useCreateShopMutation();

  /* =======================================================
     FIELD SETTER
  ======================================================= */

  const set = (key: keyof FormState, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =======================================================
     SAMPLE DATA
  ======================================================= */

  const fillSampleData = () => {
    const runId = Math.floor(1000 + Math.random() * 9000);

    setValues({
      storeName: `Sovann Kitchen ${runId}`,
      description: "Postman automated store",
      addressLine: "No. 25, Street 360, Phnom Penh",
      commune: "Boeng Keng Kang",
      district: "Chamkar Mon",
      city: "Phnom Penh",
      province: "Phnom Penh",
      countryCode: "KH",
      postalCode: "120102",
      timezone: "Asia/Phnom_Penh",
      latitude: "11.5484",
      longitude: "104.9307",
      phoneNumber: "+85512345678",
      email: `store.${runId}@example.test`,
      logoMediaUuid: "",
      coverMediaUuid: "",
      priceLevel: "2",
      hygieneRating: "4.5",
      operatingStatus: "OPEN",
    });

    setSocialLinks([
      {
        platform: "FACEBOOK",
        profileUrl: "https://www.facebook.com/sovannkhmerkitchen/",
        displayOrder: 1,
      },
    ]);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const latitude = Number(values.latitude);

    const longitude = Number(values.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setError("Latitude ត្រូវនៅចន្លោះ -90 និង 90។");

      return;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError("Longitude ត្រូវនៅចន្លោះ -180 និង 180។");

      return;
    }

    const body: CreateStorePayload = {
      storeName: values.storeName.trim(),

      description: values.description.trim() || null,

      addressLine: values.addressLine.trim(),

      commune: values.commune.trim() || null,

      district: values.district.trim() || null,

      city: values.city.trim() || null,

      province: values.province.trim() || null,

      countryCode: values.countryCode.trim().toUpperCase(),

      postalCode: values.postalCode.trim() || null,

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

      socialLinks: socialLinks
        .map((link, index) => ({
          platform: link.platform.trim(),

          profileUrl: link.profileUrl.trim(),

          displayOrder: Number(link.displayOrder) || index + 1,
        }))
        .filter((link) => link.platform && link.profileUrl),
    };

    try {
      const store = await createShop(body).unwrap();

      router.push(store?.uuid ? `/shops/${store.uuid}` : "/shops");

      router.refresh();
    } catch (requestError) {
      setError(getShopApiErrorMessage(requestError));
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        {/* Decoration */}

        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />

        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          {/* Left */}

          <div className="min-w-0 flex-1">
            <Link
              href="/shops"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-full
                bg-white/15
                px-4
                text-lg
                font-medium
                text-white
                transition
                hover:bg-white/20
                focus:outline-none
                focus:ring-4
                focus:ring-white/20
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
                <p className="text-5xl font-bold text-accent-400">
                  បង្កើតហាងថ្មី
                </p>

                <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                  បំពេញព័ត៌មានហាងដោយដៃ ឬប្រើ Google Maps
                  ដើម្បីនាំចូលព័ត៌មានហាងដោយស្វ័យប្រវត្តិ។
                </p>
              </div>
            </div>
          </div>

          {/* Header Actions */}

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center xl:justify-end">
            {/* Sample Data Button */}
            <button
              type="button"
              onClick={fillSampleData}
              className="
                inline-flex
                min-h-12
                w-full
                shrink-0
                whitespace-nowrap
                items-center
                justify-center
                rounded-full
                border
                border-white/25
                bg-white/15
                px-5
                py-2.5
                text-base
                font-medium
                text-white
                backdrop-blur-sm
                transition
                hover:bg-white/25
                active:scale-95
                focus:outline-none
                focus:ring-4
                focus:ring-white/20
                sm:w-auto
              "
            >
              បំពេញទិន្នន័យគំរូ
            </button>

            {/* Google Maps Import Button */}
            <button
              type="button"
              onClick={() => setGoogleOpen(true)}
              className="
                inline-flex
                min-h-12
                w-full
                shrink-0
                whitespace-nowrap
                items-center
                justify-center
                gap-2
                rounded-full
                bg-white
                px-5
                py-2.5
                text-base
                font-bold
                text-primary-800
                shadow-sm
                transition
                hover:bg-primary-50
                active:scale-95
                focus:outline-none
                focus:ring-4
                focus:ring-white/20
                sm:w-auto
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

      <form onSubmit={submit} className="space-y-6">
        {/* =================================================
            BASIC INFORMATION
        ================================================== */}

        <ShopBasicInfoSection values={values} onChange={set} />

        {/* =================================================
            LOCATION
        ================================================== */}

        <ShopLocationSection values={values} onChange={set} />

        {/* =================================================
            CONTACT
        ================================================== */}

        <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          {/* Section Header */}

          <div className="mb-6 flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              <Phone size={22} />
            </div>

            <p className="text-3xl font-semibold text-primary-800">ទំនាក់ទំនង</p>
          </div>

          {/* Fields */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Phone */}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-lg font-medium text-primary-800">
                <Phone size={19} className="text-primary-700" />
                លេខទូរស័ព្ទ
              </span>

              <input
                value={values.phoneNumber}
                onChange={(event) => set("phoneNumber", event.target.value)}
                placeholder="ឧ. +855 12 345 678"
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

            {/* Email */}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-lg font-medium text-primary-800">
                <Mail size={19} className="text-primary-700" />
                អ៊ីមែល
              </span>

              <input
                type="email"
                value={values.email}
                onChange={(event) => set("email", event.target.value)}
                placeholder="example@foodhub.com"
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
          </div>
        </section>

        {/* =================================================
            IMAGE
        ================================================== */}

        <ShopImageUploadGrid
          logoMediaUuid={values.logoMediaUuid}
          coverMediaUuid={values.coverMediaUuid}
          onChange={set}
        />

        {/* =================================================
            SOCIAL LINKS
        ================================================== */}

        <ShopSocialSection links={socialLinks} onChange={setSocialLinks} />

        {/* =================================================
            HOURS
        ================================================== */}

        <ShopHoursSection />

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              px-5
              py-4
              text-lg
              leading-7
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================== */}

        {/* =================================================
    FIXED FORM ACTIONS
================================================== */}

        <div
          className="
    fixed
    bottom-4
    left-4
    right-4
    z-[80]
    flex
    flex-col-reverse
    gap-3
    rounded-2xl
    border
    border-gray-100
    bg-white/95
    p-3
    shadow-[0_12px_40px_rgba(0,0,0,0.12)]
    backdrop-blur-xl

    sm:left-auto
    sm:right-6
    sm:flex-row
    sm:items-center
    sm:justify-end
    sm:rounded-full
    sm:p-2
  "
        >
          {/* CANCEL */}

          <Link
            href="/shops"
            className="
      inline-flex
      min-h-[52px]
      w-full
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
      sm:w-auto
    "
          >
            បោះបង់
          </Link>

          {/* CREATE STORE */}

          <button
            type="submit"
            disabled={isLoading}
            className="
      inline-flex
      min-h-[52px]
      w-full
      items-center
      justify-center
      gap-2
      rounded-full
      bg-primary-800
      px-7
      text-lg
      font-semibold
      text-white
      shadow-sm
      transition
      hover:bg-primary-900
      focus:outline-none
      focus:ring-4
      focus:ring-primary-200
      disabled:cursor-not-allowed
      disabled:opacity-60
      sm:w-auto
    "
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}

            {isLoading ? "កំពុងបង្កើត..." : "បង្កើតហាង"}
          </button>
        </div>
      </form>

      {/* =================================================
          GOOGLE PLACES MODAL
      ================================================== */}

      <GooglePlacesImportModal
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
      />
    </div>
  );
}
