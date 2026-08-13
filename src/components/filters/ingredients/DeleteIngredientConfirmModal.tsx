import {
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import type {
  Ingredient,
} from "@/src/types/ingredient";

interface Props {
  item: Ingredient | null;
  deleting?: boolean;

  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteIngredientConfirmModal({
  item,
  deleting = false,
  onClose,
  onConfirm,
}: Props) {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[500px] rounded-[26px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangle
              size={24}
            />
          </div>

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="mt-5 text-2xl font-bold text-gray-800">
          បិទគ្រឿងផ្សំ?
        </h3>

        <p className="mt-3 text-base leading-7 text-gray-500">
          តើអ្នកចង់បិទ{" "}
          <span className="font-semibold text-gray-800">
            {item.name}
          </span>{" "}
          មែនទេ?
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          ទិន្នន័យមិនត្រូវបានលុបចេញពី Database ទេ។ វានឹងត្រូវបានកំណត់ជាអសកម្ម ហើយអាចស្ដារឡើងវិញបាន។
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={
              deleting
            }
            onClick={onClose}
            className="h-11 rounded-xl border border-gray-200 px-5 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={
              deleting
            }
            onClick={
              onConfirm
            }
            className="inline-flex h-11 min-w-[110px] items-center justify-center gap-2 rounded-xl bg-red-500 px-5 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {deleting && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}