"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Hash,
  Info,
  Layers,
  Loader2,
  Sparkles,
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

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("km-KH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateString;
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
  const [rawResponse, setRawResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const resource = resolveApiResource(group);
  const endpointPath = `/api/catalog/${resource}/${encodeURIComponent(uuid ?? "")}`;
  const swaggerApiPath = `/api/v1/catalog/${resource}/${uuid ?? "{uuid}"}`;

  useEffect(() => {
    if (!uuid) {
      setData(null);
      setRawResponse(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    const fetchDetail = async () => {
      try {
        const res = await fetch(endpointPath, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = (await res.json()) as ApiResponseEnvelope<DetailPayload> | DetailPayload;
        if (!isMounted) return;

        setRawResponse(json);

        let payload: DetailPayload | null = null;
        if (json && typeof json === "object") {
          if ("payload" in json && json.payload && typeof json.payload === "object") {
            payload = json.payload as DetailPayload;
          } else if ("data" in json && json.data && typeof json.data === "object") {
            payload = json.data as DetailPayload;
          } else {
            payload = json as DetailPayload;
          }
        }

        setData(payload);
      } catch (err) {
        if (!isMounted) return;
        console.warn(`[FilterCatalogDetailModal] Could not fetch ${endpointPath}:`, err);
        setIsError(true);
        setErrorMessage(err instanceof Error ? err.message : "Error fetching detail");

        // Fallback to initial local option data if available
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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [uuid, endpointPath, initialOption]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!uuid) {
    return null;
  }

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
      className="fixed inset-0 z-[160] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative my-8 w-full max-w-2xl rounded-[32px] border border-gray-100 bg-white p-6 shadow-2xl sm:p-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Layers size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
                  {displayItem?.localName || displayItem?.name || group.labelKm}
                </h2>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-lg font-bold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {isActive ? "សកម្ម" : "អសកម្ម"}
                </span>
              </div>

      
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && !displayItem ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 py-12">
            <Loader2 size={36} className="animate-spin text-emerald-600" />
            <p className="text-lg font-semibold text-gray-500">
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Warning if network fetch failed but fallback is shown */}
            {isError && (
              <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-5 py-4 text-lg text-amber-800">
                <div className="flex items-center gap-2">
                  <Info size={20} className="shrink-0 text-amber-600" />
                  <span>
                    មិនអាចភ្ជាប់ទៅកាន់ API ផ្ទាល់បានទេ ({errorMessage})។ កំពុងបង្ហាញទិន្នន័យពីអង្គចងចាំ។
                  </span>
                </div>
              </div>
            )}

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Code */}
              <div className="relative rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
                    <Tag size={18} />
                    Code
                  </span>
                  {displayItem?.code && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(displayItem.code ?? "", "code")}
                      className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700 transition"
                      title="Copy Code"
                    >
                      {copiedKey === "code" ? (
                        <Check size={18} className="text-emerald-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-2 font-mono text-xl font-bold text-gray-900">
                  {displayItem?.code || "—"}
                </p>
              </div>

              {/* Status */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
                <span className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
                  <Sparkles size={18} />
                  ស្ថានភាព (Status)
                </span>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {isActive ? "ACTIVE (បើកដំណើរការ)" : "INACTIVE (បិទដំណើរការ)"}
                </p>
              </div>

              {/* Local Name (Khmer) */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
                <span className="text-lg font-bold uppercase tracking-wider text-gray-400">
                  ឈ្មោះជាភាសាខ្មែរ (Local Name)
                </span>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {displayItem?.localName || "—"}
                </p>
              </div>

              {/* English Name */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
                <span className="text-lg font-bold uppercase tracking-wider text-gray-400">
                  ឈ្មោះអន្តរជាតិ (Name)
                </span>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {displayItem?.name || "—"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
              <span className="text-lg font-bold uppercase tracking-wider text-gray-400">
                ការពិពណ៌នា (Description)
              </span>
              <p className="mt-2 text-lg leading-relaxed text-gray-700">
                {displayItem?.description || "គ្មានការពិពណ៌នាឡើយ"}
              </p>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-full bg-gray-900 px-7 text-lg font-bold text-white transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
