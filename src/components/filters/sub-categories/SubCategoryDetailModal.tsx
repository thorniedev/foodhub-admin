"use client";

import {
  Calendar,
  Coffee,
  Hash,
  Layers,
  Pencil,
  ShieldCheck,
  Utensils,
  X,
} from "lucide-react";
import type { FoodCategory } from "@/src/types/foodCategory";

type Props = {
  item: FoodCategory | null;
  mode: "FOOD" | "DRINK";
  parentRootName: string;
  onClose: () => void;
  onEdit: (item: FoodCategory) => void;
};

export default function SubCategoryDetailModal({
  item,
  mode,
  parentRootName,
  onClose,
  onEdit,
}: Props) {
  if (!item) return null;

  const isDrink = mode === "DRINK";
  const active = item.isActive !== false;
  const parentName = item.parentCategoryName || parentRootName || (isDrink ? "ភេសជ្ជៈ (DRINK)" : "ម្ហូបអាហារ (FOOD)");

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("km-KH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              {isDrink ? <Coffee size={22} /> : <Utensils size={22} />}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{item.name}</p>
              <p className="font-mono text-lg text-gray-400">{item.code}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Parent Category */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-400">
                <Layers size={18} />
                <span>ប្រភេទមេ (Parent Root)</span>
              </div>
              <p className="mt-1 text-lg font-bold text-primary-800">{parentName}</p>
            </div>

            {/* Status */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-400">
                <ShieldCheck size={18} />
                <span>ស្ថានភាព</span>
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-0.5 text-lg font-bold ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      active ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {active ? "សកម្ម" : "អសកម្ម"}
                </span>
              </div>
            </div>

            {/* Code */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-400">
                <Hash size={18} />
                <span>កូដសម្គាល់</span>
              </div>
              <p className="mt-1 font-mono text-lg font-bold text-gray-800">
                {item.code}
              </p>
            </div>

            {/* Created At */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-lg font-bold text-gray-400">
                <Calendar size={18} />
                <span>កាលបរិច្ឆេទបង្កើត</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-700">
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-lg font-bold text-gray-400">ការពិពណ៌នា</p>
            <p className="mt-1 text-lg leading-relaxed text-gray-700">
              {item.description || "មិនមានការពិពណ៌នាទេ។"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 px-6 py-2 text-lg font-bold text-gray-600 transition hover:bg-gray-50"
          >
            បិទ
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-800 px-7 py-2 text-lg font-bold text-white shadow-sm transition hover:bg-primary-900"
          >
            <Pencil size={18} />
            <span>កែប្រែ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
