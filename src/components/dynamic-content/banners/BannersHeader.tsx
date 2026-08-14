"use client";

import { Images } from "lucide-react";

interface BannersHeaderProps {
  totalBanners: number;
  totalSeasonal: number;
  totalArea: number;
  onAddNew?: () => void;
}

export default function BannersHeader({
  totalBanners,
  totalSeasonal,
  totalArea,
  onAddNew,
}: BannersHeaderProps) {
  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r bg-[#136C34] rounded-2xl p-4 sm:p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-white/15 rounded-xl p-3 shrink-0">
              <Images size={24} />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                ការគ្រប់គ្រងខ្លឹមសារថាមវន្ត
              </p>
              <p className="text-emerald-50 text-sm sm:text-base lg:text-lg mt-2 sm:mt-3 max-w-xl">
                ផ្ទាំងគ្រប់គ្រងទិន្នន័យ
                ដែលអនុញ្ញាតឱ្យអ្នកមើលឃើញខ្លឹមសារផ្សព្វផ្សាយសកម្មទាំងអស់ក្នុងកម្មវិធី
              </p>
            </div>
          </div>

          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center justify-center gap-2 bg-white text-[#136C34] text-sm sm:text-base font-medium px-4 py-2.5 rounded-full hover:bg-emerald-50 transition-colors w-full sm:w-auto shrink-0"
            >
              <span className="text-base leading-none">+</span>
              បន្ថែមថ្មី
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 mt-6 flex-wrap">
          <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
            <p className="text-sm sm:text-base lg:text-lg text-emerald-50">
              រូបភាពផ្សព្វផ្សាយ
            </p>
            <p className="text-xl font-bold">{totalBanners}</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
            <p className="text-sm sm:text-base lg:text-lg text-emerald-50">
              អាហាររដូវកាល
            </p>
            <p className="text-xl font-bold">{totalSeasonal}</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
            <p className="text-sm sm:text-base lg:text-lg text-emerald-50">
              អាហារតាមតំបន់
            </p>
            <p className="text-xl font-bold">{totalArea}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
