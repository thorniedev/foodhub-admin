"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, Loader2, Save, X } from "lucide-react";

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
} from "@/src/types/menuItem";

import IngredientRowsEditor from "./IngredientRowsEditor";
import MenuItemImageUploadGrid from "./MenuItemImageUploadGrid";

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

function parseArray(value: string, label: string): Array<Record<string, unknown>> {
  const trimmed = value.trim();
  if (!trimmed) return [];

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
  const [error, setError] = useState<string | null>(null);

  const { data: shopData, isLoading: shopsLoading } = useGetShopsQuery({
    page: 0,
    size: 100,
  });
  const { data: foodData, isLoading: foodsLoading } = useGetFoodsQuery({
    page: 0,
    size: 200,
    sort: "createdAt,desc",
  });
  const { data: ingredientData, isLoading: ingredientsLoading } =
    useGetIngredientsQuery({ page: 0, size: 200, sort: "name,asc" });

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
    try {
      setError(null);

      if (!form.storeUuid) {
        throw new Error("សូមជ្រើស Store។");
      }

      if (!form.foodUuid) {
        throw new Error("សូមជ្រើស Food ពី Food Catalog។");
      }

      if (!form.name.trim()) {
        throw new Error("សូមបញ្ចូល Menu Item name។");
      }

      const price = Number(form.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Price មិនត្រឹមត្រូវ។");
      }

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
        dietaryTypes: parseArray(form.dietaryTypes, "Dietary Types"),
        allergenDeclarations: parseArray(
          form.allergenDeclarations,
          "Allergen Declarations",
        ),
      };

      await createStoreMenuItem({
        storeUuid: form.storeUuid,
        body,
      }).unwrap();

      await onCreated();
      onClose();
    } catch (requestError) {
      setError(getMenuItemApiErrorMessage(requestError));
    }
  };

  const loadingReferences = shopsLoading || foodsLoading || ingredientsLoading;

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
              <Field label="Store *">
                <select
                  value={form.storeUuid}
                  onChange={(event) => set("storeUuid", event.target.value)}
                  className="field-input"
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

              <Field label="Food from Admin Catalog *">
                <select
                  value={form.foodUuid}
                  onChange={(event) => handleFoodChange(event.target.value)}
                  className="field-input"
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
              <Field label="Menu item name *">
                <input
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  className="field-input"
                />
              </Field>

              <Field label="Price *">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => set("price", event.target.value)}
                  className="field-input"
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
                  onChange={(event) =>
                    set("preparationTimeMinutes", event.target.value)
                  }
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

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Safety / classification JSON</h3>
            <p className="mt-1 text-sm text-gray-500">
              ទុកជា [] បើមិនមាន។ Fields ទាំងពីរនេះត្រូវបានផ្ញើតាម Store Menu Item endpoint។
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <JsonField
                label="Dietary Types"
                value={form.dietaryTypes}
                onChange={(value) => set("dietaryTypes", value)}
              />
              <JsonField
                label="Allergen Declarations"
                value={form.allergenDeclarations}
                onChange={(value) => set("allergenDeclarations", value)}
              />
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      {children}
    </label>
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
