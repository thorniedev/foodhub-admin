"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Globe2,
  Info,
  Languages,
  Layers,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import type { getFilterGroupBySlug } from "@/src/config/filterCatalog";
import type { FilterCatalogOption } from "@/src/types/filterCatalog";

type FilterGroup = NonNullable<ReturnType<typeof getFilterGroupBySlug>>;

interface DetailPayload {
  uuid?: string;
  code?: string;
  name?: string;
  localName?: string | null;
  description?: string | null;
  isActive?: boolean;
  active?: boolean;
  numericValue?: number | null;
  unit?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

interface ApiResponseEnvelope<T> {
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  timestamp?: string;
}

function resolveApiResource(group: FilterGroup): string {
  switch (group.source) {
    case "SEASON_API":
      return "seasons";
    case "EVENT_API":
      return "events";
    case "CUISINE_API":
      return "cuisines";
    case "FOOD_CATEGORY_API":
      return "food-categories";
    case "MEAL_TYPE_API":
      return "meal-types";
    case "WEATHER_CONDITION_API":
      return "weather-conditions";
    default:
      return group.slug;
  }
}

export default function FilterCatalogDetailModal({
  uuid,
  group,
  initialOption,
  onClose,
}: {
  uuid: string | null;
  group: FilterGroup;
  initialOption?: FilterCatalogOption | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<DetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const resource = resolveApiResource(group);
  const endpointPath = `/api/catalog/${resource}/${encodeURIComponent(uuid ?? "")}`;

  useEffect(() => {
    if (!uuid) { setData(null); return; }
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    (async () => {
      try {
        const res = await fetch(endpointPath, { headers: { Accept: "application/json" }, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json = (await res.json()) as ApiResponseEnvelope<DetailPayload> | DetailPayload;
        if (!isMounted) return;
        let payload: DetailPayload | null = null;
        if (json && typeof json === "object") {
          if ("payload" in json && json.payload) payload = json.payload as DetailPayload;
          else if ("data" in json && json.data) payload = json.data as DetailPayload;
          else payload = json as DetailPayload;
        }
        setData(payload);
      } catch (err) {
        if (!isMounted) return;
        console.warn(`[FilterCatalogDetailModal]`, err);
        setIsError(true);
        setErrorMessage(err instanceof Error ? err.message : "Error fetching detail");
        if (initialOption) {
          setData({
            uuid: initialOption.uuid,
            code: initialOption.code,
            name: initialOption.name,
            localName: initialOption.localName,
            description: initialOption.description,
            isActive: initialOption.active,
            active: initialOption.active,
            numericValue: initialOption.numericValue,
            unit: initialOption.unit,
            createdAt: initialOption.createdAt,
            updatedAt: initialOption.updatedAt,
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [uuid, endpointPath, initialOption]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!uuid) return null;

  const displayItem = data || (initialOption ? {
    uuid: initialOption.uuid,
    code: initialOption.code,
    name: initialOption.name,
    localName: initialOption.localName,
    description: initialOption.description,
    isActive: initialOption.active,
    active: initialOption.active,
    numericValue: initialOption.numericValue,
    unit: initialOption.unit,
    createdAt: initialOption.createdAt,
    updatedAt: initialOption.updatedAt,
  } : null);

  const isActive = displayItem?.isActive ?? displayItem?.active ?? true;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in zoom-in-95 duration-200">

        {/* ─── HEADER ─── */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Layers size={24} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-3xl font-semibold text-primary-800">
                {displayItem?.localName || displayItem?.name || `ព័ត៌មានលម្អិត ${group.labelKm}`}
              </p>
              <p className="mt-1 text-lg text-gray-500">{group.labelKm} ({group.labelEn})</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* ─── BODY ─── */}
        <div className="space-y-6 p-6 sm:p-8">
          {isLoading && !displayItem ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-primary-700" />
              <p className="text-lg font-medium text-gray-500">កំពុងទាញយកព័ត៌មានលម្អិត...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Warning if network fetch failed */}
              {isError && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-lg text-amber-800">
                  <Info size={20} className="shrink-0 text-amber-600" />
                  <span>
                    មិនអាចភ្ជាប់ API ផ្ទាល់បានទេ ({errorMessage})។ កំពុងបង្ហាញទិន្នន័យដែលរក្សាទុក។
                  </span>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Local Name */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                      <Languages size={18} />
                      ឈ្មោះសម្រាប់បង្ហាញ
                    </span>
                    <p className="mt-2 text-xl font-bold text-gray-800">
                      {displayItem?.localName || <span className="text-gray-400 font-normal">—</span>}
                    </p>
                  </div>

                  {/* English Name */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                      <Globe2 size={18} />
                      English name
                    </span>
                    <p className="mt-2 text-xl font-bold text-gray-800">
                      {displayItem?.name || <span className="text-gray-400 font-normal">—</span>}
                    </p>
                  </div>

                  {/* Code */}
                  {displayItem?.code && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                          <Tag size={18} />
                          កូដ (Code)
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(displayItem.code ?? "", "code")}
                          className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-primary-700"
                          title="Copy"
                        >
                          {copiedKey === "code" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="mt-2 font-mono text-xl font-bold text-gray-800">{displayItem.code}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <span className="block text-lg font-medium text-primary-800">ស្ថានភាព</span>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-lg font-medium ${isActive
                        ? "bg-primary-50 text-primary-700"
                        : "bg-gray-200 text-gray-600"
                        }`}>
                        <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary-600" : "bg-gray-400"}`} />
                        {isActive ? "សកម្ម (Active)" : "អសកម្ម (Inactive)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                    <FileText size={18} />
                    ការពិពណ៌នា
                  </span>
                  <p className="mt-2 text-lg leading-8 text-gray-700">
                    {displayItem?.description || <span className="italic text-gray-400">គ្មានការពិពណ៌នាឡើយ</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── FOOTER ─── */}
          <div className="flex justify-end border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary-800 px-8 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              បិទ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
