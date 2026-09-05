"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, Save, X } from "lucide-react";
import { z } from "zod";

import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";
import { useGetIngredientsQuery } from "@/src/app/store/ingredientApi";
import {
  useCreateStoreMenuItemMutation,
  useGetFoodsQuery,
} from "@/src/app/store/menuItemApi";
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";
import { getMenuItemApiErrorMessage } from "@/src/lib/menuItemApiError";
import type {
  CatalogFood,
  CreateStoreMenuItemIngredient,
  CreateStoreMenuItemPayload,
  MenuItemDietaryTypeInput,
} from "@/src/types/menuItem";

import IngredientRowsEditor from "./IngredientRowsEditor";
import MenuItemDietaryTypesEditor from "./MenuItemDietaryTypesEditor";
import MenuItemImageUploadGrid from "./MenuItemImageUploadGrid";

const createStoreMenuItemSchema = z.object({
  storeUuid: z.string().trim().min(1, "សូមជ្រើស Store"),
  foodUuid: z.string().trim().min(1, "សូមជ្រើស Food ពី Food Catalog"),
  name: z.string().trim().min(1, "សូមបញ្ចូលឈ្មោះ Menu Item"),
  price: z
    .string()
    .trim()
    .min(1, "តម្លៃត្រូវតែធំជាង ០")
    .refine((val) => {
      const p = Number(val);
      return Number.isFinite(p) && p > 0;
    }, "តម្លៃត្រូវតែធំជាង ០"),
});

interface FormState {
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
  dietaryTypes: string;
  allergenDeclarations: string;
}

const EMPTY_FORM: FormState = {
  storeUuid: "",
  foodUuid: "",
  name: "",
  description: "",
  price: "0",
  currencyCode: "USD",
  preparationTimeMinutes: "10",
  availabilityStatus: "AVAILABLE",
  ingredientDataStatus: "VERIFIED",
  isFeatured: false,
  source: "ADMIN",
  dietaryTypes: "[]",
  allergenDeclarations: "[]",
};

export default function CreateStoreMenuItemModal({
  open,
  initialFood,
  onClose,
  onCreated,
}: {
  open: boolean;
  initialFood?: CatalogFood | null;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [mediaUuids, setMediaUuids] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<CreateStoreMenuItemIngredient[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /**
   * The admin's edits, or null while the list still follows the food.
   *
   * Holding "not edited yet" as null lets the shown list be derived from the
   * selected food instead of copied into state by an effect, so switching food
   * re-seeds without a render pass and an edited list is never overwritten.
   */
  const [dietaryEdits, setDietaryEdits] = useState<MenuItemDietaryTypeInput[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const { data: shopData, isLoading: shopsLoading } = useGetShopsQuery({ reviewStatus: 'APPROVED',
    page: 0,
    size: 100,
  });
  const { data: foodData, isLoading: foodsLoading } = useGetFoodsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });
  const { data: ingredientData, isLoading: ingredientsLoading } =
    useGetIngredientsQuery({ page: 0, size: 100, sort: "name,asc" });
  const { data: dietaryTypeData, isLoading: dietaryTypesLoading } =
    useGetDietaryTypesQuery({ page: 0, size: 100 });

  const [createStoreMenuItem, { isLoading: saving }] =
    useCreateStoreMenuItemMutation();

  const stores = shopData?.contents ?? [];
  const foods = useMemo(
    () =>
      (foodData?.contents ?? []).filter(
        (food) => food.isActive ?? food.active ?? true,
      ),
    [foodData?.contents],
  );
  const ingredientOptions = useMemo(
    () =>
      (ingredientData?.contents ?? [])
        .filter((ingredient) => ingredient.isActive ?? true)
        .map((ingredient) => ({
          uuid: ingredient.uuid,
          code: ingredient.code,
          name: ingredient.name,
          isActive: ingredient.isActive,
        })),
    [ingredientData?.contents],
  );
  const dietaryTypeOptions = useMemo(
    () =>
      (dietaryTypeData?.contents ?? [])
        .filter((type) => type.active ?? true)
        .map((type) => ({ uuid: type.uuid, code: type.code, name: type.name })),
    [dietaryTypeData?.contents],
  );

  const selectedFood = useMemo(
    () =>
      form.foodUuid === initialFood?.uuid
        ? initialFood
        : foods.find((item) => item.uuid === form.foodUuid),
    [foods, form.foodUuid, initialFood],
  );

  /**
   * The food's dietary classification, as the rows a new menu item starts
   * with. Only types the admin can actually pick are kept, so a label the
   * catalog has since deactivated cannot be resubmitted.
   */
  const foodDietarySeed = useMemo<MenuItemDietaryTypeInput[]>(
    () =>
      (selectedFood?.dietaryTypes ?? [])
        .map((entry): MenuItemDietaryTypeInput | null => {
          const match = dietaryTypeOptions.find(
            (option) =>
              option.uuid === entry.uuid ||
              (entry.code != null && option.code === entry.code),
          );
          return match
            ? {
                dietaryTypeUuid: match.uuid,
                // The food says what the dish is; only this store can say the
                // plate it serves was checked, so a copied label starts
                // unverified.
                verificationStatus: "UNVERIFIED",
                notes: "",
              }
            : null;
        })
        .filter((entry): entry is MenuItemDietaryTypeInput => entry !== null),
    [dietaryTypeOptions, selectedFood],
  );

  // Shown and submitted: the admin's edits once they have made any, the food's
  // classification until then.
  const dietaryTypes = dietaryEdits ?? foodDietarySeed;

  useEffect(() => {
    if (!open) return;

    setForm({
      ...EMPTY_FORM,
      foodUuid: initialFood?.uuid ?? "",
      name: initialFood?.localName || initialFood?.canonicalName || "",
      description: initialFood?.description ?? "",
    });
    setMediaUuids([]);
    setIngredients([]);
    setDietaryEdits(null);
    setError(null);
  }, [initialFood, open]);

  useEffect(() => {
    if (open && !form.storeUuid && stores[0]?.uuid) {
      setForm((current) => ({ ...current, storeUuid: stores[0].uuid }));
    }
  }, [form.storeUuid, open, stores]);

  useEffect(() => {
    if (open && !form.foodUuid && foods[0]?.uuid) {
      setForm((current) => ({ ...current, foodUuid: foods[0].uuid }));
    }
  }, [foods, form.foodUuid, open]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFoodChange = (foodUuid: string) => {
    const food = foods.find((item) => item.uuid === foodUuid);

    setForm((current) => ({
      ...current,
      foodUuid,
      name: current.name || food?.localName || food?.canonicalName || "",
      description: current.description || food?.description || "",
    }));
  };

  const submit = async () => {
    setServerError(null);

    const validationResult = createStoreMenuItemSchema.safeParse({
      storeUuid: form.storeUuid,
      foodUuid: form.foodUuid,
      name: form.name,
      price: form.price,
    });

    const nextErrors: Record<string, string> = {};
    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!nextErrors[field]) {
          nextErrors[field] = err.message;
        }
      });
    }

    if (form.dietaryTypes.trim()) {
      try {
        const parsed = JSON.parse(form.dietaryTypes.trim());
        if (!Array.isArray(parsed)) {
          nextErrors.dietaryTypes = "Dietary Types ត្រូវតែជា JSON array []។";
        }
      } catch {
        nextErrors.dietaryTypes = "Dietary Types ត្រូវតែជា JSON ត្រឹមត្រូវ។";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    try {
      const price = Number(form.price);

      const body: CreateStoreMenuItemPayload = {
        foodUuid: form.foodUuid,
        menuItem: {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price,
          currencyCode: form.currencyCode.trim().toUpperCase() || "USD",
          preparationTimeMinutes: Number(form.preparationTimeMinutes || 0),
          availabilityStatus: form.availabilityStatus,
          ingredientDataStatus: form.ingredientDataStatus,
          isFeatured: form.isFeatured,
          source: form.source,
        },
        primaryMediaUuids: mediaUuids,
        ingredients: ingredients
          .filter((item) => item.ingredientUuid)
          .map((item) => ({
            ...item,
            unit: item.unit.trim(),
            notes: item.notes?.trim() || null,
          })),
        dietaryTypes: dietaryTypes.map((row) => ({
          dietaryTypeUuid: row.dietaryTypeUuid,
          verificationStatus: row.verificationStatus,
          notes: row.notes?.trim() ? row.notes.trim() : null,
        })),
        allergenDeclarations: [],
      };

      await createStoreMenuItem({
        storeUuid: form.storeUuid,
        body,
      }).unwrap();

      await onCreated();
      onClose();
    } catch (requestError) {
      setServerError(getMenuItemApiErrorMessage(requestError));
    }
  };

  const loadingReferences =
    shopsLoading || foodsLoading || ingredientsLoading || dietaryTypesLoading;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-[#f8faf9] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#F97316]">
              Publish Menu Item
            </p>
            <h2 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
              បង្កើត Store Menu Item ហើយបង្ហាញលើ Website
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Store + Food Catalog</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Store មិនបង្កើត Food master ថ្មីទេ — ជ្រើស Food ដែល Admin បានបង្កើតរួច។
                </p>
              </div>

              <a
                href="/shops"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#137A3D] hover:underline"
              >
                Manage stores <ExternalLink size={14} />
              </a>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Store *" error={fieldErrors.storeUuid}>
                <select
                  value={form.storeUuid}
                  onChange={(event) => {
                    set("storeUuid", event.target.value);
                    clearFieldError("storeUuid");
                  }}
                  className={`field-input ${
                    fieldErrors.storeUuid
                      ? "!border-red-400 !bg-red-50/40 focus:!border-red-500 focus:!ring-red-100"
                      : ""
                  }`}
                  disabled={shopsLoading}
                >
                  <option value="">Select store</option>
                  {stores.map((store) => (
                    <option key={store.uuid} value={store.uuid}>
                      {store.storeName} · {store.reviewStatus ?? "UNKNOWN"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Food from Admin Catalog *" error={fieldErrors.foodUuid}>
                <select
                  value={form.foodUuid}
                  onChange={(event) => {
                    handleFoodChange(event.target.value);
                    clearFieldError("foodUuid");
                  }}
                  className={`field-input ${
                    fieldErrors.foodUuid
                      ? "!border-red-400 !bg-red-50/40 focus:!border-red-500 focus:!ring-red-100"
                      : ""
                  }`}
                  disabled={foodsLoading}
                >
                  <option value="">Select food</option>
                  {foods.map((food) => (
                    <option key={food.uuid} value={food.uuid}>
                      {food.localName || food.canonicalName} · {food.canonicalName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Menu Item information</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Menu item name *" error={fieldErrors.name}>
                <input
                  value={form.name}
                  onChange={(event) => {
                    set("name", event.target.value);
                    clearFieldError("name");
                  }}
                  className={`field-input ${
                    fieldErrors.name
                      ? "!border-red-400 !bg-red-50/40 focus:!border-red-500 focus:!ring-red-100"
                      : ""
                  }`}
                />
              </Field>

              <Field label="Price *" error={fieldErrors.price}>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(event) => {
                    const val = event.target.value;
                    if (Number(val) < 0) return;
                    set("price", val);
                    clearFieldError("price");
                  }}
                  className={`field-input ${
                    fieldErrors.price
                      ? "!border-red-400 !bg-red-50/40 focus:!border-red-500 focus:!ring-red-100"
                      : ""
                  }`}
                />
              </Field>

              <Field label="Currency">
                <input
                  maxLength={3}
                  value={form.currencyCode}
                  onChange={(event) => set("currencyCode", event.target.value)}
                  className="field-input uppercase"
                />
              </Field>

              <Field label="Preparation time (minutes)">
                <input
                  type="number"
                  min="0"
                  value={form.preparationTimeMinutes}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(event) => {
                    const val = event.target.value;
                    if (Number(val) < 0) return;
                    set("preparationTimeMinutes", val);
                  }}
                  className="field-input"
                />
              </Field>

              <Field label="Availability">
                <select
                  value={form.availabilityStatus}
                  onChange={(event) => set("availabilityStatus", event.target.value)}
                  className="field-input"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                  <option value="SOLD_OUT">SOLD_OUT</option>
                </select>
              </Field>

              <Field label="Ingredient data status">
                <select
                  value={form.ingredientDataStatus}
                  onChange={(event) => set("ingredientDataStatus", event.target.value)}
                  className="field-input"
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                  <option value="COMPLETE">COMPLETE</option>
                </select>
              </Field>

              <Field label="Source">
                <select
                  value={form.source}
                  onChange={(event) => set("source", event.target.value)}
                  className="field-input"
                >
                  <option value="MANUAL">MANUAL</option>
                  <option value="IMPORTED">IMPORTED</option>
                </select>
              </Field>

              <label className="flex h-[74px] items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 md:self-end">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => set("isFeatured", event.target.checked)}
                />
                <span className="font-bold text-gray-700">Featured menu item</span>
              </label>

              <label className="md:col-span-2 lg:col-span-3">
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

          <MenuItemImageUploadGrid
            label="រូបភាព Menu Item"
            values={mediaUuids}
            onChange={setMediaUuids}
            mode="MENU_ITEM"
            maxImages={4}
          />

          <IngredientRowsEditor
            options={ingredientOptions}
            value={ingredients}
            onChange={setIngredients}
          />

          <MenuItemDietaryTypesEditor
            options={dietaryTypeOptions}
            value={dietaryTypes}
            onChange={setDietaryEdits}
            onReseed={() => setDietaryEdits(null)}
            seedCount={foodDietarySeed.length}
          />

          {serverError && (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
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
              disabled={saving || loadingReferences}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#137A3D] px-6 font-bold text-white hover:bg-[#0f6333] disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Publish to Website
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

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      {children}
      {error && <p className="mt-1 text-sm font-normal text-red-500">{error}</p>}
    </label>
  );
}

