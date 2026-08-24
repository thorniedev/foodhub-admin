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
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <MessageSquareText size={25} />
            </div>

            <div>
              <p className="text-5xl font-bold text-accent-400">
                មតិកែលម្អ
              </p>
              <p className="mt-6 max-w-2xl text-xl text-white/85">
                តាមដាន និងឆ្លើយតបទៅនឹងមតិកែលម្អពីអតិថិជនទាក់ទងនឹងកម្មវិធី គុណភាពអាហារ និងសេវាកម្ម។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <MessageSquareText size={20} />
                <span>សរុបទាំងអស់</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <span>មតិថ្មី</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{newCount}</p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <span>បានដោះស្រាយ</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{resolvedCount}</p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <span>ការវាយតម្លៃមធ្យម</span>
              </div>
              <p className="mt-1 text-2xl font-bold flex items-center gap-1.5">
                {averageRating.toFixed(1)}
                <Star size={20} className="fill-yellow-300 text-yellow-300" />
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
        >
          <Plus size={20} />
          <span>បន្ថែមមតិថ្មី</span>
        </button>
      </div>
    </section>
  );
}
