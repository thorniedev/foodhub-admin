"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Pencil, X } from "lucide-react";

import type {
  Store,
  StoreOperatingStatus,
  UpdateStorePayload,
} from "@/src/types/shop";
import StoreMediaUploader from "./StoreMediaUploader";
import StoreSelect from "./StoreSelect";

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
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!store) {
      setValues(null);
      return;
    }

    setValues({
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
      hygieneRating:
        store.hygieneRating == null ? "" : String(store.hygieneRating),
      operatingStatus: store.operatingStatus ?? "UNKNOWN",
    });

    setLocalError(null);
  }, [store]);

  if (!store || !values) return null;

  const set = (key: keyof FormState, value: string) => {
    setValues((current) => (current ? { ...current, [key]: value } : current));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const latitude = Number(values.latitude);
    const longitude = Number(values.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setLocalError("Latitude ត្រូវនៅចន្លោះ -90 និង 90។");
      return;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setLocalError("Longitude ត្រូវនៅចន្លោះ -180 និង 180។");
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
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="flex items-center gap-3 text-4xl font-bold text-[#136C34]">
              <Pencil size={28} />
              កែប្រែ Store
            </p>
            <p className="mt-1 text-base text-gray-500">{store.storeName}</p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-6">
          <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">ព័ត៌មានហាង</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
                label="Address"
                value={values.addressLine}
                onChange={(value) => set("addressLine", value)}
                required
              />
              <Field
                label="Timezone"
                value={values.timezone}
                onChange={(value) => set("timezone", value)}
                required
              />
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

              <label>
                <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                  Operating status
                </span>
                <StoreSelect
                  value={values.operatingStatus}
                  onChange={(value) => set("operatingStatus", value)}
                  options={[
                    { value: "OPEN", label: "OPEN" },
                    { value: "CLOSED", label: "CLOSED" },
                    {
                      value: "TEMPORARILY_CLOSED",
                      label: "TEMPORARILY_CLOSED",
                    },
                    { value: "UNKNOWN", label: "UNKNOWN" },
                  ]}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                  ការពិពណ៌នា
                </span>
                <textarea
                  rows={4}
                  value={values.description}
                  onChange={(event) => set("description", event.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">Store media</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <StoreMediaUploader
                label="Store logo"
                purpose="STORE_LOGO"
                mediaUuid={values.logoMediaUuid}
                onMediaUuidChange={(uuid) => set("logoMediaUuid", uuid)}
                variant="logo"
              />
              <StoreMediaUploader
                label="Store cover"
                purpose="STORE_COVER"
                mediaUuid={values.coverMediaUuid}
                onMediaUuidChange={(uuid) => set("coverMediaUuid", uuid)}
                variant="cover"
              />
            </div>
          </section>

          {localError && (
            <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-base text-red-600">
              <AlertTriangle size={19} className="shrink-0" />
              {localError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {saving && <Loader2 size={17} className="animate-spin" />}
              រក្សាទុក
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    <label>
      <span className="mb-2 block text-xl font-semibold text-[#F97316]">{label}</span>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
      />
    </label>
  );
}
