"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  CupSoda,
  Loader2,
  UtensilsCrossed,
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

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              {isDrink ? <CupSoda size={24} /> : <UtensilsCrossed size={24} />}
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary-800">
                {item
                  ? isDrink
                    ? "កែប្រែអនុប្រភេទភេសជ្ជៈ"
                    : "កែប្រែអនុប្រភេទម្ហូប"
                  : isDrink
                    ? "បន្ថែម អនុប្រភេទភេសជ្ជៈ"
                    : "បន្ថែម អនុប្រភេទម្ហូប"}
              </p>

              <p className="mt-0.5 truncate text-lg text-gray-500">
                {isDrink ? "Drink Sub-Categories" : "Food Sub-Categories"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-7">
          {/* Name & Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={isDrink ? "ឈ្មោះ អនុប្រភេទភេសជ្ជៈ" : "ឈ្មោះ អនុប្រភេទម្ហូប"}
              value={name}
              onChange={handleNameChange}
              placeholder={
                isDrink ? "ឧ. កាហ្វេបុរាណ, តែទឹកដោះគោ" : "ឧ. សម្ល និងស៊ុប, ម្ហូបឆា"
              }
              required
            />

            <Field
              label="កូដ (Code)"
              value={code}
              onChange={(value) => {
                setCode(value.toUpperCase());
                setIsCodeCustom(true);
              }}
              placeholder={isDrink ? "ឧ. DRINK_MILK_TEA" : "ឧ. FOOD_SOUP"}
              required
            />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>ការពិពណ៌នា</FieldLabel>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="បញ្ចូលការពិពណ៌នាអំពីអនុប្រភេទ..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg leading-8 text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5">
            <div className="min-w-0">
              <p className="text-lg font-medium text-primary-800">
                ស្ថានភាព
              </p>

              <p className="text-base text-gray-500">
                បើក ដើម្បីឱ្យអនុប្រភេទនេះសកម្មក្នុងប្រព័ន្ធ។
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
                isActive ? "bg-primary-700" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  isActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Validation error */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-lg leading-7 text-red-600">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-normal text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-normal text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={20} className="animate-spin" />}
              {saving
                ? "កំពុងរក្សាទុក..."
                : item
                  ? "រក្សាទុកការកែប្រែ"
                  : isDrink
                    ? "បន្ថែម អនុប្រភេទភេសជ្ជៈ"
                    : "បន្ថែម អនុប្រភេទម្ហូប"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-lg font-medium text-primary-800">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>

      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
      />
    </label>
  );
}
