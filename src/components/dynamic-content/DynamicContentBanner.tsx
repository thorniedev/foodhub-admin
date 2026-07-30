"use client";

import { Layers, Plus } from "lucide-react";

interface DynamicContentBannerProps {
  totalOptions: number;
  totalGroups: number;
  activeCount: number;
  onAddNew: () => void;
}

export default function DynamicContentBanner({
  totalOptions,
  totalGroups,
  activeCount,
  onAddNew,
}: DynamicContentBannerProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 mb-6 text-white">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-white/15 rounded-xl p-3">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">មាតិកាថាមវន្ត</h1>
            <p className="text-emerald-50 text-sm mt-1 max-w-md">
              គ្រប់គ្រងជម្រើសត្រងទាំងអស់ដែលបង្ហាញនៅលើកម្មវិធីអតិថិជន ដូចជា ពេលវេលា ចម្ងាយ
              ប្រភេទចំណីអាហារ របបអាហារ តម្លៃ និងក្រុមអាយុ
            </p>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center gap-2 bg-white text-emerald-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <Plus size={18} />
          បន្ថែមជម្រើសថ្មី
        </button>
      </div>

      <div className="flex items-center gap-4 mt-6 flex-wrap">
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">ក្រុមជម្រើសទាំងអស់</p>
          <p className="text-xl font-bold">{totalGroups}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">ជម្រើសសរុប</p>
          <p className="text-xl font-bold">{totalOptions}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">កំពុងបង្ហាញ</p>
          <p className="text-xl font-bold">{activeCount}</p>
        </div>
      </div>
    </div>
  );
}