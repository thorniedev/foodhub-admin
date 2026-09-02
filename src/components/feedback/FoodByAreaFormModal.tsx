"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  Area,
  FoodByAreaImage,
} from "@/src/types/foodByArea";
import BannerImageUploader from "../dynamic-content/BannerImageUploader";

interface FoodByAreaFormModalProps {
  open: boolean;
  initialData?: FoodByAreaImage | null;
  onClose: () => void;
  onSubmit: (values: Omit<FoodByAreaImage, "id">) => void;
  saving?: boolean; // Added saving prop for Loader
}

const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: "phnom_penh", label: "ភ្នំពេញ" },
  { value: "siem_reap", label: "សៀមរាប" },
  { value: "battambang", label: "បាត់ដំបង" },
  { value: "kampot", label: "កំពត" },
  { value: "kratie", label: "ក្រចេះ" },
];

const emptyForm: Omit<FoodByAreaImage, "id"> = {
  image_url: "/Image/area/placeholder.jpg",
  name: "",
  description: "",
  location: "phnom_penh",
  isdisplay: true,
};

export default function FoodByAreaFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
  saving = false,
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto no-scrollbar rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="text-3xl font-bold text-[#136C34]">
              {initialData ? "កែសម្រួលរូបភាព" : "បន្ថែមរូបភាពថ្មី"}
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">ចំណងជើង</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                តំបន់/ខេត្ត
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value as Area })}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ផ្លូវរូបភាព
            </label>
            <input
              type="text"
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="/Image/area/xxx.jpg"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
            {/* <BannerImageUploader
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
            /> */}
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ការពិពណ៌នា
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">បង្ហាញ</p>
              <p className="text-sm text-gray-500">កំណត់ឲ្យរូបភាពនេះបង្ហាញនៅលើកម្មវិធី</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, isdisplay: !prev.isdisplay }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isdisplay ? "bg-[#136C34]" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isdisplay ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {saving && <Loader2 size={17} className="animate-spin" />}
              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
