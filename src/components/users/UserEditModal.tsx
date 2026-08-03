"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { User, UserStatus } from "../../types/user";

interface UserEditModalProps {
  open: boolean;
  initialData: User | null;
  onClose: () => void;
  onSubmit: (id: string, changes: Partial<User>) => void;
}

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "active", label: "កំពុងដំណើរការ" },
  { value: "pending", label: "កំពុងរង់ចាំ" },
  { value: "banned", label: "បានផ្អាក" },
];

export default function UserEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: UserEditModalProps) {
  const [form, setForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData, open]);

  if (!open || !initialData) return null;

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.email?.trim()) return;
    onSubmit(initialData.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            កែសម្រួលអ្នកប្រើប្រាស់
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះ</label>
            <input
              type="text"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm sm:text-base text-gray-600 mb-1 block">
              ឈ្មោះហាង (បើមាន)
            </label>
            <input
              type="text"
              value={form.shopName ?? ""}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
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

          <div>
            <label className="text-sm text-gray-600 mb-1 block">អ៊ីម៉ែល</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ស្ថានភាព</label>
            <select
              value={form.status ?? "active"}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as UserStatus })
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