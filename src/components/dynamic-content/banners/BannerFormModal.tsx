"use client";

import { useEffect, useState } from "react";
import { Banner, BannerFormData } from "../../../types/banner";

import {
  useAddBannerMutation,
  useUpdateBannerMutation,
} from "../../../app/store/bannerApi";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: Banner | null;
}

const emptyForm: BannerFormData = {
  title: "",
  imageUrl: "",
  link: "",
  order: 1,
  status: "active",
};

export default function BannerFormModal({
  isOpen,
  onClose,
  editing,
}: BannerFormModalProps) {
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [addBanner, { isLoading: isAdding }] = useAddBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  useEffect(() => {
    if (editing) {
      const { id: _id, createdAt: _createdAt, ...rest } = editing;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [editing, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    field: keyof BannerFormData,
    value: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateBanner({ id: editing.id, data: form });
    } else {
      await addBanner(form);
    }
    onClose();
  };

  const isSaving = isAdding || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-4 sm:p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-base sm:text-lg font-semibold text-gray-800">
          {editing ? "កែសម្រួលរូបបែនណី" : "បន្ថែមរូបបែនណីថ្មី"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">ចំណងជើង</label>
            <input
              required
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              URL រូបភាព
            </label>
            <input
              required
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="/Image/food-picture/food 1.jpg"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              តំណភ្ជាប់ (ស្រេចចិត្ត)
            </label>
            <input
              value={form.link}
              onChange={(e) => handleChange("link", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">លំដាប់</label>
              <input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => handleChange("order", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                សកម្មភាព
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600"
              >
                <option value="active">សកម្ម</option>
                <option value="inactive">អសកម្ម</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}