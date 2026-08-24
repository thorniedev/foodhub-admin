"use client";

import { useEffect } from "react";

import {
  CircleMinus,
  Loader2,
  X,
} from "lucide-react";

import type {
  AgeGroup,
} from "@/src/types/ageGroup";

type Props = {
  item: AgeGroup | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm:
    () => Promise<void>;
};

export default function DeleteAgeGroupConfirmModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!item) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [item]);

  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleMinus size={26} />
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mt-5 text-3xl font-semibold text-primary-800">
          បិទដំណើរការក្រុមអាយុនេះ?
        </p>

        <p className="mt-3 text-lg leading-8 text-gray-500">
          អ្នកកំពុងបិទដំណើរការ{" "}
          <span className="font-semibold text-gray-800">
            {item.name}
          </span>{" "}
          ({item.minAge}–{item.maxAge} ឆ្នាំ)។ អ្នកអាចស្ដារវាឡើងវិញបាននៅពេលក្រោយ។
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="min-h-12 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={() =>
              void onConfirm()
            }
            disabled={deleting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-500 px-4 text-lg font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <Loader2
                size={20}
                className="animate-spin"
              />
            )}

            បិទដំណើរការ
          </button>
        </div>
      </div>
    </div>
  );
}
