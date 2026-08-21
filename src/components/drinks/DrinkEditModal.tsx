"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Drink, DrinkVariant } from "@/src/types/drink";

interface DrinkEditModalProps {
  open: boolean;
  initialData: Drink | null;
  onClose: () => void;
  onSubmit: (id: string, changes: Partial<Drink>) => void;
}

const TYPE_OPTIONS: { value: DrinkVariant; label: string }[] = [
  { value: "hot", label: "ក្តៅ" },
  { value: "cold", label: "ត្រជាក់" },
  { value: "juice", label: "ទឹកផ្លែឈើ" },
  { value: "other", label: "ផ្សេងៗ" },
];

export default function DrinkEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: DrinkEditModalProps) {
  const [form, setForm] = useState<Partial<Drink>>({});

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
            កែសម្រួលភេសជ្ជៈ
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះភេសជ្ជៈ</label>
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
              <label className="text-sm text-gray-600 mb-1 block">ប្រភេទ</label>
              <select
                value={form.drinkType ?? "other"}
                onChange={(e) =>
                  setForm({ ...form, drinkType: e.target.value as DrinkVariant })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                កម្រិតជាតិស្ករ
              </label>
              <input
                type="text"
                value={form.sugarLevel ?? ""}
                onChange={(e) => setForm({ ...form, sugarLevel: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ទំហំ</label>
            <input
              type="text"
              value={form.portionSize ?? ""}
              onChange={(e) => setForm({ ...form, portionSize: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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