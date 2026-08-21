"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Sparkles,
  Tag,
  UsersRound,
  X,
} from "lucide-react";

import type { AgeGroup } from "@/src/types/ageGroup";
import { formatAdminDate } from "@/src/types/safetyResource";

interface AgeGroupDetailModalProps {
  item: AgeGroup | null;
  onClose: () => void;
}

export default function AgeGroupDetailModal({
  item,
  onClose,
}: AgeGroupDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!item) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isActive = item.isActive !== false;

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
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
              <UsersRound size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
                  {item.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-black ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {isActive ? "សកម្ម" : "អសកម្ម"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                ព័ត៌មានលម្អិតក្រុមអាយុ (Age Group Details)
              </p>
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

        {/* Content */}
        <div className="mt-6 space-y-5">
          {/* Core Info Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <UsersRound size={14} />
                ឈ្មោះក្រុមអាយុ
              </span>
              <p className="mt-2 text-base font-bold text-gray-900">
                {item.name || "—"}
              </p>
            </div>

            {/* English Name / Code */}
            <div className="relative rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <Tag size={14} />
                  ឈ្មោះជាភាសាអង់គ្លេស
                </span>
                {item.code && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.code, "code")}
                    className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700 transition"
                    title="Copy English Name / Code"
                  >
                    {copiedKey === "code" ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>
              <p className="mt-2 font-mono text-base font-bold text-gray-900">
                <span className="inline-flex rounded-lg bg-gray-200/80 px-2.5 py-0.5 font-mono text-base font-semibold text-gray-800">
                  {item.code || "—"}
                </span>
              </p>
            </div>

            {/* Age Range */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Clock size={14} />
                ចន្លោះអាយុ (Age Range)
              </span>
              <p className="mt-2 text-base font-bold text-primary-800">
                {item.minAge} – {item.maxAge} ឆ្នាំ (Years)
              </p>
            </div>

            {/* Status */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Sparkles size={14} />
                ស្ថានភាព (Status)
              </span>
              <p className="mt-2 text-base font-bold text-gray-900">
                {isActive ? "ACTIVE (បើកដំណើរការ)" : "INACTIVE (បិទដំណើរការ)"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              ការពិពណ៌នា (Description)
            </span>
            <p className="mt-2 text-base leading-relaxed text-gray-700">
              {item.description || "គ្មានការពិពណ៌នាឡើយ"}
            </p>
          </div>

          {/* System info */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-gray-400">UUID</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="truncate font-mono text-xs font-bold text-gray-700">
                    {item.uuid}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.uuid, "uuid")}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    {copiedKey === "uuid" ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">កាលបរិច្ឆេទបង្កើត</p>
                <p className="mt-1 text-xs font-bold text-gray-700">
                  {item.createdAt ? formatAdminDate(item.createdAt) : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">កែប្រែចុងក្រោយ</p>
                <p className="mt-1 text-xs font-bold text-gray-700">
                  {item.updatedAt ? formatAdminDate(item.updatedAt) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full bg-gray-900 px-6 text-base font-bold text-white transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
