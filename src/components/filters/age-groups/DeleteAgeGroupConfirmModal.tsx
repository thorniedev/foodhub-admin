"use client";

import {
  LoaderCircle,
  Trash2,
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
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2
              size={
                24
              }
            />
          </div>

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onClose
            }
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X
              size={
                20
              }
            />
          </button>
        </div>

        <h3 className="mt-5 text-2xl font-bold text-gray-900">
          លុបក្រុមអាយុនេះ?
        </h3>

        <p className="mt-3 text-base leading-7 text-gray-500">
          អ្នកកំពុងលុប{" "}

          <span className="font-semibold text-gray-800">
            {
              item.name
            }
          </span>{" "}

          ({
            item.minAge
          }
          –
          {
            item.maxAge
          }{" "}
          ឆ្នាំ)។
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              deleting
            }
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={() =>
              void onConfirm()
            }
            disabled={
              deleting
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-lg font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleting && (
              <LoaderCircle
                size={
                  17
                }
                className="animate-spin"
              />
            )}

            លុប
          </button>
        </div>
      </div>
    </div>
  );
}