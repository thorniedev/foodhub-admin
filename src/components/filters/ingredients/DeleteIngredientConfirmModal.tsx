"use client";

import { useEffect } from "react";

import {
  Loader2,
  Trash2,
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
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trash2 size={24} />
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

        <p className="mt-5 text-2xl font-normal text-primary-800">
          បិទគ្រឿងផ្សំ?
        </p>

        <p className="mt-3 text-lg leading-8 font-normal text-gray-500">
          តើអ្នកចង់បិទ{" "}
          <span className="font-normal text-gray-800">
            {item.name}
          </span>{" "}
          មែនទេ?
        </p>

        <p className="mt-2 text-lg leading-8 font-normal text-gray-400">
          ទិន្នន័យមិនត្រូវបានលុបចេញពី Database ទេ។ វានឹងត្រូវបានកំណត់ជាអសកម្ម ហើយអាចស្ដារឡើងវិញបាន។
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 bg-white px-4 text-lg font-normal text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-500 px-4 text-lg font-normal text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <Loader2
                size={20}
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
