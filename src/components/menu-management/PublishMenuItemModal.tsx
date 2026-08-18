"use client";

import { Loader2, Plus, Save, Trash2, Utensils, X, ShieldAlert, Sparkles, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  return (
    store.storeName ||
    store.name ||
    store.localName ||
    store.uuid
  );
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
      setValues(EMPTY);
      setIngredientRows([]);
      setDietaryTypeRows([]);
      setAllergenRows([]);
      setImages([]);
      setExistingImages([]);
      setError(null);
      return;
    }

    const list = item.primaryMediaUrls?.length
      ? item.primaryMediaUrls
      : item.primaryMediaUuids?.length
      ? item.primaryMediaUuids
      : item.primaryMediaUuid
      ? [item.primaryMediaUuid]
      : item.images?.length
      ? item.images
      : item.gallery?.length
      ? item.gallery
      : item.galleryMediaUuids?.length
      ? item.galleryMediaUuids
      : [item.thumbnail || item.imageUrl || item.thumbnailMediaUuid].filter(Boolean);
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
      price:
        item.price != null
          ? String(item.price)
          : "",
      currencyCode: item.currencyCode || "USD",
      preparationTimeMinutes:
        item.preparationTimeMinutes != null
          ? String(item.preparationTimeMinutes)
          : "",
      availabilityStatus:
        item.availabilityStatus || "AVAILABLE",
      ingredientDataStatus:
        item.ingredientDataStatus || "COMPLETE",
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
          ingredientUuid:
            found?.uuid || raw.ingredientUuid || raw.uuid || "",
          quantity:
            raw.quantity != null ? String(raw.quantity) : "",
          unit: raw.unit || "",
          isOptional: Boolean(raw.isOptional),
          notes: raw.notes || "",
        };
      }),
    );

    setDietaryTypeRows(
      (item.dietaryTypes ?? item.food?.dietaryTypes ?? []).map((raw: any) => {
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
      }).filter((d) => Boolean(d.dietaryTypeUuid)),
    );

    setAllergenRows(
      (item.allergenDeclarations ?? []).map((raw: any) => {
        const found = allergens.find(
          (a) =>
            a.uuid === raw.allergenUuid ||
            a.uuid === raw.uuid ||
            (raw.code && a.code === raw.code) ||
            (raw.name && a.name === raw.name),
        );
        return {
          allergenUuid:
            found?.uuid || raw.allergenUuid || raw.uuid || "",
          declarationType: raw.declarationType || "MAY_CONTAIN",
          riskLevel: raw.riskLevel || "MEDIUM",
          verificationStatus: raw.verificationStatus || "UNVERIFIED",
          notes: raw.notes || "",
        };
      }).filter((a) => Boolean(a.allergenUuid)),
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
      const isAutoName = !current.name || (selectedFood && foods.some((f) => f.canonicalName === current.name || f.localName === current.name));
      const isAutoDesc = !current.description || (selectedFood && foods.some((f) => f.description === current.description));

      return {
        ...current,
        foodUuid: selectedUuid,
        name: isAutoName && selectedFood ? (selectedFood.localName || selectedFood.canonicalName) : current.name,
        description: isAutoDesc && selectedFood?.description ? selectedFood.description : current.description,
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

  const updateAllergenRow = (
    index: number,
    changes: Partial<AllergenRow>,
  ) => {
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

      await onSubmit(
        values.storeUuid,
        payload,
        images,
      );
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
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-5xl rounded-[30px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#137A3D]/10 text-[#137A3D]">
              <Utensils size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {item
                  ? "កែប្រែ Menu Item"
                  : "Publish Menu Item ទៅ Website"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                ជ្រើស Store និង Food Catalog រួចកំណត់តម្លៃ សុវត្ថិភាពម្ហូប និងរូបភាពដើម្បីផ្សាយលើ Website
              </p>
            </div>
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
          {/* Main Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <Label>ហាង *</Label>
              <select
                disabled={Boolean(item)}
                value={values.storeUuid}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    storeUuid: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">ជ្រើសរើសហាង</option>
                {stores.map((store) => (
                  <option key={store.uuid} value={store.uuid}>
                    {storeLabel(store)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label>មុខម្ហូបមេ *</Label>
              <select
                value={values.foodUuid}
                onChange={(event) => handleFoodSelect(event.target.value)}
                className={inputClass}
              >
                <option value="">ជ្រើសរើសមុខម្ហូបមេ</option>
                {activeFoods.map((food) => (
                  <option key={food.uuid} value={food.uuid}>
                    {foodLabel(food)}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="ឈ្មោះ Menu Item *"
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
              label="តម្លៃ *"
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
              label="រូបិយប័ណ្ណ"
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
              label="រយៈពេលធ្វើ (នាទី)"
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
              <Label>ស្ថានភាព</Label>
              <select
                value={values.availabilityStatus}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    availabilityStatus: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="AVAILABLE">មានលក់</option>
                <option value="UNAVAILABLE">មិនមានលក់</option>
                <option value="SOLD_OUT">អស់ស្តុក</option>
                <option value="HIDDEN">លាក់ទុក</option>
              </select>
            </label>

            <label>
              <Label>ទិន្នន័យគ្រឿងផ្សំ</Label>
              <select
                value={values.ingredientDataStatus}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    ingredientDataStatus: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="COMPLETE">ពេញលេញ</option>
                <option value="VERIFIED">បានផ្ទៀងផ្ទាត់</option>
                <option value="PARTIAL">ផ្នែកខ្លះ</option>
                <option value="UNKNOWN">មិនច្បាស់</option>
              </select>
            </label>

            <label className="md:col-span-2">
              <Label>ការពិពណ៌នា</Label>
              <textarea
                rows={3}
                value={values.description}
                placeholder="ការពិពណ៌នាអំពីមុខម្ហូបនេះសម្រាប់អតិថិជន..."
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

          {/* Recipe Ingredients */}
          <section className="rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#137A3D]" />
                <div>
                  <h3 className="font-black text-gray-900">
                    គ្រឿងផ្សំ
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-400">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-[#137A3D] hover:bg-emerald-100 transition"
              >
                <Plus size={15} />
                បន្ថែមគ្រឿងផ្សំ
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {ingredientRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl bg-gray-50 p-3 md:grid-cols-[2fr_1fr_1fr_auto_auto]"
                >
                  <select
                    value={row.ingredientUuid}
                    onChange={(event) =>
                      updateIngredientRow(index, {
                        ingredientUuid: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">ជ្រើស Ingredient</option>
                    {activeIngredients.map((ingredient) => (
                      <option key={ingredient.uuid} value={ingredient.uuid}>
                        {ingredient.name} ({ingredient.code})
                      </option>
                    ))}
                  </select>

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
                    placeholder="ខ្នាត (Unit e.g. g, ml)"
                    value={row.unit}
                    onChange={(event) =>
                      updateIngredientRow(index, {
                        unit: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <label className="flex items-center gap-2 px-2 text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.isOptional}
                      onChange={(event) =>
                        updateIngredientRow(index, {
                          isOptional: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-[#137A3D]"
                    />
                    Optional
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setIngredientRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {!ingredientRows.length && (
                <p className="py-4 text-center text-sm text-gray-400">
                  មិនទាន់បានបន្ថែម Ingredient ទេ។
                </p>
              )}
            </div>
          </section>

          {/* Dietary Types */}
          <section className="rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-emerald-600" />
                <div>
                  <h3 className="font-black text-gray-900">
                    របបអាហារ
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-400">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-[#137A3D] hover:bg-emerald-100 transition"
              >
                <Plus size={15} />
                បន្ថែម Dietary Type
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {dietaryTypeRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl bg-gray-50 p-3 md:grid-cols-[2fr_1.5fr_2fr_auto]"
                >
                  <select
                    value={row.dietaryTypeUuid}
                    onChange={(event) =>
                      updateDietaryTypeRow(index, {
                        dietaryTypeUuid: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">ជ្រើស Dietary Type</option>
                    {activeDietaryTypes.map((dt) => (
                      <option key={dt.uuid} value={dt.uuid}>
                        {dt.name} ({dt.code})
                      </option>
                    ))}
                  </select>

                  <select
                    value={row.verificationStatus}
                    onChange={(event) =>
                      updateDietaryTypeRow(index, {
                        verificationStatus: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>

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

                  <button
                    type="button"
                    onClick={() =>
                      setDietaryTypeRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {!dietaryTypeRows.length && (
                <p className="py-4 text-center text-sm text-gray-400">
                  មិនទាន់បានកំណត់ Dietary Type ទេ។
                </p>
              )}
            </div>
          </section>

          {/* Allergen Declarations */}
          <section className="rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-600" />
                <div>
                  <h3 className="font-black text-gray-900">
                    ប្រតិកម្មអាឡែហ្ស៊ី
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-400">
                    ប្រកាសសារធាតុបង្កអាឡែហ្ស៊ី និងកម្រិតហានិភ័យសម្រាប់សុវត្ថិភាពអតិថិជន។
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 hover:bg-amber-100 transition"
              >
                <Plus size={15} />
                បន្ថែម Allergen
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {allergenRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl bg-gray-50 p-3 md:grid-cols-[1.8fr_1.2fr_1fr_1fr_1.5fr_auto]"
                >
                  <select
                    value={row.allergenUuid}
                    onChange={(event) =>
                      updateAllergenRow(index, {
                        allergenUuid: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">ជ្រើស Allergen</option>
                    {activeAllergens.map((al) => (
                      <option key={al.uuid} value={al.uuid}>
                        {al.name} ({al.code})
                      </option>
                    ))}
                  </select>

                  <select
                    value={row.declarationType}
                    onChange={(event) =>
                      updateAllergenRow(index, {
                        declarationType: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="MAY_CONTAIN">អាចមាន</option>
                    <option value="CONTAINS">មានផ្ទុក</option>
                  </select>

                  <select
                    value={row.riskLevel}
                    onChange={(event) =>
                      updateAllergenRow(index, {
                        riskLevel: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>

                  <select
                    value={row.verificationStatus}
                    onChange={(event) =>
                      updateAllergenRow(index, {
                        verificationStatus: event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>

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

                  <button
                    type="button"
                    onClick={() =>
                      setAllergenRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {!allergenRows.length && (
                <p className="py-4 text-center text-sm text-gray-400">
                  មិនទាន់បានប្រកាស Allergen ទេ។
                </p>
              )}
            </div>
          </section>

          {/* Images */}
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
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#0f8e48] disabled:opacity-60 transition"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {item ? "រក្សាទុក" : "Publish ទៅ Website"}
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </label>
  );
}
