"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AvailabilityStatus, MenuItem } from "../../types/menuItem";

interface MenuItemEditModalProps {
  open: boolean;
  initialData: MenuItem | null;
  onClose: () => void;
  onSubmit: (uuid: string, changes: Partial<MenuItem>) => void;
}

const STATUS_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "AVAILABLE", label: "មាន" },
  { value: "UNAVAILABLE", label: "អសកម្ម" },
  { value: "OUT_OF_STOCK", label: "អស់ស្តុក" },
];

export default function MenuItemEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: MenuItemEditModalProps) {
  const [form, setForm] = useState<Partial<MenuItem>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData, open]);

  if (!open || !initialData) return null;

  const handleSubmit = () => {
    if (!form.localName?.trim() || !form.name?.trim()) return;
    onSubmit(initialData.uuid, form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">កែសម្រួល</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះ (ខ្មែរ)</label>
            <input
              value={form.localName ?? ""}
              onChange={(e) => setForm({ ...form, localName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះ (English)</label>
            <input
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">តម្លៃ</label>
              <input
                type="number"
                step="0.01"
                value={form.price ?? 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ពេលវេលារៀបចំ (នាទី)</label>
              <input
                type="number"
                value={form.preparationTimeMinutes ?? 0}
                onChange={(e) =>
                  setForm({ ...form, preparationTimeMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ស្ថានភាព</label>
              <select
                value={form.availabilityStatus ?? "AVAILABLE"}
                onChange={(e) =>
                  setForm({ ...form, availabilityStatus: e.target.value as AvailabilityStatus })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">កម្រិតហឹរ (0-3)</label>
              <input
                type="number"
                min={0}
                max={3}
                value={form.food?.spiceLevel ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    food: { ...(form.food as any), spiceLevel: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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