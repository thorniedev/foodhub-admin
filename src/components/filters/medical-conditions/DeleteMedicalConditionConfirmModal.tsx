import {
  LoaderCircle,
  Trash2,
} from "lucide-react";

import type { MedicalCondition } from "@/src/types/medicalCondition";

type Props = {
  item:
    | MedicalCondition
    | null;

  deleting: boolean;

  onClose: () => void;

  onConfirm: () => Promise<void>;
};

export default function DeleteMedicalConditionConfirmModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        {/* ICON */}

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Trash2
            size={24}
          />
        </div>

        {/* TITLE */}

        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">
            បិទស្ថានភាពសុខភាពនេះ?
          </h3>
        </div>

        {/* ACTIONS */}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
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