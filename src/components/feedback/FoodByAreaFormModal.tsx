"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import type { Area, FoodByAreaImage } from "@/src/types/foodByArea";
import type { FoodByAreaPayload } from "@/src/app/store/foodByAreaApi";
import { getValidImageUrl } from "@/src/utils/imageUrl";
import { handleFormArrowKeyNavigation } from "@/src/lib/formKeyboardNavigation";

interface FoodByAreaFormModalProps {
  open: boolean;
  initialData?: FoodByAreaImage | null;
  onClose: () => void;
  onSubmit: (values: FoodByAreaPayload) => Promise<void> | void;
  saving?: boolean;
}

const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: "phnom_penh", label: "ភ្នំពេញ (Phnom Penh)" },
  { value: "siem_reap", label: "សៀមរាប (Siem Reap)" },
  { value: "battambang", label: "បាត់ដំបង (Battambang)" },
  { value: "kampot", label: "កំពត (Kampot)" },
  { value: "kratie", label: "ក្រចេះ (Kratie)" },
];

export default function FoodByAreaFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
  saving = false,
}: FoodByAreaFormModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState<string>("phnom_penh");
  const [description, setDescription] = useState("");
  const [isdisplay, setIsdisplay] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setName(initialData.name || "");
      setLocation(initialData.location || "phnom_penh");
      setDescription(initialData.description || "");
      setIsdisplay(initialData.isdisplay ?? true);
      setPreviewUrl(initialData.image_url ? getValidImageUrl(initialData.image_url) : "");
      setImageFile(null);
    } else {
      setName("");
      setLocation("phnom_penh");
      setDescription("");
      setIsdisplay(true);
      setPreviewUrl("");
      setImageFile(null);
    }
    setError(null);
  }, [initialData, open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, WEBP)");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("សូមបញ្ចូលចំណងជើងរូបភាព។");
      return;
    }

    if (!location.trim()) {
      setError("សូមជ្រើសរើសទីតាំង/តំបន់។");
      return;
    }

    if (!initialData && !imageFile) {
      setError("សូមជ្រើសរើសរូបភាពបដា (Image is required)។");
      return;
    }

    try {
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        isdisplay,
        imageFile,
      });
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "មានបញ្ហាក្នុងការរក្សាទុក។");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="text-2xl font-bold text-[#136C34]">
              {initialData ? "កែសម្រួលរូបភាពតាមតំបន់" : "បន្ថែមរូបភាពតាមតំបន់ថ្មី"}
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleFormArrowKeyNavigation} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-lg font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Title & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xl font-semibold text-gray-700">ចំណងជើង *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ឧ. មុខម្ហូបប្រចាំតំបន់ភ្នំពេញ"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-4 focus:ring-[#136C34]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xl font-semibold text-gray-700">តំបន់/ទីតាំង *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-4 focus:ring-[#136C34]/10"
              >
                {AREA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-xl font-semibold text-gray-700">
              រូបភាពបដា {!initialData && "*"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <Image
                  src={previewUrl}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                  unoptimized={previewUrl.startsWith("blob:") || previewUrl.startsWith("data:")}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-4 py-2 text-lg font-medium text-white shadow transition hover:bg-black/80"
                >
                  ប្តូររូបភាព
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#136C34] hover:bg-emerald-50/50"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="mt-2 text-lg font-medium text-gray-600">ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព</span>
                <span className="mt-1 text-sm text-gray-400">PNG, JPG, WEBP (អតិបរមា 10MB)</span>
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-xl font-semibold text-gray-700">
              ការពិពណ៌នា
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="បញ្ចូលការពិពណ៌នាអំពីមុខម្ហូប ឬបដាតាមតំបន់..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-4 focus:ring-[#136C34]/10"
            />
          </div>

          {/* Display Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xl font-semibold text-gray-800">បង្ហាញ (Display)</p>
              <p className="text-lg text-gray-500">កំណត់ឲ្យរូបភាពនេះបង្ហាញនៅលើកម្មវិធី</p>
            </div>
            <button
              type="button"
              onClick={() => setIsdisplay((prev) => !prev)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isdisplay ? "bg-[#136C34]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isdisplay ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-6 py-2.5 text-lg font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-6 py-2.5 text-lg font-medium text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
