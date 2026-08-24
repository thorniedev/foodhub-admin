"use client";

import type { WeatherCondition } from "@/src/types/weather-condition";
import {
  CircleMinus,
  Loader2,
  X,
} from "lucide-react";

export default function DeactivateWeatherConditionModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: {
  item: WeatherCondition | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleMinus
              size={26}
            />
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-3xl font-black text-gray-900">
          បិទ Weather Condition?
        </p>

        <p className="mt-3 text-lg leading-7 text-gray-500">
          <span className="font-black text-gray-800">
            {item.name}
          </span>{" "}
          នឹងត្រូវ Deactivate តាម DELETE endpoint។
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full border border-gray-200 px-5 py-3 text-lg font-bold text-gray-600"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-lg font-black text-white disabled:opacity-60"
          >
            {deleting && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}

            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}
