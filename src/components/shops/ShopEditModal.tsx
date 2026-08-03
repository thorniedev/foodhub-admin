"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Shop, ShopStatus } from "../../types/shop";

interface ShopEditModalProps {
  open: boolean;
  initialData: Shop | null;
  onClose: () => void;
  onSubmit: (id: string, changes: Partial<Shop>) => void;
}

const STATUS_OPTIONS: { value: ShopStatus; label: string }[] = [
  { value: "active", label: "កំពុងដំណើរការ" },
  { value: "stopped", label: "បានបញ្ឈប់" },
  { value: "banned", label: "ត្រូវបានហាមឃាត់" },
];

export default function ShopEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: ShopEditModalProps) {
  const [form, setForm] = useState<Partial<Shop>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData, open]);

  if (!open || !initialData) return null;

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    onSubmit(initialData.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            កែសម្រួលហាង
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះហាង</label>
            <input
              type="text"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ស្ថានភាព</label>
              <select
                value={form.status ?? "active"}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ShopStatus })
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ម៉ោងបើក</label>
              <input
                type="text"
                value={form.openingHours ?? ""}
                onChange={(e) =>
                  setForm({ ...form, openingHours: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ម៉ោងបិទ</label>
              <input
                type="text"
                value={form.closingHours ?? ""}
                onChange={(e) =>
                  setForm({ ...form, closingHours: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ខេត្ត/ក្រុង</label>
            <input
              type="text"
              value={form.province ?? ""}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">អាសយដ្ឋាន</label>
            <textarea
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">លេខទូរស័ព្ទ</label>
            <input
              type="text"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
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