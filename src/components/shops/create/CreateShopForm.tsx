"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPinned, Save, Store } from "lucide-react";

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

export default function CreateShopForm() {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [socialLinks, setSocialLinks] = useState<StoreSocialLink[]>([]);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createShop, { isLoading }] = useCreateShopMutation();

  const set = (key: keyof FormState, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

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

    const cleanedSocialLinks = socialLinks
      .map((link, index) => ({
        platform: link.platform.trim(),
        profileUrl: link.profileUrl.trim(),
        displayOrder: Number(link.displayOrder) || index + 1,
      }))
      .filter((link) => link.platform && link.profileUrl);

    const socialLinksError = getSocialLinksError(cleanedSocialLinks);
    if (socialLinksError) {
      setError(socialLinksError);
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
      socialLinks: cleanedSocialLinks,
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
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/shops"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-lg transition hover:bg-white/15"
            >
              <ArrowLeft size={18} />
              ត្រឡប់ទៅហាង
            </Link>

            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Store size={25} />
              </div>
              <div>
                <p className="text-5xl font-bold">បង្កើត Store ថ្មី</p>
                <p className="mt-2 max-w-2xl text-xl leading-7 text-white/85">
                  បំពេញព័ត៌មានហាងដោយដៃ ឬប្រើ Google Places ដើម្បីនាំចូលព័ត៌មានហាង។
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGoogleOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
          >
            <MapPinned size={20} />
            Import from Google
          </button>
        </div>
      </section>

      <form onSubmit={submit} className="space-y-5">
        <ShopBasicInfoSection values={values} onChange={set} />
        <ShopLocationSection values={values} onChange={set} />

        <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-4xl font-bold text-gray-900">Contact</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xl font-semibold text-[#F97316]">Phone</span>
              <input
                value={values.phoneNumber}
                onChange={(event) => set("phoneNumber", event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </label>

            <label>
              <span className="mb-2 block text-xl font-semibold text-[#F97316]">Email</span>
              <input
                type="email"
                value={values.email}
                onChange={(event) => set("email", event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </label>
          </div>
        </section>

        <ShopImageUploadGrid
          logoMediaUuid={values.logoMediaUuid}
          coverMediaUuid={values.coverMediaUuid}
          onChange={set}
        />

        <ShopSocialSection links={socialLinks} onChange={setSocialLinks} />
        <ShopHoursSection />

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-base text-red-600">
            {error}
          </div>
        )}

        <div className="sticky bottom-4 z-40 flex justify-end gap-3 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur">
          <Link
            href="/shops"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50"
          >
            បោះបង់
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isLoading ? "កំពុងបង្កើត..." : "បង្កើត Store"}
          </button>
        </div>
      </form>

      <GooglePlacesImportModal open={googleOpen} onClose={() => setGoogleOpen(false)} />
    </div>
  );
}
