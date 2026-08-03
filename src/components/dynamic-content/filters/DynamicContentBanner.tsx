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
    <div className="bg-gradient-to-r bg-[#136C34] rounded-2xl p-4 sm:p-6 mb-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-white/15 rounded-xl p-3 shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">ការត្រង</p>
            <p className="text-emerald-50 text-sm sm:text-base mt-2 sm:mt-3 max-w-md">
              គ្រប់គ្រងជម្រើសត្រងទាំងអស់ដែលបង្ហាញនៅលើកម្មវិធីអតិថិជន ដូចជា ប្រភេទចំណីអាហារ របបអាហារ តម្លៃ និងក្រុមអាយុ
            </p>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 bg-white text-[#136C34] text-sm sm:text-base font-medium px-4 py-2.5 rounded-full hover:bg-emerald-50 transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus size={18} />
          បន្ថែមជម្រើសថ្មី
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mt-6 flex-wrap">
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
          <p className="text-sm sm:text-base text-emerald-50">ក្រុមជម្រើសទាំងអស់</p>
          <p className="text-xl font-bold">{totalGroups}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
          <p className="text-sm sm:text-base text-emerald-50">ជម្រើសសរុប</p>
          <p className="text-xl font-bold">{totalOptions}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
          <p className="text-sm sm:text-base text-emerald-50">កំពុងបង្ហាញ</p>
          <p className="text-xl font-bold">{activeCount}</p>
        </div>
      </div>
    </div>
  );
}