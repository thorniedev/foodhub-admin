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
  Loader2,
  ShieldAlert,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import type { Allergen } from "@/src/types/allergen";
import { formatAdminDate } from "@/src/types/safetyResource";

interface AllergenDetailModalProps {
  item: Allergen | null;
  onClose: () => void;
}

interface ApiResponseEnvelope<T> {
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  timestamp?: string;
}

export default function AllergenDetailModal({
  item,
  onClose,
}: AllergenDetailModalProps) {
  const [data, setData] = useState<Allergen | null>(null);
  const [rawResponse, setRawResponse] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const identifier = item?.code || item?.uuid || "";
  const endpointPath = `/api/admin/allergens/${encodeURIComponent(identifier)}`;
  const swaggerApiPath = `/api/v1/admin/allergens/${identifier}`;

  useEffect(() => {
    if (!item) {
      setData(null);
      setRawResponse(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

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

        const json = (await res.json()) as
          | ApiResponseEnvelope<Allergen>
          | Allergen;

        if (!isMounted) return;

        setRawResponse(json);

        let detail: Allergen | null = null;
        if (json && typeof json === "object") {
          if ("payload" in json && json.payload && typeof json.payload === "object") {
            detail = json.payload as Allergen;
          } else if ("data" in json && json.data && typeof json.data === "object") {
            detail = json.data as Allergen;
          } else {
            detail = json as Allergen;
          }
        }

        setData(detail || item);
      } catch (err) {
        if (!isMounted) return;
        console.warn(`[AllergenDetailModal] Could not fetch ${endpointPath}:`, err);
        setIsError(true);
        // Fallback to table item
        setData(item);
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
  }, [item, endpointPath]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!item) {
    return null;
  }

  const displayItem = data || item;
  const isActive = displayItem.active;

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
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
              <ShieldAlert size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
                  {displayItem.name || displayItem.code}
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
        {isLoading && !data ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 py-12">
            <Loader2 size={36} className="animate-spin text-primary-800" />
            <p className="text-lg font-semibold text-gray-500">
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Core Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Code */}
              <div className="relative rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
                    <Tag size={18} />
                    Code / អាឡែស៊ី
                  </span>
                  {displayItem.code && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(displayItem.code, "code")}
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
                  {displayItem.code || "—"}
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

              {/* Name */}
              {displayItem.name && displayItem.name !== displayItem.code && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50 sm:col-span-2">
                  <span className="text-lg font-bold uppercase tracking-wider text-gray-400">
                    ឈ្មោះអាឡែស៊ី (Name)
                  </span>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {displayItem.name}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
              <span className="text-lg font-bold uppercase tracking-wider text-gray-400">
                ការពិពណ៌នា (Description)
              </span>
              <p className="mt-2 text-lg leading-relaxed text-gray-700">
                {displayItem.description || "គ្មានការពិពណ៌នាឡើយ"}
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
