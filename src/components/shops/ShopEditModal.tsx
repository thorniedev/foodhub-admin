"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";
import type { Store, StoreOperatingStatus, UpdateStorePayload } from "@/src/types/shop";

type FormState = {
  storeName: string; description: string; addressLine: string; city: string; province: string;
  countryCode: string; timezone: string; latitude: string; longitude: string; phoneNumber: string;
  email: string; logoMediaUuid: string; coverMediaUuid: string; priceLevel: string;
  hygieneRating: string; operatingStatus: StoreOperatingStatus;
};

export default function ShopEditModal({
  store, saving, onClose, onSubmit,
}: {
  store: Store | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: UpdateStorePayload) => Promise<void>;
}) {
  const [v, setV] = useState<FormState | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return setV(null);
    setV({
      storeName: store.storeName ?? "", description: store.description ?? "",
      addressLine: store.addressLine ?? "", city: store.city ?? "", province: store.province ?? "",
      countryCode: store.countryCode ?? "KH", timezone: store.timezone ?? "Asia/Phnom_Penh",
      latitude: String(store.latitude ?? ""), longitude: String(store.longitude ?? ""),
      phoneNumber: store.phoneNumber ?? "", email: store.email ?? "",
      logoMediaUuid: store.logoMediaUuid ?? "", coverMediaUuid: store.coverMediaUuid ?? "",
      priceLevel: store.priceLevel == null ? "" : String(store.priceLevel),
      hygieneRating: store.hygieneRating == null ? "" : String(store.hygieneRating),
      operatingStatus: store.operatingStatus ?? "UNKNOWN",
    });
    setLocalError(null);
  }, [store]);

  if (!store || !v) return null;
  const set = (key: keyof FormState, value: string) => setV((c) => c ? ({...c,[key]:value}) : c);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const latitude = Number(v.latitude), longitude = Number(v.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return setLocalError("Latitude ត្រូវនៅចន្លោះ -90 និង 90។");
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return setLocalError("Longitude ត្រូវនៅចន្លោះ -180 និង 180។");
    setLocalError(null);
    await onSubmit({
      storeName: v.storeName.trim(), description: v.description.trim() || null,
      addressLine: v.addressLine.trim(), city: v.city.trim() || null, province: v.province.trim() || null,
      countryCode: v.countryCode.trim().toUpperCase(), timezone: v.timezone.trim(),
      latitude, longitude, phoneNumber: v.phoneNumber.trim() || null, email: v.email.trim() || null,
      logoMediaUuid: v.logoMediaUuid.trim() || null, coverMediaUuid: v.coverMediaUuid.trim() || null,
      priceLevel: v.priceLevel.trim() ? Number(v.priceLevel) : null,
      hygieneRating: v.hygieneRating.trim() ? Number(v.hygieneRating) : null,
      operatingStatus: v.operatingStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div><h2 className="flex items-center gap-2 text-xl font-black text-gray-900"><Pencil size={20} className="text-[#137A3D]" />កែប្រែ Store</h2>
          <p className="mt-1 text-sm text-gray-500">PUT /api/v1/admin/stores/{store.uuid}</p></div>
          <button disabled={saving} onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500"><X size={19}/></button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store name" value={v.storeName} onChange={(x)=>set("storeName",x)} required />
            <Field label="Country code" value={v.countryCode} onChange={(x)=>set("countryCode",x)} required />
            <Field label="Address" value={v.addressLine} onChange={(x)=>set("addressLine",x)} required />
            <Field label="Timezone" value={v.timezone} onChange={(x)=>set("timezone",x)} required />
            <Field label="City" value={v.city} onChange={(x)=>set("city",x)} />
            <Field label="Province" value={v.province} onChange={(x)=>set("province",x)} />
            <Field label="Latitude" type="number" step="any" value={v.latitude} onChange={(x)=>set("latitude",x)} required />
            <Field label="Longitude" type="number" step="any" value={v.longitude} onChange={(x)=>set("longitude",x)} required />
            <Field label="Phone" value={v.phoneNumber} onChange={(x)=>set("phoneNumber",x)} />
            <Field label="Email" type="email" value={v.email} onChange={(x)=>set("email",x)} />
            <Field label="Logo media UUID" value={v.logoMediaUuid} onChange={(x)=>set("logoMediaUuid",x)} />
            <Field label="Cover media UUID" value={v.coverMediaUuid} onChange={(x)=>set("coverMediaUuid",x)} />
            <Field label="Price level" type="number" value={v.priceLevel} onChange={(x)=>set("priceLevel",x)} />
            <Field label="Hygiene rating" type="number" step="0.1" value={v.hygieneRating} onChange={(x)=>set("hygieneRating",x)} />
            <label><span className="mb-2 block text-sm font-bold text-gray-700">Operating status</span>
              <select value={v.operatingStatus} onChange={(e)=>set("operatingStatus",e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm">
                {["OPEN","CLOSED","TEMPORARILY_CLOSED","UNKNOWN"].map(x=><option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold text-gray-700">Description</span>
              <textarea rows={4} value={v.description} onChange={(e)=>set("description",e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" />
            </label>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
            Commune, district, postal code និង socialLinks មានក្នុង Store detail ប៉ុន្តែ supplied PUT example មិនបញ្ជាក់វាទេ ដូច្នេះមិនផ្ញើ fields ក្លែងក្លាយ។
          </div>
          {localError && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{localError}</div>}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border px-5 py-2.5 font-black">បោះបង់</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-5 py-2.5 font-black text-white disabled:opacity-60">
              {saving && <Loader2 size={17} className="animate-spin"/>}រក្សាទុក
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({label,value,onChange,type="text",required=false,step}:{label:string;value:string;onChange:(v:string)=>void;type?:string;required?:boolean;step?:string}) {
  return <label><span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
    <input type={type} step={step} required={required} value={value} onChange={(e)=>onChange(e.target.value)}
      className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none focus:border-emerald-400"/>
  </label>;
}
