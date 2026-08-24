"use client";

import {
  Check,
  Copy,
  FileText,
  Loader2,
  Tag,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

import type { AgeGroup } from "@/src/types/ageGroup";

export default function AgeGroupDetailModal({
  item,
  onClose,
}: {
  item: AgeGroup | null;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!item) return null;

  const isActive = item.isActive;

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
              <UsersRound size={24} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-3xl font-semibold text-primary-800">
                {item.name || "ព័ត៌មានក្រុមអាយុ"}
              </p>
              <p className="mt-1 text-lg text-gray-500">ក្រុមអាយុ (Age Groups)</p>
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
          <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Code */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                    <Tag size={18} />
                    កូដ (Code)
                  </span>
                  {item.code && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.code, "code")}
                      className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-primary-700"
                      title="Copy"
                    >
                      {copiedKey === "code" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
                <p className="mt-2 font-mono text-xl font-bold text-gray-800">{item.code || "—"}</p>
              </div>

              {/* Name */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                  <UsersRound size={18} />
                  ឈ្មោះ
                </span>
                <p className="mt-2 text-xl font-bold text-gray-800">
                  {item.name || <span className="text-gray-400 font-normal">—</span>}
                </p>
              </div>

              {/* Age Range */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="block text-lg font-medium text-primary-800">ចន្លោះអាយុ</span>
                <p className="mt-2 text-xl font-bold text-gray-800">
                  {item.minAge} – {item.maxAge} <span className="text-lg font-normal text-gray-500">ឆ្នាំ</span>
                </p>
              </div>

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
                {item.description || <span className="italic text-gray-400">គ្មានការពិពណ៌នាឡើយ</span>}
              </p>
            </div>
          </div>

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
