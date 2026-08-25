"use client";

import { MessageSquareText, Plus, Star } from "lucide-react";

interface FeedbackBannerProps {
  total: number;
  newCount: number;
  resolvedCount: number;
  averageRating: number;
  onAddNew: () => void;
}

export default function FeedbackBanner({
  total,
  newCount,
  resolvedCount,
  averageRating,
  onAddNew,
}: FeedbackBannerProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 mb-6 text-white">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-white/15 rounded-xl p-3">
            <MessageSquareText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">មតិកែលម្អពីអតិថិជន</h1>
            <p className="text-emerald-50 text-sm mt-1 max-w-md">
              តាមដាន និងឆ្លើយតបទៅនឹងមតិកែលម្អពីអតិថិជនទាក់ទងនឹងកម្មវិធី គុណភាពអាហារ ការដឹកជញ្ជូន និងសេវាកម្ម
            </p>
          </div>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 bg-white text-emerald-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <Plus size={18} />
          បន្ថែមមតិថ្មី
        </button>
      </div>
      <div className="flex items-center gap-4 mt-6 flex-wrap">
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">សរុបទាំងអស់</p>
          <p className="text-xl font-bold">{total}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">មតិថ្មី</p>
          <p className="text-xl font-bold">{newCount}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">បានដោះស្រាយ</p>
          <p className="text-xl font-bold">{resolvedCount}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[140px]">
          <p className="text-xs text-emerald-50">ការវាយតម្លៃមធ្យម</p>
          <p className="text-xl font-bold flex items-center gap-1">
            {averageRating.toFixed(1)}
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
          </p>
        </div>
      </div>
    </div>
  );
}
