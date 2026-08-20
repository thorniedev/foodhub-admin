"use client";

import { useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import {
  AdminBannerResponse,
  BANNER_CATEGORIES,
  BANNER_CATEGORY_LABELS,
  BannerCategory,
  CreateBannerPayload,
} from "../../../types/banner";
import BannerImageUploader from "../BannerImageUploader";
import { getAdminApiErrorMessage } from "../../../lib/adminApiError";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "../../../app/store/bannerApi";

interface BannerFormModalProps {
  onClose: () => void;
  editing: AdminBannerResponse | null;
  /** Pre-selects the category when creating from a category-scoped tab. */
  defaultCategory?: BannerCategory;
}

interface FormState {
  category: BannerCategory;
  title: string;
  location: string;
  description: string;
}

function emptyForm(defaultCategory: BannerCategory): FormState {
  return { category: defaultCategory, title: "", location: "", description: "" };
}

function initialForm(
  editing: AdminBannerResponse | null,
  defaultCategory: BannerCategory,
): FormState {
  if (!editing) return emptyForm(defaultCategory);
  return {
    category: editing.category,
    title: editing.title,
    location: editing.location ?? "",
    description: editing.description ?? "",
  };
}

/**
 * Mount this component only while the modal should be visible (e.g. `{isOpen && <BannerFormModal .../>}`).
 * Its local state is initialized once from `editing`/`defaultCategory` at mount time, so the parent
 * unmounting/remounting it is what resets the form — no effect-based reset needed.
 */
export default function BannerFormModal({
  onClose,
  editing,
  defaultCategory = "MAIN",
}: BannerFormModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    initialForm(editing, defaultCategory),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const isSaving = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const title = form.title.trim();
    if (!title) {
      setError("សូមបញ្ចូលចំណងជើង។");
      return;
    }

    if (form.category === "LOCATION" && !form.location.trim()) {
      setError("សូមបញ្ចូលទីតាំង សម្រាប់ប្រភេទ ទីតាំង។");
      return;
    }

    if (!editing && !imageFile) {
      setError("សូមបញ្ចូលរូបភាព។");
      return;
    }

    const payload: CreateBannerPayload = {
      category: form.category,
      title,
      description: form.description.trim() || undefined,
      location:
        form.category === "LOCATION" ? form.location.trim() : undefined,
    };

    try {
      if (editing) {
        await updateBanner({ id: editing.id, payload, image: imageFile }).unwrap();
      } else {
        await createBanner({ payload, image: imageFile as File }).unwrap();
      }
      onClose();
    } catch (submitError) {
      setError(getAdminApiErrorMessage(submitError));
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <p className="text-3xl font-bold text-[#136C34]">
            {editing ? "កែសម្រួលបែនណឺ" : "បន្ថែមបែនណឺថ្មី"}
          </p>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                ប្រភេទ (Category)
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as BannerCategory,
                    }))
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                >
                  {BANNER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {BANNER_CATEGORY_LABELS[category]} ({category})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {form.category === "LOCATION" && (
              <div>
                <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                  ទីតាំង (Location)
                </label>
                <input
                  required
                  value={form.location}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Siem Reap"
                  maxLength={100}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ចំណងជើង (Title)
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              maxLength={255}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          <BannerImageUploader
            file={imageFile}
            existingImageUrl={editing?.imageUrl}
            onChange={setImageFile}
            required={!editing}
          />

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ការពិពណ៌នា (Description)
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          {!editing && (
            <p className="text-sm text-gray-400">
              បែនណឺថ្មីនឹងមិនត្រូវបានបង្ហាញជាសាធារណៈទេ រហូតដល់អ្នកបើកសកម្មភាព
              &ldquo;បង្ហាញ&rdquo; នៅក្នុងតារាង។
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
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
