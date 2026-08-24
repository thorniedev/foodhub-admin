"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Coffee,
  Hash,
  Layers,
  Loader2,
  Utensils,
  X,
} from "lucide-react";
import type { FoodCategory, FoodCategoryPayload } from "@/src/types/foodCategory";

type Props = {
  open: boolean;
  mode: "FOOD" | "DRINK";
  item: FoodCategory | null;
  parentRootUuid: string;
  parentRootName: string;
  parentRootCode: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: FoodCategoryPayload) => Promise<void>;
};

function generateCode(name: string, prefix: string): string {
  if (!name.trim()) return "";
  const cleaned = name
    .trim()
    .toUpperCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");

  if (cleaned.length > 0) {
    return `${prefix}_${cleaned}`.slice(0, 40);
  }
  return `${prefix}_${Date.now()}`;
}

export default function SubCategoryFormModal({
  open,
  mode,
  item,
  parentRootUuid,
  parentRootName,
  parentRootCode,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const isDrink = mode === "DRINK";
  const prefix = isDrink ? "DRINK" : "FOOD";

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isCodeCustom, setIsCodeCustom] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (item) {
      setName(item.name || "");
      setCode(item.code || "");
      setDescription(item.description || "");
      setIsActive(item.isActive !== false);
      setIsCodeCustom(true);
      setError("");
    } else {
      setName("");
      setCode("");
      setDescription("");
      setIsActive(true);
      setIsCodeCustom(false);
      setError("");
    }
  }, [open, item]);

  // Handle name change and auto code generation
  const handleNameChange = (val: string) => {
    setName(val);
    if (!item && !isCodeCustom) {
      setCode(generateCode(val, prefix));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("សូមបញ្ចូលឈ្មោះអនុប្រភេទ។");
      return;
    }

    const finalCode = code.trim() || generateCode(trimmedName, prefix);

    try {
      await onSubmit({
        code: finalCode,
        name: trimmedName,
        description: description.trim() || null,
        parentCategoryUuid: parentRootUuid || null,
        isActive,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ។",
      );
    }
  };

  if (!open) return null;

  const modalTitle = item
    ? isDrink
      ? "កែប្រែអនុប្រភេទភេសជ្ជៈ"
      : "កែប្រែអនុប្រភេទម្ហូប"
    : isDrink
      ? "បន្ថែមអនុប្រភេទភេសជ្ជៈថ្មី"
      : "បន្ថែមអនុប្រភេទម្ហូបថ្មី";

  const modalSubtitle = isDrink
    ? "អនុប្រភេទនេះនឹងស្ថិតនៅក្រោមប្រភេទមេ ភេសជ្ជៈ (DRINK) និងបង្ហាញក្នុងទម្រង់បង្កើតភេសជ្ជៈ។"
    : "អនុប្រភេទនេះនឹងស្ថិតនៅក្រោមប្រភេទមេ ម្ហូបអាហារ (FOOD) និងបង្ហាញក្នុងទម្រង់បង្កើតមុខម្ហូប។";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              {isDrink ? <Coffee size={22} /> : <Utensils size={22} />}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{modalTitle}</p>
              <p className="text-lg text-gray-400">{modalSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-4 text-lg text-red-600">
              <AlertTriangle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parent Category Informational Banner */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-emerald-800">
              <Layers size={18} />
              <span>ប្រភេទមេ (Parent Root Category)</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-lg font-bold text-emerald-950">
                {parentRootName || (isDrink ? "ភេសជ្ជៈ" : "ម្ហូបអាហារ")} ({parentRootCode || prefix})
              </p>
              <span className="rounded-lg bg-emerald-200/60 px-2.5 py-0.5 font-mono text-lg font-bold text-emerald-900">
                ROOT
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-lg font-bold text-gray-700">
              ឈ្មោះអនុប្រភេទ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={
                isDrink ? "ឧ. កាហ្វេបុរាណ, តែទឹកដោះគោ" : "ឧ. សម្ល និងស៊ុប, ម្ហូបឆា"
              }
              className="h-[52px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-lg text-gray-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>

          {/* Code Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-lg font-bold text-gray-700">
                កូដ (Code) <span className="text-red-500">*</span>
              </label>
              {!item && (
                <span className="text-lg text-gray-400">
                  (បង្កើតស្វ័យប្រវត្តិតាមឈ្មោះ)
                </span>
              )}
            </div>
            <div className="relative">
              <Hash
                size={20}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setIsCodeCustom(true);
                }}
                placeholder={isDrink ? "DRINK_MILK_TEA" : "FOOD_SOUP"}
                className="h-[52px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 font-mono text-lg uppercase text-gray-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="block text-lg font-bold text-gray-700">
              ការពិពណ៌នា
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ព័ត៌មានបន្ថែមអំពីអនុប្រភេទនេះ..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-lg text-gray-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
          </div>



          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="min-h-12 rounded-full border border-gray-200 px-6 py-2.5 text-lg font-bold text-gray-600 transition hover:bg-gray-50 focus:outline-none"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-800 px-7 py-2.5 text-lg font-bold text-white shadow-sm transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {item ? "រក្សាទុកការកែប្រែ" : "បង្កើតអនុប្រភេទ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
