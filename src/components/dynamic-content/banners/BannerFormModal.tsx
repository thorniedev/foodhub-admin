"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Banner, BannerFormData } from "../../../types/banner";
import BannerImageUploader from "../BannerImageUploader";
import {
  useAddBannerMutation,
  useUpdateBannerMutation,
} from "../../../app/store/bannerApi";
import { handleFormArrowKeyNavigation } from "@/src/lib/formKeyboardNavigation";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: Banner | null;
}

const emptyForm: BannerFormData = {
  name: "",
  location: "",
  description: "",
  image_url: "",
  isdisplay: true,
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
      const { id: _id, ...rest } = editing;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [editing, isOpen]);

  const handleClose = () => {
    if (isSaving) return;
    setForm(emptyForm);
    onClose();
  };

  if (!isOpen) return null;

  const handleChange = (
    field: keyof BannerFormData,
    value: string,
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
    setForm(emptyForm);
    onClose();
  };

  const isSaving = isAdding || isUpdating;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="text-3xl font-bold text-[#136C34]">
              {editing ? "កែសម្រួលរូបបែនណី" : "បន្ថែមរូបបែនណីថ្មី"}
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormArrowKeyNavigation} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                ចំណងជើង (Name)
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                ទីតាំង (Location)
              </label>
              <input
                required
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              URL រូបភាព
            </label>
            <input
              required
              value={form.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              placeholder="/Image/food-picture/food 1.jpg"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
            {/* <BannerImageUploader
              value={form.image_url}
              onChange={(url) => handleChange("image_url", url)}
            /> */}
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ការពិពណ៌នា (Description)
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">បង្ហាញ (Active)</p>
              <p className="text-sm text-gray-500">កំណត់ឲ្យបែនណឺនេះបង្ហាញនៅលើកម្មវិធី</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, isdisplay: !prev.isdisplay }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isdisplay ? "bg-[#136C34]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.isdisplay ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {isSaving && <Loader2 size={17} className="animate-spin" />}
              {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}