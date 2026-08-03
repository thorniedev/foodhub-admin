"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { UserProfile, Gender, Relationship } from "../../types/userProfile";

interface UserEditModalProps {
  open: boolean;
  initialData: UserProfile | null;
  onClose: () => void;
  onSubmit: (uuid: string, changes: Partial<UserProfile>) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "ប្រុស" },
  { value: "FEMALE", label: "ស្រី" },
  { value: "OTHER", label: "ផ្សេងៗ" },
];

const RELATIONSHIP_OPTIONS: { value: Relationship; label: string }[] = [
  { value: "SELF", label: "ខ្លួនឯង" },
  { value: "CHILD", label: "កូន" },
  { value: "PARENT", label: "ឪពុកម្តាយ" },
  { value: "SPOUSE", label: "ប្តី/ប្រពន្ធ" },
  { value: "OTHER", label: "ផ្សេងៗ" },
];

const LANGUAGE_OPTIONS = [
  { value: "km", label: "ខ្មែរ" },
  { value: "en", label: "English" },
];

export default function UserEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: UserEditModalProps) {
  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData, open]);

  if (!open || !initialData) return null;

  const handleSubmit = () => {
    if (!form.profileName?.trim() || !form.dateOfBirth) return;
    onSubmit(initialData.uuid, form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            កែសម្រួលប្រវត្តិរូប
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
              value={form.profileName ?? ""}
              onChange={(e) => setForm({ ...form, profileName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ទំនាក់ទំនង</label>
            <select
              value={form.relationship ?? "SELF"}
              onChange={(e) =>
                setForm({ ...form, relationship: e.target.value as Relationship })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ភេទ</label>
            <select
              value={form.gender ?? "MALE"}
              onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ថ្ងៃខែឆ្នាំកំណើត</label>
            <input
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ភាសាដែលចូលចិត្ត</label>
            <select
              value={form.preferredLanguage ?? "km"}
              onChange={(e) =>
                setForm({ ...form, preferredLanguage: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-600">
              សកម្ម (Active)
            </label>
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