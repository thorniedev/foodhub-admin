"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  DietType,
  FoodCategory,
  FoodType,
  MealTime,
} from "@/src/types/foodType";

interface FoodTypeEditModalProps {
  open: boolean;
  initialData: FoodType | null;
  onClose: () => void;
  onSubmit: (id: string, changes: Partial<FoodType>) => void;
}

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "halal", label: "ហាឡាល់" },
  { value: "vegetarian", label: "បួស" },
  { value: "vegan", label: "វេហ្គិន" },
  { value: "normal", label: "ធម្មតា" },
];

const MEAL_OPTIONS: { value: MealTime; label: string }[] = [
  { value: "breakfast", label: "ព្រឹក" },
  { value: "lunch", label: "ថ្ងៃត្រង់" },
  { value: "evening", label: "ល្ងាច" },
];

const CATEGORY_OPTIONS: { value: FoodCategory; label: string }[] = [
  { value: "general", label: "ទូទៅ" },
  { value: "breakfast", label: "អាហារពេលព្រឹក" },
  { value: "regional", label: "អាហារតាមតំបន់" },
  { value: "seasonal", label: "អាហារតាមរដូវកាល" },
  { value: "age", label: "អាហារតាមវ័យ" },
];

export default function FoodTypeEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: FoodTypeEditModalProps) {
  const [form, setForm] = useState<Partial<FoodType>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData, open]);

  if (!open || !initialData) return null;

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.shopName?.trim()) return;
    onSubmit(initialData.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            កែសម្រួលចំណីអាហារ
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះអាហារ</label>
            <input
              type="text"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះហាង</label>
            <input
              type="text"
              value={form.shopName ?? ""}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                ការវាយតម្លៃ (0-5)
              </label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating ?? 0}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < 0) return;
                  setForm({ ...form, rating: val });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">របបអាហារ</label>
              <select
                value={form.dietType ?? "normal"}
                onChange={(e) =>
                  setForm({ ...form, dietType: e.target.value as DietType })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {DIET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ពេលវេលា</label>
              <select
                value={form.mealTime ?? "lunch"}
                onChange={(e) =>
                  setForm({ ...form, mealTime: e.target.value as MealTime })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MEAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ចម្ងាយ</label>
              <input
                type="text"
                value={form.distance ?? ""}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ទំហំ</label>
              <input
                type="text"
                value={form.portionSize ?? ""}
                onChange={(e) =>
                  setForm({ ...form, portionSize: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ប្រភេទ</label>
              <select
                value={form.category ?? "general"}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as FoodCategory })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            បោះបង់
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}