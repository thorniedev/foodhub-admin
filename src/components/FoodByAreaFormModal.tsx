"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Area, FoodByAreaImage, FoodByAreaStatus } from "@/src/types/foodByArea";

interface FoodByAreaFormModalProps {
  open: boolean;
  initialData?: FoodByAreaImage | null;
  onClose: () => void;
  onSubmit: (values: Omit<FoodByAreaImage, "id">) => void;
}

const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: "phnom_penh", label: "ភ្នំពេញ" },
  { value: "siem_reap", label: "សៀមរាប" },
  { value: "battambang", label: "បាត់ដំបង" },
  { value: "kampot", label: "កំពត" },
  { value: "kratie", label: "ក្រចេះ" },
];

const STATUS_OPTIONS: { value: FoodByAreaStatus; label: string }[] = [
  { value: "active", label: "កំពុងបង្ហាញ" },
  { value: "pending", label: "កំពុងរង់ចាំ" },
  { value: "disabled", label: "បានបិទ" },
];

const emptyForm: Omit<FoodByAreaImage, "id"> = {
  image: "/Image/area/placeholder.jpg",
  title: "",
  description: "",
  area: "phnom_penh",
  status: "pending",
};

export default function FoodByAreaFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: FoodByAreaFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "កែសម្រួលរូបភាព" : "បន្ថែមរូបភាពថ្មី"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ចំណងជើង</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ផ្លូវរូបភាព (path)</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="/Image/area/xxx.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">តំបន់/ខេត្ត</label>
              <select
                value={form.area}
                onChange={(e) =>
                  setForm({ ...form, area: e.target.value as Area })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {AREA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ស្ថានភាព</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as FoodByAreaStatus })
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

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
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
