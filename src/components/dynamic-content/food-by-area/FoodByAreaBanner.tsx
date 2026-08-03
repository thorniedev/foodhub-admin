"use client";

import { MapPin, Plus } from "lucide-react";

interface FoodByAreaBannerProps {
  total: number;
  activeCount: number;
  pendingCount: number;
  onAddNew: () => void;
}

export default function FoodByAreaBanner({
  total,
  activeCount,
  pendingCount,
  onAddNew,
}: FoodByAreaBannerProps) {
  return (
    <div className="bg-gradient-to-r bg-[#136C34] rounded-2xl sm:rounded-4xl p-4 sm:p-6 mb-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-white/15 rounded-xl p-3 shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              រូបភាពអាហារតាមតំបន់
            </p>
            <p className="text-emerald-50 text-sm mt-1 max-w-md">
              គ្រប់គ្រងរូបភាព និងខ្លឹមសារអាហារពិសេសប្រចាំខេត្ត/តំបន់ ដែលបង្ហាញនៅលើកម្មវិធីអតិថិជន
            </p>
          </div>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 bg-white text-[#136C34] text-sm sm:text-base font-medium px-4 py-2.5 rounded-full hover:bg-emerald-50 transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus size={18} />
          បន្ថែមរូបភាពថ្មី
        </button>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 mt-6 flex-wrap">
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
          <p className="text-xs text-emerald-50">សរុបទាំងអស់</p>
          <p className="text-xl font-bold">{total}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
          <p className="text-xs text-emerald-50">កំពុងបង្ហាញ</p>
          <p className="text-xl font-bold">{activeCount}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
          <p className="text-xs text-emerald-50">កំពុងរង់ចាំ</p>
          <p className="text-xl font-bold">{pendingCount}</p>
        </div>
      </div>
    </div>
  );
}