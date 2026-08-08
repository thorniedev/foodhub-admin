"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import type {
  DietaryType,
  DietaryTypeFormValues,
} from "@/src/types/dietaryType";
import { DIETARY_TYPE_CATEGORIES } from "@/src/types/dietaryType";

const EMPTY_FORM: DietaryTypeFormValues = {
  code: "",
  name: "",
  category: "LIFESTYLE",
  description: "",
  active: true,
};

type Props = {
  open: boolean;
  item: DietaryType | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: DietaryTypeFormValues) => Promise<void>;
};

export default function DietaryTypeFormModal({
  open,
  item,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<DietaryTypeFormValues>(EMPTY_FORM);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(
      item
        ? {
            code: item.code,
            name: item.name,
            category: item.category,
            description: item.description ?? "",
            active: item.active,
          }
        : EMPTY_FORM,
    );

    setValidationError("");
  }, [open, item]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = form.code.trim();
    const name = form.name.trim();
    const category = form.category.trim();

    if (!code || !name || !category) {
      setValidationError("សូមបំពេញកូដ ឈ្មោះ និងប្រភេទរបបអាហារ។");
      return;
    }

    setValidationError("");

    await onSubmit({
      ...form,
      code,
      name,
      category,
      description: form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#136C34]">
              {item ? "កែប្រែរបបអាហារ" : "បន្ថែមរបបអាហារថ្មី"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Backend តម្រូវ code, name និង category។
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">កូដ *</label>
              <input
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, code: event.target.value }))
                }
                placeholder="VEGAN"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#136C34] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">ឈ្មោះ *</label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Vegan"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#136C34] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">ប្រភេទ *</label>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#136C34] focus:bg-white"
            >
              {DIETARY_TYPE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">ការពិពណ៌នា</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#136C34] focus:bg-white"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">សកម្ម</p>
              <p className="mt-0.5 text-xs text-gray-500">បើក ដើម្បីឱ្យកំណត់ត្រានេះសកម្ម។</p>
            </div>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, active: event.target.checked }))
              }
              className="h-5 w-5 accent-[#136C34]"
            />
          </label>

          {validationError && (
            <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={18} className="shrink-0" />
              {validationError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              {item ? "រក្សាទុកការកែប្រែ" : "បន្ថែម"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
