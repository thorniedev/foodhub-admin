"use client";

import { Loader2, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";

import type {
  CuisineOption,
  FoodCategoryOption,
  FoodRecord,
  FoodWritePayload,
} from "@/src/types/menu-management";

type FormState = {
  canonicalName: string;
  localName: string;
  description: string;
  categoryUuid: string;
  cuisineUuid: string;
  defaultSpiceLevel: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  canonicalName: "",
  localName: "",
  description: "",
  categoryUuid: "",
  cuisineUuid: "",
  defaultSpiceLevel: "0",
  calories: "",
  protein: "",
  carbohydrate: "",
  fat: "",
  isActive: true,
};

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export default function FoodFormModal({
  open,
  item,
  categories,
  cuisines,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: FoodRecord | null;
  categories: FoodCategoryOption[];
  cuisines: CuisineOption[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    payload: FoodWritePayload,
    images: File[],
  ) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setImages([]);
      setError(null);
      return;
    }

    setValues({
      canonicalName: item.canonicalName ?? "",
      localName: item.localName ?? "",
      description: item.description ?? "",
      categoryUuid:
        item.categoryUuid ??
        item.category?.uuid ??
        "",
      cuisineUuid:
        item.cuisineUuid ??
        item.cuisine?.uuid ??
        "",
      defaultSpiceLevel: String(
        item.defaultSpiceLevel ?? 0,
      ),
      calories:
        item.nutritionData?.calories != null
          ? String(item.nutritionData.calories)
          : "",
      protein:
        item.nutritionData?.protein != null
          ? String(item.nutritionData.protein)
          : item.nutritionData?.proteinGrams != null
            ? String(item.nutritionData.proteinGrams)
            : "",
      carbohydrate:
        item.nutritionData?.carbohydrate != null
          ? String(item.nutritionData.carbohydrate)
          : item.nutritionData?.carbsGrams != null
            ? String(item.nutritionData.carbsGrams)
            : "",
      fat:
        item.nutritionData?.fat != null
          ? String(item.nutritionData.fat)
          : item.nutritionData?.fatGrams != null
            ? String(item.nutritionData.fatGrams)
            : "",
      isActive: item.isActive !== false,
    });

    setImages([]);
    setError(null);
  }, [item, open]);

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.isActive !== false,
      ),
    [categories],
  );

  const submit = async () => {
    try {
      setError(null);

      if (!values.canonicalName.trim()) {
        throw new Error("Canonical name is required.");
      }

      if (!values.categoryUuid) {
        throw new Error("Category is required.");
      }

      const payload: FoodWritePayload = {
        canonicalName: values.canonicalName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        categoryUuid: values.categoryUuid,
        cuisineUuid: values.cuisineUuid || null,
        primaryMediaUuids: [],
        defaultSpiceLevel: numberOrNull(
          values.defaultSpiceLevel,
        ),
        nutritionData: {
          calories: numberOrNull(values.calories),
          protein: numberOrNull(values.protein),
          carbohydrate: numberOrNull(values.carbohydrate),
          fat: numberOrNull(values.fat),
        },
        mealTypes: item?.mealTypes ?? [],
        ageRules: item?.ageRules ?? [],
        dietaryTypes: item?.dietaryTypes ?? [],
        seasons: item?.seasons ?? [],
        events: item?.events ?? [],
        suitableWeather: item?.suitableWeather ?? [],
        isActive: values.isActive,
      };

      await onSubmit(payload, images);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save Food.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-6 w-full max-w-4xl rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {item
                ? "កែប្រែ Food Catalog"
                : "បន្ថែម Food Catalog"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Food នេះអាចឱ្យ Store ជ្រើសយកទៅបង្កើត Menu Item។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Canonical name *"
              value={values.canonicalName}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  canonicalName: value,
                }))
              }
            />

            <Field
              label="ឈ្មោះខ្មែរ"
              value={values.localName}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  localName: value,
                }))
              }
            />

            <label>
              <Label>Category *</Label>
              <select
                value={values.categoryUuid}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    categoryUuid: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">ជ្រើស Category</option>
                {activeCategories.map((category) => (
                  <option
                    key={category.uuid}
                    value={category.uuid}
                  >
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label>Cuisine</Label>
              <select
                value={values.cuisineUuid}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    cuisineUuid: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">ជ្រើស Cuisine</option>
                {cuisines
                  .filter(
                    (cuisine) =>
                      cuisine.isActive !== false,
                  )
                  .map((cuisine) => (
                    <option
                      key={cuisine.uuid}
                      value={cuisine.uuid}
                    >
                      {cuisine.name}
                    </option>
                  ))}
              </select>
            </label>

            <Field
              label="Spice level"
              type="number"
              value={values.defaultSpiceLevel}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  defaultSpiceLevel: value,
                }))
              }
            />

            <label className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#137A3D]"
              />
              <span className="font-bold text-gray-700">
                Active
              </span>
            </label>

            <label className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                rows={4}
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={`${inputClass} h-auto py-3`}
              />
            </label>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-black text-gray-900">
              Nutrition
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["calories", "Calories"],
                ["protein", "Protein"],
                ["carbohydrate", "Carbohydrate"],
                ["fat", "Fat"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  type="number"
                  value={
                    values[
                      key as keyof Pick<
                        FormState,
                        | "calories"
                        | "protein"
                        | "carbohydrate"
                        | "fat"
                      >
                    ]
                  }
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              ))}
            </div>
          </div>

          <ImagePicker
            value={images}
            onChange={setImages}
            label={
              item
                ? "រូបភាពថ្មី (ទុកទទេ = រក្សារូបចាស់)"
                : "រូបភាព Food (អតិបរមា 4)"
            }
          />

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-[#137A3D] focus:ring-4 focus:ring-emerald-50";

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-2 block text-sm font-bold text-gray-800">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </label>
  );
}
