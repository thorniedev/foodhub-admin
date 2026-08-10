import { LoaderCircle, Trash2 } from "lucide-react";

import type { DietaryType } from "@/src/types/dietaryType";

type Props = {
  item: DietaryType | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteDietaryTypeConfirmModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Trash2 size={24} />
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">បិទរបបអាហារនេះ?</h3>
          {/* <p className="mt-2 text-sm leading-6 text-gray-500">
            អ្នកកំពុងបិទ 
            <span className="font-semibold text-gray-800">{item.name}</span>។
            នេះជា Soft Delete ដូច្នេះទិន្នន័យមិនត្រូវបានលុបចេញពី Database ទេ
            ហើយអាចស្ដារវិញបាន។
          </p> */}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleting && <LoaderCircle size={17} className="animate-spin" />}
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
