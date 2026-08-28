"use client";

import type { WeatherCondition } from "@/src/types/weather-condition";
import {
  Loader2,
  MinusCircle,
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
            <MinusCircle
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

        <p className="mt-5 text-2xl font-normal text-gray-800">
          បិទ Weather Condition?
        </p>

        <p className="mt-3 text-lg leading-7 font-normal text-gray-500">
          <span className="font-normal text-gray-800">
            {item.name}
          </span>{" "}
          នឹងត្រូវ Deactivate តាម DELETE endpoint។
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full border border-gray-200 px-6 py-3 text-lg font-normal text-gray-600 hover:bg-gray-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-lg font-normal text-white disabled:opacity-60 hover:bg-red-600"
          >
            {deleting && (
              <Loader2
                size={20}
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
