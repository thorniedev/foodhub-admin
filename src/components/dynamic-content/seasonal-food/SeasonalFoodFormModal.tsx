"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { z } from "zod";
import { Season, SeasonalFoodImage } from "../../../types/seasonalFood";
import BannerImageUploader from "../BannerImageUploader";

const seasonalFoodSchema = z.object({
  name: z.string().trim().min(1, "សូមបញ្ចូលចំណងជើង"),
  image_url: z.string().trim().min(1, "សូមបញ្ចូលផ្លូវរូបភាព"),
  season: z.string().trim().min(1, "សូមបញ្ចូលរដូវកាល"),
  order: z.number().min(1, "លំដាប់ត្រូវតែធំជាង ឬស្មើ ១"),
});

interface SeasonalFoodFormModalProps {
  open: boolean;
  initialData?: SeasonalFoodImage | null;
  onClose: () => void;
  onSubmit: (values: Omit<SeasonalFoodImage, "id">) => void;
  saving?: boolean; // Added saving prop for Loader
}

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "rainy", label: "រដូវវស្សា" },
  { value: "dry", label: "រដូវប្រាំង" },
  { value: "hot", label: "រដូវក្តៅ" },
  { value: "festival", label: "ថ្ងៃបុណ្យ" },
];

type SeasonalFoodFormValues = Omit<SeasonalFoodImage, "id">;

const emptyForm: SeasonalFoodFormValues = {
  image_url: "/Image/seasonal/placeholder.jpg",
  name: "",
  season: "rainy",
  order: 1,
  isdisplay: true,
};

function getInitialForm(
  initialData?: SeasonalFoodImage | null,
): SeasonalFoodFormValues {
  if (!initialData) {
    return emptyForm;
  }

  return {
    image_url: initialData.image_url,
    name: initialData.name,
    season: initialData.season,
    order: initialData.order,
  };
}

export default function SeasonalFoodFormModal({
  open,
  initialData,
  onClose,
  onSubmit,
  saving = false,
}: SeasonalFoodFormModalProps) {
  if (!open) return null;

  return (
    <SeasonalFoodFormContent
      key={initialData?.id ?? "new-seasonal-food"}
      initialData={initialData}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
    />
  );
}

function SeasonalFoodFormContent({
  initialData,
  onClose,
  onSubmit,
  saving,
}: Omit<SeasonalFoodFormModalProps, "open">) {
  const [form, setForm] = useState(() => getInitialForm(initialData));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const result = seasonalFoodSchema.safeParse({
      name: form.name,
      image_url: form.image_url,
      season: form.season,
      order: form.order,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !errMap[fieldName]) {
          errMap[fieldName] = issue.message;
        }
      });
      setFieldErrors(errMap);
      return;
    }

    setFieldErrors({});
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
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

        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ចំណងជើង <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearFieldError("name");
              }}
              className={`h-12 w-full rounded-xl border px-4 text-base text-gray-800 outline-none transition ${
                fieldErrors.name
                  ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 bg-gray-50 focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ផ្លូវរូបភាព <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => {
                setForm({ ...form, image_url: e.target.value });
                clearFieldError("image_url");
              }}
              placeholder="/Image/seasonal/xxx.jpg"
              className={`h-12 w-full rounded-xl border px-4 text-base text-gray-800 outline-none transition ${
                fieldErrors.image_url
                  ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 bg-gray-50 focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              }`}
            />
            {fieldErrors.image_url && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.image_url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                រដូវកាល <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.season}
                onChange={(e) => {
                  setForm({ ...form, season: e.target.value as Season });
                  clearFieldError("season");
                }}
                className={`h-12 w-full rounded-xl border px-4 text-base text-gray-800 outline-none transition ${
                  fieldErrors.season
                    ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 bg-gray-50 focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                }`}
              />
              {fieldErrors.season && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.season}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                លំដាប់ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.order}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm({ ...form, order: val });
                  clearFieldError("order");
                }}
                className={`h-12 w-full rounded-xl border px-4 text-base text-gray-800 outline-none transition ${
                  fieldErrors.order
                    ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 bg-gray-50 focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                }`}
              />
              {fieldErrors.order && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.order}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">បង្ហាញ</p>
              <p className="text-sm text-gray-500">
                កំណត់ឲ្យរូបភាពនេះបង្ហាញនៅលើកម្មវិធី
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, isdisplay: !prev.isdisplay }))
              }
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
