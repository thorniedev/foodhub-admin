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
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in zoom-in-95 duration-200">

        {/* ─── HEADER ─── */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              {isDrink ? <Coffee size={24} /> : <Utensils size={24} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-3xl font-semibold text-primary-800">{item.name}</p>
              <p className="mt-1 text-lg text-gray-500">{isDrink ? "អនុប្រភេទភេសជ្ជៈ" : "អនុប្រភេទម្ហូប"} ({item.code})</p>
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
              {/* Parent Category */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                  <Layers size={18} />
                  ប្រភេទមេ (Parent Category)
                </span>
                <p className="mt-2 text-xl font-bold text-gray-800">{parentName}</p>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="block text-lg font-medium text-primary-800">ស្ថានភាព</span>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-lg font-medium ${active
                        ? "bg-primary-50 text-primary-700"
                        : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${active ? "bg-primary-600" : "bg-gray-400"
                        }`}
                    />
                    {active ? "សកម្ម (Active)" : "អសកម្ម (Inactive)"}
                  </span>
                </div>
              </div>

              {/* Code */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                  <Hash size={18} />
                  កូដសម្គាល់ (Code)
                </span>
                <p className="mt-2 font-mono text-xl font-bold text-gray-800">
                  {item.code}
                </p>
              </div>

              {/* Created At */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex items-center gap-1.5 text-lg font-medium text-primary-800">
                  <Calendar size={18} />
                  កាលបរិច្ឆេទបង្កើត
                </span>
                <p className="mt-2 text-lg font-medium text-gray-700">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <span className="block text-lg font-medium text-primary-800">ការពិពណ៌នា</span>
              <p className="mt-2 text-lg leading-8 text-gray-700">
                {item.description || <span className="italic text-gray-400">មិនមានការពិពណ៌នាទេ។</span>}
              </p>
            </div>
          </div>

          {/* ─── FOOTER ─── */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:bg-gray-50"
            >
              បិទ
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-medium text-white shadow-sm transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              <Pencil size={18} />
              <span>កែប្រែ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
