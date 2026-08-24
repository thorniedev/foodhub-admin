"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Globe2,
  Leaf,
  Loader2,
  Tag,
  X,
} from "lucide-react";

import type { Ingredient } from "@/src/types/ingredient";

interface IngredientDetailModalProps {
  item: Ingredient | null;
  onClose: () => void;
}

interface ApiResponseEnvelope<T> {
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  timestamp?: string;
}

export default function IngredientDetailModal({
  item,
  onClose,
}: IngredientDetailModalProps) {
  const [data, setData] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const uuid = item?.uuid || "";
  const endpointPath = `/api/admin/catalog/ingredients/${encodeURIComponent(uuid)}`;

  useEffect(() => {
    if (!item) { setData(null); return; }
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    (async () => {
      try {
        const res = await fetch(endpointPath, { headers: { Accept: "application/json" }, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ApiResponseEnvelope<Ingredient> | Ingredient;
        if (!isMounted) return;
        let detail: Ingredient | null = null;
        if (json && typeof json === "object") {
          if ("payload" in json && json.payload) detail = json.payload as Ingredient;
          else if ("data" in json && json.data) detail = json.data as Ingredient;
          else detail = json as Ingredient;
        }
        setData(detail || item);
      } catch (err) {
        if (!isMounted) return;
        console.warn(`[IngredientDetailModal]`, err);
        setIsError(true);
        setData(item);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [item, endpointPath]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!item) return null;

  const displayItem = data || item;
  const isActive = displayItem.isActive;

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
              <Leaf size={24} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-3xl font-semibold text-primary-800">
                {displayItem.name || "ព័ត៌មានគ្រឿងផ្សំ"}
              </p>
              <p className="mt-1 text-lg text-gray-500">គ្រឿងផ្សំ (Ingredients)</p>
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
          {isLoading && !data ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-primary-700" />
              <p className="text-lg font-medium text-gray-500">កំពុងទាញយកព័ត៌មានលម្អិត...</p>
            </div>
          ) : isError && !data ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-lg font-medium text-red-600">
              មិនអាចទាញយកព័ត៌មានលម្អិតគ្រឿងផ្សំបានទេ។
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Code */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                      <Tag size={18} />
                      កូដ (Code)
                    </span>
                    {displayItem.code && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(displayItem.code, "code")}
                        className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-primary-700"
                        title="Copy"
                      >
                        {copiedKey === "code" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 font-mono text-xl font-bold text-gray-800">{displayItem.code || "—"}</p>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-lg font-medium text-primary-800">ស្ថានភាព</span>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-lg font-medium ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary-600" : "bg-gray-400"}`} />
                      {isActive ? "សកម្ម (Active)" : "អសកម្ម (Inactive)"}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
                  <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                    <Globe2 size={18} />
                    ឈ្មោះគ្រឿងផ្សំ
                  </span>
                  <p className="mt-2 text-xl font-bold text-gray-800">
                    {displayItem.name || <span className="text-gray-400 font-normal">—</span>}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                  <FileText size={18} />
                  ការពិពណ៌នា
                </span>
                <p className="mt-2 text-lg leading-8 text-gray-700">
                  {displayItem.description || <span className="italic text-gray-400">គ្មានការពិពណ៌នាឡើយ</span>}
                </p>
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
