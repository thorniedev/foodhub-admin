"use client";

import { Images } from "lucide-react";

interface BannersHeaderProps {
  totalBanners: number;
  publishedCount: number;
  onAddNew: () => void;
}

export default function BannersHeader({
  totalBanners,
  publishedCount,
  onAddNew,
}: BannersHeaderProps) {
  return (
    <div className="mb-6">
      <div className="bg-[#136C34] rounded-3xl p-4 sm:p-7 mb-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="bg-white/15 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shrink-0">
              <Images className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-400">
                ការគ្រប់គ្រងបែនណឺ
              </h1>
              <p className="text-white/85 text-lg sm:text-xl mt-2 sm:mt-3 max-w-xl leading-relaxed">
                គ្រប់គ្រងបែនណឺផ្សព្វផ្សាយ ពេញនិយម ទីតាំង និងរដូវកាល
                ដែលបង្ហាញនៅលើកម្មវិធី
              </p>
            </div>
          </div>

          <button
            onClick={onAddNew}
            className="flex items-center justify-center gap-2 bg-white text-[#136C34] text-lg font-normal px-5 py-3 rounded-full hover:bg-emerald-50 transition-colors w-full sm:w-auto shrink-0 shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            បន្ថែមថ្មី
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mt-5 sm:mt-6">
          <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3.5 py-3 sm:px-5 sm:py-4">
            <p className="text-lg sm:text-xl text-white/80">
              បែនណឺសរុប
            </p>
            <p className="mt-1 text-2xl font-bold text-white tabular-nums">{totalBanners}</p>
          </div>
          <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3.5 py-3 sm:px-5 sm:py-4">
            <p className="text-lg sm:text-xl text-white/80">
              បានបង្ហាញ
            </p>
            <p className="mt-1 text-2xl font-bold text-white tabular-nums">{publishedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
