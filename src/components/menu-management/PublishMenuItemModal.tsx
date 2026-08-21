"use client";

import {
  Check,
  ChevronDown,
  Heart,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import ImagePicker from "./ImagePicker";

import type { Allergen } from "@/src/types/allergen";
import type { DietaryType } from "@/src/types/dietaryType";
import type {
  FoodRecord,
  IngredientOption,
  MenuItemAllergenDeclarationPayload,
  MenuItemDietaryTypePayload,
  MenuItemIngredientPayload,
  MenuItemRecord,
  MenuItemWritePayload,
  StoreOption,
} from "@/src/types/menu-management";
import { handleFormArrowKeyNavigation } from "@/src/lib/formKeyboardNavigation";

type IngredientRow = {
  ingredientUuid: string;
  quantity: string;
  unit: string;
  isOptional: boolean;
  notes: string;
};

type DietaryTypeRow = {
  dietaryTypeUuid: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | string;
  notes: string;
};

type AllergenRow = {
  allergenUuid: string;
  declarationType: "CONTAINS" | "MAY_CONTAIN" | string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | string;
  notes: string;
};

type FormState = {
  storeUuid: string;
  foodUuid: string;
  name: string;
  description: string;
  price: string;
  currencyCode: string;
  preparationTimeMinutes: string;
  availabilityStatus: string;
  ingredientDataStatus: string;
  isFeatured: boolean;
  source: string;
};

const EMPTY: FormState = {
  storeUuid: "",
  foodUuid: "",
  name: "",
  description: "",
  price: "",
  currencyCode: "USD",
  preparationTimeMinutes: "",
  availabilityStatus: "AVAILABLE",
  ingredientDataStatus: "COMPLETE",
  isFeatured: false,
  source: "MANUAL",
};

function storeLabel(store: StoreOption): string {
  return store.storeName || store.name || store.localName || store.uuid;
}

function foodLabel(food: FoodRecord): string {
  const local = food.localName?.trim();
  const canonical = food.canonicalName?.trim();
  if (local && canonical && local !== canonical) {
    return `${local} (${canonical})`;
  }
  return local || canonical || food.uuid;
}

export default function PublishMenuItemModal({
  open,
  item,
  foods,
  stores,
  ingredients,
  dietaryTypes = [],
  allergens = [],
  defaultStoreUuid,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: MenuItemRecord | null;
  foods: FoodRecord[];
  stores: StoreOption[];
  ingredients: IngredientOption[];
  dietaryTypes?: DietaryType[];
  allergens?: Allergen[];
  defaultStoreUuid?: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    storeUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([]);
  const [dietaryTypeRows, setDietaryTypeRows] = useState<DietaryTypeRow[]>([]);
  const [allergenRows, setAllergenRows] = useState<AllergenRow[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues({
        ...EMPTY,
        storeUuid: defaultStoreUuid || "",
      });
      setIngredientRows([]);
      setDietaryTypeRows([]);
      setAllergenRows([]);
      setImages([]);
      setExistingImages([]);
      setError(null);
      return;
    }

    const list = item.images?.length
      ? item.images
      : item.gallery?.length
        ? item.gallery
        : item.primaryMediaUrls?.length
          ? item.primaryMediaUrls
          : item.primaryMediaUuids?.length
            ? item.primaryMediaUuids
            : [(item as any).primaryMediaUuid || item.thumbnail || item.imageUrl].filter(Boolean);
    setExistingImages(list as string[]);


    const matchedStoreUuid =
      item.storeUuid ||
      item.store?.uuid ||
      stores.find(
        (s) =>
          (item.store?.name &&
            (s.name === item.store.name ||
              s.storeName === item.store.name ||
              s.localName === item.store.name)) ||
          (item.store?.storeName &&
            (s.name === item.store.storeName ||
              s.storeName === item.store.storeName)),
      )?.uuid ||
      "";

    const matchedFoodUuid =
      item.foodUuid ||
      item.food?.uuid ||
      foods.find(
        (f) =>
          (item.food?.canonicalName &&
            f.canonicalName?.toLowerCase() ===
            item.food.canonicalName?.toLowerCase()) ||
          (item.food?.localName && f.localName === item.food.localName),
      )?.uuid ||
      "";

    setValues({
      storeUuid: matchedStoreUuid,
      foodUuid: matchedFoodUuid,
      name: item.name || "",
      description: item.description || "",
      price: item.price != null ? String(item.price) : "",
      currencyCode: item.currencyCode || "USD",
      preparationTimeMinutes:
        item.preparationTimeMinutes != null
          ? String(item.preparationTimeMinutes)
          : "",
      availabilityStatus: item.availabilityStatus || "AVAILABLE",
      ingredientDataStatus: item.ingredientDataStatus || "COMPLETE",
      isFeatured: Boolean(item.isFeatured),
      source: item.source || "MANUAL",
    });

    setIngredientRows(
      (item.ingredients ?? []).map((raw: any) => {
        if (typeof raw === "string") {
          const found = ingredients.find(
            (i) => i.name === raw || i.code === raw || i.uuid === raw,
          );
          return {
            ingredientUuid: found?.uuid || raw,
            quantity: "",
            unit: "",
            isOptional: false,
            notes: "",
          };
        }
        const found = ingredients.find(
          (i) =>
            i.uuid === raw.ingredientUuid ||
            i.uuid === raw.uuid ||
            (raw.name && i.name === raw.name) ||
            (raw.code && i.code === raw.code),
        );
        return {
          ingredientUuid: found?.uuid || raw.ingredientUuid || raw.uuid || "",
          quantity: raw.quantity != null ? String(raw.quantity) : "",
          unit: raw.unit || "",
          isOptional: Boolean(raw.isOptional),
          notes: raw.notes || "",
        };
      }),
    );

    setDietaryTypeRows(
      (item.dietaryTypes ?? item.food?.dietaryTypes ?? [])
        .map((raw: any) => {
          const found = dietaryTypes.find(
            (d) =>
              d.uuid === raw.dietaryTypeUuid ||
              d.uuid === raw.uuid ||
              (raw.code && d.code === raw.code) ||
              (raw.name && d.name === raw.name),
          );
          return {
            dietaryTypeUuid:
              found?.uuid || raw.dietaryTypeUuid || raw.uuid || "",
            verificationStatus: raw.verificationStatus || "UNVERIFIED",
            notes: raw.notes || "",
          };
        })
        .filter((d) => Boolean(d.dietaryTypeUuid)),
    );

    setAllergenRows(
      (item.allergenDeclarations ?? [])
        .map((raw: any) => {
          const found = allergens.find(
            (a) =>
              a.uuid === raw.allergenUuid ||
              a.uuid === raw.uuid ||
              (raw.code && a.code === raw.code) ||
              (raw.name && a.name === raw.name),
          );
          return {
            allergenUuid: found?.uuid || raw.allergenUuid || raw.uuid || "",
            declarationType: raw.declarationType || "MAY_CONTAIN",
            riskLevel: raw.riskLevel || "MEDIUM",
            verificationStatus: raw.verificationStatus || "UNVERIFIED",
            notes: raw.notes || "",
          };
        })
        .filter((a) => Boolean(a.allergenUuid)),
    );

    setImages([]);
    setError(null);
  }, [item, open, stores, foods, ingredients, dietaryTypes, allergens]);

  const activeFoods = useMemo(
    () => foods.filter((food) => food.isActive !== false),
    [foods],
  );

  const activeIngredients = useMemo(
    () => ingredients.filter((ingredient) => ingredient.isActive !== false),
    [ingredients],
  );

  const activeDietaryTypes = useMemo(
    () => dietaryTypes.filter((dt) => dt.active !== false),
    [dietaryTypes],
  );

  const activeAllergens = useMemo(
    () => allergens.filter((al) => al.active !== false),
    [allergens],
  );

  const handleFoodSelect = (selectedUuid: string) => {
    const selectedFood = foods.find((f) => f.uuid === selectedUuid);
    setValues((current) => {
      const isAutoName =
        !current.name ||
        (selectedFood &&
          foods.some(
            (f) =>
              f.canonicalName === current.name || f.localName === current.name,
          ));
      const isAutoDesc =
        !current.description ||
        (selectedFood &&
          foods.some((f) => f.description === current.description));

      return {
        ...current,
        foodUuid: selectedUuid,
        name:
          isAutoName && selectedFood
            ? selectedFood.localName || selectedFood.canonicalName
            : current.name,
        description:
          isAutoDesc && selectedFood?.description
            ? selectedFood.description
            : current.description,
      };
    });
  };

  const updateIngredientRow = (
    index: number,
    changes: Partial<IngredientRow>,
  ) => {
    setIngredientRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...changes } : row,
      ),
    );
  };

  const updateDietaryTypeRow = (
    index: number,
    changes: Partial<DietaryTypeRow>,
  ) => {
    setDietaryTypeRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...changes } : row,
      ),
    );
  };

  const updateAllergenRow = (index: number, changes: Partial<AllergenRow>) => {
    setAllergenRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...changes } : row,
      ),
    );
  };

  const submit = async () => {
    try {
      setError(null);

      if (!item && !values.storeUuid) {
        throw new Error("សូមជ្រើសរើស Store (Store is required).");
      }

      if (!values.foodUuid) {
        throw new Error("សូមជ្រើសរើស Food Catalog (Food is required).");
      }

      if (!values.name.trim()) {
        throw new Error("សូមបញ្ចូលឈ្មោះ Menu Item (Name is required).");
      }

      const price = Number(values.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("សូមបញ្ចូលតម្លៃត្រឹមត្រូវ (Valid price is required).");
      }

      const ingredientPayload: MenuItemIngredientPayload[] = ingredientRows
        .filter((row) => row.ingredientUuid)
        .map((row) => ({
          ingredientUuid: row.ingredientUuid,
          quantity: row.quantity.trim() ? Number(row.quantity) : null,
          unit: row.unit.trim() || null,
          isOptional: Boolean(row.isOptional),
          notes: row.notes.trim() || null,
        }));

      const dietaryTypePayload: MenuItemDietaryTypePayload[] = dietaryTypeRows
        .filter((row) => row.dietaryTypeUuid)
        .map((row) => ({
          dietaryTypeUuid: row.dietaryTypeUuid,
          verificationStatus: row.verificationStatus || "UNVERIFIED",
          notes: row.notes.trim() || null,
        }));

      const allergenPayload: MenuItemAllergenDeclarationPayload[] = allergenRows
        .filter((row) => row.allergenUuid)
        .map((row) => ({
          allergenUuid: row.allergenUuid,
          declarationType: row.declarationType || "MAY_CONTAIN",
          riskLevel: row.riskLevel || "MEDIUM",
          verificationStatus: row.verificationStatus || "UNVERIFIED",
          notes: row.notes.trim() || null,
        }));

      const payload: MenuItemWritePayload = {
        foodUuid: values.foodUuid,
        menuItem: {
          name: values.name.trim(),
          description: values.description.trim() || null,
          price,
          currencyCode: values.currencyCode.trim() || "USD",
          preparationTimeMinutes: values.preparationTimeMinutes.trim()
            ? Number(values.preparationTimeMinutes)
            : null,
          availabilityStatus: values.availabilityStatus,
          ingredientDataStatus: values.ingredientDataStatus,
          isFeatured: values.isFeatured,
          source: values.source || "MANUAL",
        },
        primaryMediaUuids: item?.primaryMediaUuids ?? [],
        thumbnailMediaUuid: item?.thumbnailMediaUuid ?? null,
        galleryMediaUuids: item?.galleryMediaUuids ?? [],
        ingredients: ingredientPayload,
        dietaryTypes: dietaryTypePayload,
        allergenDeclarations: allergenPayload,
      };

      await onSubmit(values.storeUuid, payload, images);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save Menu Item.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
      <div
        onKeyDown={handleFormArrowKeyNavigation}
        className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* =================================================
            STICKY HEADER
        ================================================== */}
        <div className="sticky top-0 z-50 flex items-start justify-between gap-4 border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Utensils size={23} />
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-semibold text-primary-800">
                {item
                  ? "កែប្រែ Menu Item (Edit Menu Item)"
                  : "Publish Menu Item ទៅ វែបសាយ"}
              </p>

              <p className="mt-2 max-w-3xl text-lg leading-8 text-gray-500">
                ជ្រើស Store + Food Catalog រួចកំណត់តម្លៃ សុវត្ថិភាពម្ហូប
                និងរូបភាពដើម្បីផ្សាយលើ វែបសាយ។
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {/* =================================================
              MAIN INFORMATION
          ================================================== */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
            <div className="mb-6">
              <p className="text-3xl font-semibold text-primary-800">
                ព័ត៌មាន Menu Item
              </p>
              <p className="mt-2 text-lg leading-8 text-gray-500">
                កំណត់ព័ត៌មានសំខាន់ៗដែលនឹងបង្ហាញនៅលើ វែបសាយ។
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <Label>Store (ហាង) *</Label>
                <FormSelect
                  disabled={Boolean(item)}
                  value={values.storeUuid}
                  placeholder="ជ្រើសរើស Store"
                  options={stores.map((store) => ({
                    value: store.uuid,
                    label: storeLabel(store),
                  }))}
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      storeUuid: value,
                    }))
                  }
                />
              </label>

              <label>
                <Label>Food Catalog (មុខម្ហូបមេ) *</Label>
                <FormSelect
                  value={values.foodUuid}
                  placeholder="ជ្រើសរើស Food Catalog"
                  options={activeFoods.map((food) => ({
                    value: food.uuid,
                    label: foodLabel(food),
                  }))}
                  onChange={handleFoodSelect}
                />
              </label>

              <Field
                label="ឈ្មោះ Menu Item (ឈ្មោះវែបសាយ) *"
                value={values.name}
                placeholder="ឧទាហរណ៍៖ សម្លកកូរពិសេស ឬ Phnom Penh Noodle Soup"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    name: value,
                  }))
                }
              />

              <Field
                label="តម្លៃ (Price) *"
                type="number"
                value={values.price}
                placeholder="3.50"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    price: value,
                  }))
                }
              />

              <Field
                label="រូបិយប័ណ្ណ (Currency)"
                value={values.currencyCode}
                placeholder="USD"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    currencyCode: value,
                  }))
                }
              />

              <Field
                label="រយៈពេលធ្វើ (Preparation minutes)"
                type="number"
                value={values.preparationTimeMinutes}
                placeholder="10"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    preparationTimeMinutes: value,
                  }))
                }
              />

              <label>
                <Label>ស្ថានភាព (Availability)</Label>
                <FormSelect
                  value={values.availabilityStatus}
                  options={[
                    { value: "AVAILABLE", label: "មានលក់" },
                    { value: "UNAVAILABLE", label: "មិនមានលក់" },
                    { value: "SOLD_OUT", label: "អស់ស្តុក" },
                    { value: "HIDDEN", label: "លាក់ទុក" },
                  ]}
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      availabilityStatus: value,
                    }))
                  }
                />
              </label>

              <label>
                <Label>ទិន្នន័យគ្រឿងផ្សំ (Ingredient Data Status)</Label>
                <FormSelect
                  value={values.ingredientDataStatus}
                  options={[
                    { value: "COMPLETE", label: "COMPLETE (ពេញលេញ)" },
                    { value: "VERIFIED", label: "VERIFIED (បានផ្ទៀងផ្ទាត់)" },
                    { value: "PARTIAL", label: "PARTIAL (ផ្នែកខ្លះ)" },
                    { value: "UNKNOWN", label: "UNKNOWN (មិនច្បាស់)" },
                  ]}
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      ingredientDataStatus: value,
                    }))
                  }
                />
              </label>

              <label className="md:col-span-2">
                <Label>ការពិពណ៌នា (Description)</Label>
                <textarea
                  rows={4}
                  value={values.description}
                  placeholder="ការពិពណ៌នាអំពីមុខម្ហូបនេះសម្រាប់អតិថិជន..."
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={`${inputClass} h-auto resize-none py-3.5 leading-8`}
                />
              </label>

              <label className="flex items-start gap-4 rounded-2xl border border-secondary-100 bg-secondary-50/60 p-5 md:col-span-2">
                <input
                  type="checkbox"
                  checked={values.isFeatured}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      isFeatured: event.target.checked,
                    }))
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-secondary-500"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-secondary-700">
                    <Sparkles size={20} className="shrink-0" />
                    <p className="text-lg font-semibold">
                      Featured (បង្ហាញជាមុខម្ហូបលេចធ្លោលើ វែបសាយ)
                    </p>
                  </div>

                  <p className="mt-1 text-lg leading-7 text-gray-600">
                    បើកដើម្បីបង្ហាញនៅទំព័រមុខ និង Highlighted Sections។
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* =================================================
              INGREDIENTS
          ================================================== */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                  <Sparkles size={21} />
                </div>

                <div>
                  <p className="text-3xl font-semibold text-primary-800">
                    គ្រឿងផ្សំ (Ingredients Recipe)
                  </p>
                  <p className="mt-2 text-lg leading-7 text-gray-500">
                    កំណត់គ្រឿងផ្សំ បរិមាណ និងខ្នាតសម្រាប់មុខម្ហូបនេះ។
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIngredientRows((current) => [
                    ...current,
                    {
                      ingredientUuid: "",
                      quantity: "",
                      unit: "g",
                      isOptional: false,
                      notes: "",
                    },
                  ])
                }
                className={secondaryActionClass}
              >
                <Plus size={20} />
                បន្ថែមគ្រឿងផ្សំ
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {ingredientRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 xl:grid-cols-[2fr_1fr_1fr_auto_52px] xl:items-center"
                >
                  <FormSelect
                    value={row.ingredientUuid}
                    placeholder="ជ្រើស Ingredient"
                    options={activeIngredients.map((ingredient) => ({
                      value: ingredient.uuid,
                      label: `${ingredient.name} (${ingredient.code})`,
                    }))}
                    onChange={(value) =>
                      updateIngredientRow(index, {
                        ingredientUuid: value,
                      })
                    }
                  />

                  <input
                    type="number"
                    placeholder="បរិមាណ (Qty)"
                    value={row.quantity}
                    onChange={(event) =>
                      updateIngredientRow(index, {
                        quantity: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <input
                    placeholder="ខ្នាត (g, ml)"
                    value={row.unit}
                    onChange={(event) =>
                      updateIngredientRow(index, {
                        unit: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <label className="flex min-h-[52px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.isOptional}
                      onChange={(event) =>
                        updateIngredientRow(index, {
                          isOptional: event.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded accent-primary-700"
                    />
                    Optional
                  </label>

                  <DeleteRowButton
                    onClick={() =>
                      setIngredientRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    label="លុប Ingredient"
                  />
                </div>
              ))}

              {!ingredientRows.length && (
                <EmptyRow text="មិនទាន់បានបន្ថែម Ingredient ទេ។" />
              )}
            </div>
          </section>

          {/* =================================================
              DIETARY TYPES
          ================================================== */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                  <Heart size={21} />
                </div>

                <div>
                  <p className="text-3xl font-semibold text-primary-800">
                    របបអាហារ (Dietary Types)
                  </p>
                  <p className="mt-2 text-lg leading-7 text-gray-500">
                    សម្គាល់របបអាហារ (Vegan, Halal, Keto, etc.)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDietaryTypeRows((current) => [
                    ...current,
                    {
                      dietaryTypeUuid: "",
                      verificationStatus: "UNVERIFIED",
                      notes: "",
                    },
                  ])
                }
                className={secondaryActionClass}
              >
                <Plus size={20} />
                បន្ថែម Dietary Type
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {dietaryTypeRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 xl:grid-cols-[2fr_1.35fr_2fr_52px] xl:items-center"
                >
                  <FormSelect
                    value={row.dietaryTypeUuid}
                    placeholder="ជ្រើស Dietary Type"
                    options={activeDietaryTypes.map((dietaryType) => ({
                      value: dietaryType.uuid,
                      label: `${dietaryType.name} (${dietaryType.code})`,
                    }))}
                    onChange={(value) =>
                      updateDietaryTypeRow(index, {
                        dietaryTypeUuid: value,
                      })
                    }
                  />

                  <FormSelect
                    value={row.verificationStatus}
                    options={[
                      { value: "UNVERIFIED", label: "UNVERIFIED" },
                      { value: "VERIFIED", label: "VERIFIED" },
                    ]}
                    onChange={(value) =>
                      updateDietaryTypeRow(index, {
                        verificationStatus: value,
                      })
                    }
                  />

                  <input
                    placeholder="កំណត់ចំណាំ (Notes)"
                    value={row.notes}
                    onChange={(event) =>
                      updateDietaryTypeRow(index, {
                        notes: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <DeleteRowButton
                    onClick={() =>
                      setDietaryTypeRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    label="លុប Dietary Type"
                  />
                </div>
              ))}

              {!dietaryTypeRows.length && (
                <EmptyRow text="មិនទាន់បានកំណត់ Dietary Type ទេ។" />
              )}
            </div>
          </section>

          {/* =================================================
              ALLERGENS
          ================================================== */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700">
                  <ShieldAlert size={21} />
                </div>

                <div>
                  <p className="text-3xl font-semibold text-primary-800">
                    ប្រតិកម្មអាឡែហ្ស៊ី (Allergen Declarations)
                  </p>
                  <p className="mt-2 text-lg leading-7 text-gray-500">
                    ប្រកាសសារធាតុបង្កអាឡែហ្ស៊ី
                    និងកម្រិតហានិភ័យសម្រាប់សុវត្ថិភាពអតិថិជន។
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAllergenRows((current) => [
                    ...current,
                    {
                      allergenUuid: "",
                      declarationType: "MAY_CONTAIN",
                      riskLevel: "MEDIUM",
                      verificationStatus: "UNVERIFIED",
                      notes: "",
                    },
                  ])
                }
                className={secondaryActionClass}
              >
                <Plus size={20} />
                បន្ថែម Allergen
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {allergenRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 2xl:grid-cols-[1.7fr_1.3fr_1fr_1.2fr_1.7fr_52px] 2xl:items-center"
                >
                  <FormSelect
                    value={row.allergenUuid}
                    placeholder="ជ្រើស Allergen"
                    options={activeAllergens.map((allergen) => ({
                      value: allergen.uuid,
                      label: `${allergen.name} (${allergen.code})`,
                    }))}
                    onChange={(value) =>
                      updateAllergenRow(index, {
                        allergenUuid: value,
                      })
                    }
                  />

                  <FormSelect
                    value={row.declarationType}
                    options={[
                      {
                        value: "MAY_CONTAIN",
                        label: "MAY_CONTAIN (អាចមាន)",
                      },
                      {
                        value: "CONTAINS",
                        label: "CONTAINS (មានផ្ទុក)",
                      },
                    ]}
                    onChange={(value) =>
                      updateAllergenRow(index, {
                        declarationType: value,
                      })
                    }
                  />

                  <FormSelect
                    value={row.riskLevel}
                    options={[
                      { value: "LOW", label: "LOW" },
                      { value: "MEDIUM", label: "MEDIUM" },
                      { value: "HIGH", label: "HIGH" },
                    ]}
                    onChange={(value) =>
                      updateAllergenRow(index, {
                        riskLevel: value,
                      })
                    }
                  />

                  <FormSelect
                    value={row.verificationStatus}
                    options={[
                      { value: "UNVERIFIED", label: "UNVERIFIED" },
                      { value: "VERIFIED", label: "VERIFIED" },
                    ]}
                    onChange={(value) =>
                      updateAllergenRow(index, {
                        verificationStatus: value,
                      })
                    }
                  />

                  <input
                    placeholder="កំណត់ចំណាំ (Notes)"
                    value={row.notes}
                    onChange={(event) =>
                      updateAllergenRow(index, {
                        notes: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <DeleteRowButton
                    onClick={() =>
                      setAllergenRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    label="លុប Allergen"
                  />
                </div>
              ))}

              {!allergenRows.length && (
                <EmptyRow text="មិនទាន់បានប្រកាស Allergen ទេ។" />
              )}
            </div>
          </section>

          {/* =================================================
              IMAGES
          ================================================== */}
          <ImagePicker
            value={images}
            onChange={setImages}
            existingImages={existingImages}
            onExistingChange={setExistingImages}
            label={
              item
                ? "រូបភាព (ទុកទទេ = រក្សារូបចាស់ | រូបទី ១: Thumbnail, រូបបន្ទាប់: Gallery)"
                : "រូបភាព Menu Item (អតិបរមា 4 | រូបទី ១: Thumbnail, រូបបន្ទាប់: Gallery)"
            }
          />

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              STICKY ACTIONS
          ================================================== */}
          <div className="sticky bottom-0 z-40 -mx-6 -mb-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50 sm:w-auto"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-semibold text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}

              {item ? "រក្សាទុក (Save Changes)" : "Publish ទៅ វែបសាយ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type FormSelectOption = {
  value: string;
  label: string;
};

function FormSelect({
  value,
  options,
  onChange,
  placeholder = "ជ្រើសរើស...",
  className = "",
  disabled = false,
}: {
  value: string;
  options: FormSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const updatePosition = () => {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();
    const availableBelow = window.innerHeight - rect.bottom;
    const availableAbove = rect.top;
    const shouldOpenUpward =
      availableBelow < 280 && availableAbove > availableBelow;

    setOpenUpward(shouldOpenUpward);
    setPosition({
      top: rect.bottom + 8,
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleViewportChange = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          updatePosition();
          setOpen((current) => !current);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex
          h-[52px]
          w-full
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          bg-gray-50
          px-4
          text-left
          text-lg
          outline-none
          transition
          hover:border-gray-300
          focus:ring-4
          focus:ring-primary-100
          disabled:cursor-not-allowed
          disabled:bg-gray-100
          disabled:text-gray-500
          ${open ? "border-primary-600 bg-white" : "border-gray-200"}
        `}
      >
        <span
          className={`min-w-0 flex-1 truncate ${selectedOption ? "text-gray-800" : "text-gray-400"
            }`}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={21}
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180 text-primary-700" : ""
            }`}
        />
      </button>

      {open &&
        !disabled &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              left: position.left,
              width: position.width,
              ...(openUpward
                ? { bottom: position.bottom }
                : { top: position.top }),
            }}
            className="fixed z-[300] max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,0.16)] [scrollbar-width:thin]"
          >
            {options.length === 0 ? (
              <div className="px-4 py-4 text-lg text-gray-500">
                មិនមានជម្រើស
              </div>
            ) : (
              options.map((option) => {
                const selected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      buttonRef.current?.focus();
                    }}
                    className={`
                      flex
                      min-h-[48px]
                      w-full
                      items-center
                      justify-between
                      gap-3
                      rounded-xl
                      px-4
                      py-2.5
                      text-left
                      text-lg
                      transition
                      ${selected
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="min-w-0 flex-1 break-words">
                      {option.label}
                    </span>

                    {selected && (
                      <Check size={20} className="shrink-0 text-primary-700" />
                    )}
                  </button>
                );
              })
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

const inputClass =
  "h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100";

const secondaryActionClass =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-lg font-medium text-primary-800">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function DeleteRowButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 xl:w-[52px]"
      aria-label={label}
      title={label}
    >
      <Trash2 size={20} />
    </button>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-6 text-center">
      <p className="text-lg leading-7 text-gray-500">{text}</p>
    </div>
  );
}
