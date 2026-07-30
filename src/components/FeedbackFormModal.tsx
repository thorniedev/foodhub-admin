"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { Feedback, FeedbackCategory, FeedbackStatus } from "@/src/types/feedback";

interface FeedbackFormModalProps {
  open: boolean;
  initialData?: Feedback | null;
  onClose: () => void;
  onSubmit: (values: Omit<Feedback, "id" | "createdAt">) => void;
}

const CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "app", label: "កម្មវិធី" },
  { value: "food_quality", label: "គុណភាពអាហារ" },
  { value: "delivery", label: "ការដឹកជញ្ជូន" },
  { value: "service", label: "សេវាកម្ម" },
];

const STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: "new", label: "ថ្មី" },
  { value: "reviewed", label: "បានពិនិត្យ" },
  { value: "resolved", label: "បានដោះស្រាយ" },
];

const emptyForm: Omit<Feedback, "id" | "createdAt"> = {
  customerName: "",
  avatar: "",
  message: "",
  rating: 5,
  category: "app",
  status: "new",
};

export default function FeedbackFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: FeedbackFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      const { id, createdAt, ...rest } = initialData;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.customerName.trim() || !form.message.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "កែសម្រួលមតិកែលម្អ" : "បន្ថែមមតិកែលម្អថ្មី"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះអតិថិជន</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ផ្លូវរូបភាព (avatar path)</label>
            <input
              type="text"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="/Image/users/xxx.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ប្រភេទ</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as FeedbackCategory })
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
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ស្ថានភាព</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as FeedbackStatus })
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
            <label className="text-sm text-gray-600 mb-1 block">ការវាយតម្លៃ</label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, rating: value })}
                  >
                    <Star
                      size={22}
                      className={
                        value <= form.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">សារមតិកែលម្អ</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
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
