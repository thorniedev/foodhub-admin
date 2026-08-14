"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Save, X } from "lucide-react";

import {
  useCreateFoodMutation,
  useGetCuisinesQuery,
  useGetFoodCategoriesQuery,
} from "@/src/app/store/menuItemApi";
import { getMenuItemApiErrorMessage } from "@/src/lib/menuItemApiError";
import type { CreateCatalogFoodPayload } from "@/src/types/menuItem";

import FoodImageUploadGrid from "./FoodImageUploadGrid";

interface FormState {
  canonicalName: string;
  localName: string;
  description: string;
  categoryUuid: string;
  cuisineUuid: string;
  defaultSpiceLevel: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  isActive: boolean;
  dietaryTypes: string;
  seasons: string;
  events: string;
  suitableWeather: string;
  mealTypes: string;
  ageRules: string;
}

const EMPTY_FORM: FormState = {
  canonicalName: "",
  localName: "",
  description: "",
  categoryUuid: "",
  cuisineUuid: "",
  defaultSpiceLevel: "0",
  calories: "0",
  proteinGrams: "0",
  carbsGrams: "0",
  fatGrams: "0",
  isActive: true,
  dietaryTypes: "[]",
  seasons: "[]",
  events: "[]",
  suitableWeather: "[]",
  mealTypes: "[]",
  ageRules: "[]",
};

function parseJsonArray(value: string, label: string): Array<Record<string, unknown>> {
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error(`${label} ត្រូវតែជា JSON ត្រឹមត្រូវ។`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`${label} ត្រូវតែជា JSON array []។`);
  }

  return parsed as Array<Record<string, unknown>>;
}

export default function CreateCanonicalFoodModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [mediaUuids, setMediaUuids] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: categoryData, isLoading: categoriesLoading } =
    useGetFoodCategoriesQuery({ page: 0, size: 200 });
  const { data: cuisineData, isLoading: cuisinesLoading } = useGetCuisinesQuery({
    page: 0,
    size: 200,
  });
  const [createFood, { isLoading: saving }] = useCreateFoodMutation();

  const categories = useMemo(
    () =>
      (categoryData?.contents ?? []).filter((category) => {
        const active = category.isActive ?? category.active ?? true;
        const isRootFood = category.code === "FOOD" && !category.parentCategoryUuid;
        return active && !isRootFood;
      }),
    [categoryData?.contents],
  );

  const cuisines = useMemo(
    () =>
      (cuisineData?.contents ?? []).filter(
        (cuisine) => cuisine.isActive ?? cuisine.active ?? true,
      ),
    [cuisineData?.contents],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(EMPTY_FORM);
    setMediaUuids([]);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!form.categoryUuid && categories[0]?.uuid) {
      setForm((current) => ({ ...current, categoryUuid: categories[0].uuid }));
    }
  }, [categories, form.categoryUuid]);

  useEffect(() => {
    if (!form.cuisineUuid && cuisines[0]?.uuid) {
      setForm((current) => ({ ...current, cuisineUuid: cuisines[0].uuid }));
    }
  }, [cuisines, form.cuisineUuid]);

  if (!open) {
    return null;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    try {
      setError(null);

      if (!form.canonicalName.trim()) {
        throw new Error("សូមបញ្ចូល Canonical name។");
      }

      if (!form.categoryUuid) {
        throw new Error("សូមជ្រើស Food category។");
      }

      if (!form.cuisineUuid) {
        throw new Error("សូមជ្រើស Cuisine។");
      }

      const payload: CreateCatalogFoodPayload = {
        canonicalName: form.canonicalName.trim(),
        localName: form.localName.trim() || null,
        description: form.description.trim() || null,
        categoryUuid: form.categoryUuid,
        cuisineUuid: form.cuisineUuid,
        primaryMediaUuids: mediaUuids,
        defaultSpiceLevel: Number(form.defaultSpiceLevel || 0),
        nutritionData: {
          calories: Number(form.calories || 0),
          proteinGrams: Number(form.proteinGrams || 0),
          carbsGrams: Number(form.carbsGrams || 0),
          fatGrams: Number(form.fatGrams || 0),
        },
        dietaryTypes: parseJsonArray(form.dietaryTypes, "Dietary Types"),
        seasons: parseJsonArray(form.seasons, "Seasons"),
        events: parseJsonArray(form.events, "Events"),
        suitableWeather: parseJsonArray(form.suitableWeather, "Suitable Weather"),
        mealTypes: parseJsonArray(form.mealTypes, "Meal Types"),
        ageRules: parseJsonArray(form.ageRules, "Age Rules"),
        isActive: form.isActive,
      };

      await createFood({ body: payload }).unwrap();
      await onCreated();
      onClose();
    } catch (requestError) {
      setError(getMenuItemApiErrorMessage(requestError));
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-[#f8faf9] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#F97316]">
              Food Catalog
            </p>
            <h2 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
              បង្កើត Food សម្រាប់ Store ជ្រើសយក
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">ព័ត៌មាន Food</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Canonical name *">
                <input
                  value={form.canonicalName}
                  onChange={(event) => set("canonicalName", event.target.value)}
                  placeholder="Kuy Teav"
                  className="field-input"
                />
              </Field>

              <Field label="ឈ្មោះខ្មែរ">
                <input
                  value={form.localName}
                  onChange={(event) => set("localName", event.target.value)}
                  placeholder="គុយទាវ"
                  className="field-input"
                />
              </Field>

              <Field label="Food category *">
                <select
                  value={form.categoryUuid}
                  onChange={(event) => set("categoryUuid", event.target.value)}
                  disabled={categoriesLoading}
                  className="field-input"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.uuid} value={category.uuid}>
                      {category.name} ({category.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Cuisine *">
                <select
                  value={form.cuisineUuid}
                  onChange={(event) => set("cuisineUuid", event.target.value)}
                  disabled={cuisinesLoading}
                  className="field-input"
                >
                  <option value="">Select cuisine</option>
                  {cuisines.map((cuisine) => (
                    <option key={cuisine.uuid} value={cuisine.uuid}>
                      {cuisine.name} ({cuisine.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Spice level">
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={form.defaultSpiceLevel}
                  onChange={(event) => set("defaultSpiceLevel", event.target.value)}
                  className="field-input"
                />
              </Field>

              <label className="flex h-[74px] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 md:self-end">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => set("isActive", event.target.checked)}
                />
                <span className="font-bold text-gray-700">Active / អាចឱ្យ Store ជ្រើសបាន</span>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-gray-700">Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </label>
            </div>
          </section>

          <FoodImageUploadGrid values={mediaUuids} onChange={setMediaUuids} />

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Nutrition</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <NumberField label="Calories" value={form.calories} onChange={(value) => set("calories", value)} />
              <NumberField label="Protein (g)" value={form.proteinGrams} onChange={(value) => set("proteinGrams", value)} />
              <NumberField label="Carbs (g)" value={form.carbsGrams} onChange={(value) => set("carbsGrams", value)} />
              <NumberField label="Fat (g)" value={form.fatGrams} onChange={(value) => set("fatGrams", value)} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Advanced API fields</h3>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                API របស់អ្នកទទួល arrays ទាំងនេះ។ ទុកជា [] ប្រសិនបើមិនទាន់ចង់បញ្ចូល។
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <JsonField label="Dietary Types" value={form.dietaryTypes} onChange={(value) => set("dietaryTypes", value)} />
              <JsonField label="Seasons" value={form.seasons} onChange={(value) => set("seasons", value)} />
              <JsonField label="Events" value={form.events} onChange={(value) => set("events", value)} />
              <JsonField label="Suitable Weather" value={form.suitableWeather} onChange={(value) => set("suitableWeather", value)} />
              <JsonField label="Meal Types" value={form.mealTypes} onChange={(value) => set("mealTypes", value)} />
              <JsonField label="Age Rules" value={form.ageRules} onChange={(value) => set("ageRules", value)} />
            </div>
          </section>

          {error && (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-6 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving || categoriesLoading || cuisinesLoading}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#137A3D] px-6 font-bold text-white hover:bg-[#0f6333] disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              រក្សាទុកក្នុង Food Catalog
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .field-input {
          height: 48px;
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgb(229 231 235);
          background: rgb(249 250 251);
          padding: 0 14px;
          outline: none;
        }
        .field-input:focus {
          border-color: rgb(16 185 129);
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-emerald-500 focus:bg-white"
      />
    </Field>
  );
}

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-[#F97316]">{label}</span>
      <textarea
        rows={5}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-slate-950 p-3 font-mono text-xs leading-5 text-emerald-200 outline-none focus:border-emerald-500"
      />
    </label>
  );
}
