"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Season, SeasonalFoodImage, SeasonalFoodStatus } from "../../types/seasonalFood";

interface SeasonalFoodFormModalProps {
  open: boolean;
  initialData?: SeasonalFoodImage | null;
  onClose: () => void;
  onSubmit: (values: Omit<SeasonalFoodImage, "id">) => void;
}

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "rainy", label: "រដូវវស្សា" },
  { value: "dry", label: "រដូវប្រាំង" },
  { value: "hot", label: "រដូវក្តៅ" },
  { value: "festival", label: "ថ្ងៃបុណ្យ" },
];

const STATUS_OPTIONS: { value: SeasonalFoodStatus; label: string }[] = [
  { value: "active", label: "កំពុងបង្ហាញ" },
  { value: "pending", label: "កំពុងរង់ចាំ" },
  { value: "disabled", label: "បានបិទ" },
];

const emptyForm: Omit<SeasonalFoodImage, "id"> = {
  image: "/Image/seasonal/placeholder.jpg",
  title: "",
  description: "",
  season: "rainy",
  status: "pending",
};

export default function SeasonalFoodFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: SeasonalFoodFormModalProps) {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
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
              placeholder="/Image/seasonal/xxx.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">រដូវកាល</label>
              <select
                value={form.season}
                onChange={(e) =>
                  setForm({ ...form, season: e.target.value as Season })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SEASON_OPTIONS.map((opt) => (
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
                  setForm({ ...form, status: e.target.value as SeasonalFoodStatus })
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