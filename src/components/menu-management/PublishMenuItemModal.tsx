"use client";

import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";

import type {
  FoodRecord,
  IngredientOption,
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
  return food.localName || food.canonicalName;
}

export default function PublishMenuItemModal({
  open,
  item,
  foods,
  stores,
  ingredients,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: MenuItemRecord | null;
  foods: FoodRecord[];
  stores: StoreOption[];
  ingredients: IngredientOption[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    storeUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setRows([]);
      setImages([]);
      setError(null);
      return;
    }

    setValues({
      storeUuid:
        item.storeUuid ||
        item.store?.uuid ||
        "",
      foodUuid:
        item.foodUuid ||
        item.food?.uuid ||
        "",
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

    setRows(
      (item.ingredients ?? []).map((ingredient) => ({
        ingredientUuid:
          ingredient.ingredientUuid ||
          ingredient.uuid ||
          "",
        quantity:
          ingredient.quantity != null
            ? String(ingredient.quantity)
            : "",
        unit: ingredient.unit || "",
        isOptional: Boolean(ingredient.isOptional),
        notes: ingredient.notes || "",
      })),
    );

    setImages([]);
    setError(null);
  }, [item, open]);

  const activeFoods = useMemo(
    () =>
      foods.filter((food) => food.isActive !== false),
    [foods],
  );

  const activeIngredients = useMemo(
    () =>
      ingredients.filter(
        (ingredient) => ingredient.isActive !== false,
      ),
    [ingredients],
  );

  const updateRow = (
    index: number,
    changes: Partial<IngredientRow>,
  ) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, ...changes }
          : row,
      ),
    );
  };

  const submit = async () => {
    try {
      setError(null);

      if (!item && !values.storeUuid) {
        throw new Error("Store is required.");
      }

      if (!values.foodUuid) {
        throw new Error("Food is required.");
      }

      if (!values.name.trim()) {
        throw new Error("Menu item name is required.");
      }

      const price = Number(values.price);

      if (!Number.isFinite(price)) {
        throw new Error("Price is required.");
      }

      const ingredientPayload:
        MenuItemIngredientPayload[] = rows
          .filter((row) => row.ingredientUuid)
          .map((row) => ({
            ingredientUuid: row.ingredientUuid,
            quantity: row.quantity.trim()
              ? Number(row.quantity)
              : null,
            unit: row.unit.trim() || null,
            isOptional: row.isOptional,
            notes: row.notes.trim() || null,
          }));

      const payload: MenuItemWritePayload = {
        foodUuid: values.foodUuid,
        menuItem: {
          name: values.name.trim(),
          description:
            values.description.trim() || null,
          price,
          currencyCode:
            values.currencyCode.trim() || "USD",
          preparationTimeMinutes:
            values.preparationTimeMinutes.trim()
              ? Number(values.preparationTimeMinutes)
              : null,
          availabilityStatus:
            values.availabilityStatus,
          ingredientDataStatus:
            values.ingredientDataStatus,
          isFeatured: values.isFeatured,
          source: values.source || "MANUAL",
        },
        primaryMediaUuids:
          item?.primaryMediaUuids ?? [],
        ingredients: ingredientPayload,
        dietaryTypes: item?.dietaryTypes ?? [],
        allergenDeclarations:
          item?.allergenDeclarations ?? [],
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
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-6 w-full max-w-5xl rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {item
                ? "កែប្រែ Menu Item"
                : "Publish Menu Item ទៅ Website"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              ជ្រើស Store + Food Catalog ហើយកំណត់តម្លៃ និងរូបភាព។
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
            <label>
              <Label>Store *</Label>
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
                <option value="">ជ្រើស Store</option>
                {stores.map((store) => (
                  <option
                    key={store.uuid}
                    value={store.uuid}
                  >
                    {storeLabel(store)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label>Food Catalog *</Label>
              <select
                value={values.foodUuid}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    foodUuid: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">ជ្រើស Food</option>
                {activeFoods.map((food) => (
                  <option
                    key={food.uuid}
                    value={food.uuid}
                  >
                    {foodLabel(food)}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Menu item name *"
              value={values.name}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  name: value,
                }))
              }
            />

            <Field
              label="Price *"
              type="number"
              value={values.price}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  price: value,
                }))
              }
            />

            <Field
              label="Currency"
              value={values.currencyCode}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  currencyCode: value,
                }))
              }
            />

            <Field
              label="Preparation minutes"
              type="number"
              value={values.preparationTimeMinutes}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  preparationTimeMinutes: value,
                }))
              }
            />

            <label>
              <Label>Availability</Label>
              <select
                value={values.availabilityStatus}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    availabilityStatus:
                      event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
                <option value="SOLD_OUT">SOLD_OUT</option>
                <option value="HIDDEN">HIDDEN</option>
              </select>
            </label>

            <label>
              <Label>Ingredient data</Label>
              <select
                value={values.ingredientDataStatus}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    ingredientDataStatus:
                      event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="COMPLETE">COMPLETE</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
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

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isFeatured: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#137A3D]"
              />
              <span className="font-bold text-gray-700">
                Featured
              </span>
            </label>
          </div>

          <section className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">
                  Ingredients
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  ជ្រើស Ingredient ដែល Admin បានបង្កើតរួច។
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRows((current) => [
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
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-[#137A3D]"
              >
                <Plus size={15} />
                បន្ថែម
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl bg-gray-50 p-3 md:grid-cols-[2fr_1fr_1fr_auto]"
                >
                  <select
                    value={row.ingredientUuid}
                    onChange={(event) =>
                      updateRow(index, {
                        ingredientUuid:
                          event.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">
                      ជ្រើស Ingredient
                    </option>
                    {activeIngredients.map((ingredient) => (
                      <option
                        key={ingredient.uuid}
                        value={ingredient.uuid}
                      >
                        {ingredient.name} ({ingredient.code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Quantity"
                    value={row.quantity}
                    onChange={(event) =>
                      updateRow(index, {
                        quantity: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <input
                    placeholder="Unit"
                    value={row.unit}
                    onChange={(event) =>
                      updateRow(index, {
                        unit: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setRows((current) =>
                        current.filter(
                          (_, rowIndex) =>
                            rowIndex !== index,
                        ),
                      )
                    }
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {!rows.length && (
                <p className="py-4 text-center text-sm text-gray-400">
                  មិនទាន់បានបន្ថែម Ingredient។
                </p>
              )}
            </div>
          </section>

          <ImagePicker
            value={images}
            onChange={setImages}
            label={
              item
                ? "រូបភាពថ្មី (ទុកទទេ = រក្សារូបចាស់)"
                : "រូបភាព Menu Item (អតិបរមា 4)"
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
              {item ? "រក្សាទុក" : "Publish"}
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
