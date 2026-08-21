"use client";

import {
  AlertCircle,
  Heart,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ThumbnailImagePicker from "./ThumbnailImagePicker";
import GalleryImagePicker from "./GalleryImagePicker";
import MenuItemSearchableSelect, {
  type SearchableOption,
} from "./MenuItemSearchableSelect";

import type { DietaryType } from "@/src/types/dietaryType";
import type {
  FoodRecord,
  IngredientOption,
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

type FieldErrors = Partial<
  Record<"storeUuid" | "foodUuid" | "name" | "price", string>
>;

const EMPTY: FormState = {
  storeUuid: "",
  foodUuid: "",
  name: "",
  description: "",
  price: "",
  currencyCode: "USD",
  preparationTimeMinutes: "15",
  availabilityStatus: "AVAILABLE",
  ingredientDataStatus: "VERIFIED",
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

function extractAllMenuItemImages(item: MenuItemRecord): {
  thumbnail: string | null;
  gallery: string[];
} {
  const allCandidates: string[] = [];

  const add = (val: unknown) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (
        trimmed &&
        trimmed !== "null" &&
        trimmed !== "undefined" &&
        !allCandidates.includes(trimmed)
      ) {
        allCandidates.push(trimmed);
      }
    }
  };

  // 1. Primary / Thumbnail direct fields
  add(item.thumbnailMediaUuid);
  add(item.thumbnail);
  add(item.imageUrl);
  add(item.primaryMediaUuid);
  if (Array.isArray(item.primaryMediaUrls)) item.primaryMediaUrls.forEach(add);
  if (Array.isArray(item.primaryMediaUuids)) item.primaryMediaUuids.forEach(add);

  // 2. Gallery / Media arrays
  if (Array.isArray(item.galleryMediaUuids)) item.galleryMediaUuids.forEach(add);
  if (Array.isArray(item.gallery)) item.gallery.forEach(add);
  if (Array.isArray(item.images)) item.images.forEach(add);
  if (Array.isArray((item as any).media)) {
    (item as any).media.forEach((m: any) => {
      if (typeof m === "string") add(m);
      else if (m && typeof m === "object") {
        add(m.uuid);
        add(m.url);
        add(m.accessUrl);
      }
    });
  }

  // 3. Fallback to Food catalog media if menuItem has no images
  if (allCandidates.length === 0 && item.food) {
    add(item.food.thumbnailMediaUuid);
    add(item.food.thumbnail);
    add(item.food.imageUrl);
    add(item.food.primaryMediaUuid);
    if (Array.isArray(item.food.primaryMediaUrls)) item.food.primaryMediaUrls.forEach(add);
    if (Array.isArray(item.food.primaryMediaUuids)) item.food.primaryMediaUuids.forEach(add);
    if (Array.isArray(item.food.galleryMediaUuids)) item.food.galleryMediaUuids.forEach(add);
    if (Array.isArray(item.food.gallery)) item.food.gallery.forEach(add);
    if (Array.isArray(item.food.images)) item.food.images.forEach(add);
  }

  const thumbnail = allCandidates.length > 0 ? allCandidates[0] : null;
  const gallery = allCandidates.length > 1 ? allCandidates.slice(1, 5) : [];

  return { thumbnail, gallery };
}

export default function PublishMenuItemModal({
  open,
  item,
  foods,
  stores,
  ingredients,
  dietaryTypes = [],
  saving,
  fixedStoreUuid,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: MenuItemRecord | null;
  foods: FoodRecord[];
  stores: StoreOption[];
  ingredients: IngredientOption[];
  dietaryTypes?: DietaryType[];
  allergens?: unknown[];
  saving: boolean;
  fixedStoreUuid?: string;
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues({
        ...EMPTY,
        storeUuid: fixedStoreUuid || "",
      });
      setIngredientRows([]);
      setDietaryTypeRows([]);
      setThumbnailFile(null);
      setExistingThumbnail(null);
      setGalleryFiles([]);
      setExistingGallery([]);
      setError(null);
      setFieldErrors({});
      return;
    }

    const { thumbnail, gallery } = extractAllMenuItemImages(item);
    setExistingThumbnail(thumbnail);
    setThumbnailFile(null);
    setExistingGallery(gallery);
    setGalleryFiles([]);

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
        item.ingredientDataStatus || "VERIFIED",
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

    setError(null);
    setFieldErrors({});
  }, [item, open, stores, foods, ingredients, dietaryTypes]);

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

  const storeOptions: SearchableOption[] = useMemo(
    () => stores.map((s) => ({ value: s.uuid, label: storeLabel(s) })),
    [stores],
  );

  const foodOptions: SearchableOption[] = useMemo(
    () =>
      activeFoods.map((f) => ({
        value: f.uuid,
        label: foodLabel(f),
      })),
    [activeFoods],
  );

  const ingredientOptions: SearchableOption[] = useMemo(
    () =>
      activeIngredients.map((i) => ({
        value: i.uuid,
        label: i.name,
        sublabel: i.code,
      })),
    [activeIngredients],
  );

  const dietaryTypeOptions: SearchableOption[] = useMemo(
    () =>
      activeDietaryTypes.map((d) => ({
        value: d.uuid,
        label: d.name,
        sublabel: d.code,
      })),
    [activeDietaryTypes],
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
    setFieldErrors((current) => ({ ...current, foodUuid: undefined }));
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

  const validateBasics = (): FieldErrors => {
    const nextErrors: FieldErrors = {};
    const targetStoreUuid = (
      fixedStoreUuid ||
      values.storeUuid ||
      item?.storeUuid ||
      item?.store?.uuid ||
      ""
    ).trim();

    if (!item && !targetStoreUuid) {
      nextErrors.storeUuid = "សូមជ្រើសរើស Store";
    }
    if (!values.foodUuid) {
      nextErrors.foodUuid = "សូមជ្រើសរើស Food Catalog";
    }
    if (!values.name.trim()) {
      nextErrors.name = "សូមបញ្ចូលឈ្មោះ Menu Item";
    }
    const price = Number(values.price);
    if (!values.price.trim() || !Number.isFinite(price) || price <= 0) {
      nextErrors.price = "តម្លៃត្រូវតែធំជាង ០ (Price must be greater than 0)";
    }
    return nextErrors;
  };

  const submit = async () => {
    try {
      setError(null);

      const nextFieldErrors = validateBasics();
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setError("សូមបំពេញព័ត៌មានចាំបាច់ដែលបានសម្គាល់ខាងក្រោម។");
        return;
      }
      setFieldErrors({});

      const targetStoreUuid = (
        fixedStoreUuid ||
        values.storeUuid ||
        item?.storeUuid ||
        item?.store?.uuid ||
        ""
      ).trim();

      const price = Number(values.price);

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

      // Combine thumbnail file and gallery files for upload
      const allImages: File[] = [];
      if (thumbnailFile) {
        allImages.push(thumbnailFile);
      }
      galleryFiles.forEach((file) => {
        allImages.push(file);
      });

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
        primaryMediaUuids: [],
        thumbnailMediaUuid: thumbnailFile ? null : (existingThumbnail || null),
        galleryMediaUuids: existingGallery,
        ingredients: ingredientPayload,
        dietaryTypes: dietaryTypePayload,
        allergenDeclarations: [],
      };

      await onSubmit(targetStoreUuid, payload, allImages);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not publish Menu Item.",
      );
    }
  };

  if (!open) return null;

  const effectiveStoreUuid = fixedStoreUuid || values.storeUuid;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {item ? "កែប្រែ Menu Item" : "បង្កើត Menu Item សម្រាប់ Store"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {fixedStoreUuid
                ? "ជ្រើស Food Catalog កំណត់តម្លៃ សុវត្ថិភាពម្ហូប និងរូបភាពដើម្បីដាក់លក់ក្នុងហាងនេះ"
                : "ជ្រើស Store និង Food Catalog រួចកំណត់តម្លៃ សុវត្ថិភាពម្ហូប និងរូបភាពដើម្បីផ្សាយលើ Website"}
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

        {/* Scrollable body — everything on one page */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Basic info */}
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <Label required>ហាង</Label>
              {(Boolean(item) || Boolean(fixedStoreUuid)) && (
                <p className="mb-1 text-xs text-gray-400">
                  Store ត្រូវបានកំណត់រួចហើយ មិនអាចប្តូរបានទេ។
                </p>
              )}
              <MenuItemSearchableSelect
                disabled={Boolean(item) || Boolean(fixedStoreUuid)}
                value={effectiveStoreUuid}
                options={storeOptions}
                onChange={(next) => {
                  setValues((current) => ({ ...current, storeUuid: next }));
                  setFieldErrors((current) => ({ ...current, storeUuid: undefined }));
                }}
                placeholder="ជ្រើសរើសហាង"
                invalid={Boolean(fieldErrors.storeUuid)}
                ariaLabel="ជ្រើសរើសហាង"
              />
              <FieldError message={fieldErrors.storeUuid} />
            </label>

            <label>
              <Label required>មុខម្ហូបមេ</Label>
              <MenuItemSearchableSelect
                value={values.foodUuid}
                options={foodOptions}
                onChange={handleFoodSelect}
                placeholder="ជ្រើសរើសមុខម្ហូបមេ"
                invalid={Boolean(fieldErrors.foodUuid)}
                ariaLabel="ជ្រើសរើសមុខម្ហូបមេ"
              />
              <FieldError message={fieldErrors.foodUuid} />
            </label>

            <Field
              label="ឈ្មោះ Menu Item"
              required
              value={values.name}
              placeholder="ឧទាហរណ៍៖ សម្លកកូរពិសេស ឬ Phnom Penh Noodle Soup"
              invalid={Boolean(fieldErrors.name)}
              error={fieldErrors.name}
              onChange={(value) => {
                setValues((current) => ({ ...current, name: value }));
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="តម្លៃ"
                required
                type="number"
                min={0.01}
                step="0.01"
                value={values.price}
                placeholder="3.50"
                invalid={Boolean(fieldErrors.price)}
                error={fieldErrors.price}
                onChange={(value) => {
                  setValues((current) => ({ ...current, price: value }));
                  setFieldErrors((current) => ({ ...current, price: undefined }));
                }}
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
            </div>

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
                <option value="DISCONTINUED">ឈប់លក់</option>
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
                <option value="VERIFIED">បានផ្ទៀងផ្ទាត់ (VERIFIED)</option>
                <option value="COMPLETE">ពេញលេញ (COMPLETE)</option>
                <option value="PARTIAL">ផ្នែកខ្លះ (PARTIAL)</option>
                <option value="UNKNOWN">មិនច្បាស់ (UNKNOWN)</option>
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

          {/* Ingredients */}
          <section className="rounded-2xl border border-gray-100 p-5">
            <TabIntro
              icon={<Sparkles size={18} className="text-[#137A3D]" />}
              title="គ្រឿងផ្សំ"
              description="កំណត់គ្រឿងផ្សំ បរិមាណ និងខ្នាតសម្រាប់មុខម្ហូបនេះ។"
              onAdd={() =>
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
              addLabel="បន្ថែមគ្រឿងផ្សំ"
            />

            <div className="mt-4 space-y-3">
              {ingredientRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl bg-gray-50 p-3 md:grid-cols-[2fr_1fr_1fr_auto_auto]"
                >
                  <MenuItemSearchableSelect
                    value={row.ingredientUuid}
                    options={ingredientOptions}
                    onChange={(next) =>
                      updateIngredientRow(index, { ingredientUuid: next })
                    }
                    placeholder="ជ្រើស Ingredient"
                    ariaLabel="ជ្រើស Ingredient"
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

                  <RemoveRowButton
                    onClick={() =>
                      setIngredientRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                  />
                </div>
              ))}

              {!ingredientRows.length && (
                <EmptyRowsHint text="មិនទាន់បានបន្ថែម Ingredient ទេ។" />
              )}
            </div>
          </section>

          {/* Dietary types */}
          <section className="rounded-2xl border border-gray-100 p-5">
            <TabIntro
              icon={<Heart size={18} className="text-emerald-600" />}
              title="របបអាហារ"
              description="សម្គាល់របបអាហារ (Vegan, Halal, Keto, etc.)"
              onAdd={() =>
                setDietaryTypeRows((current) => [
                  ...current,
                  {
                    dietaryTypeUuid: "",
                    verificationStatus: "UNVERIFIED",
                    notes: "",
                  },
                ])
              }
              addLabel="បន្ថែម Dietary Type"
            />

            <div className="mt-4 space-y-3">
              {dietaryTypeRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl bg-gray-50 p-3 md:grid-cols-[2fr_1.5fr_2fr_auto]"
                >
                  <MenuItemSearchableSelect
                    value={row.dietaryTypeUuid}
                    options={dietaryTypeOptions}
                    onChange={(next) =>
                      updateDietaryTypeRow(index, { dietaryTypeUuid: next })
                    }
                    placeholder="ជ្រើស Dietary Type"
                    ariaLabel="ជ្រើស Dietary Type"
                  />

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

                  <RemoveRowButton
                    onClick={() =>
                      setDietaryTypeRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                  />
                </div>
              ))}

              {!dietaryTypeRows.length && (
                <EmptyRowsHint text="មិនទាន់បានកំណត់ Dietary Type ទេ។" />
              )}
            </div>
          </section>

          {/* Image Upload: 2 Separate Parts (Thumbnail & Gallery) */}
          <div className="space-y-4">
            <ThumbnailImagePicker
              value={thumbnailFile}
              onChange={setThumbnailFile}
              existingUrl={existingThumbnail}
              onExistingChange={setExistingThumbnail}
            />

            <GalleryImagePicker
              value={galleryFiles}
              onChange={setGalleryFiles}
              existingUrls={existingGallery}
              onExistingChange={setExistingGallery}
              maxFiles={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4">
          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
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
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-sm font-bold text-gray-800">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-500">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  min,
  step,
  required = false,
  invalid = false,
  error,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: string;
  min?: number | string;
  step?: number | string;
  required?: boolean;
  invalid?: boolean;
  error?: string;
}) {
  return (
    <label>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        min={min}
        step={step}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid}
        onKeyDown={(e) => {
          if (type === "number" && min !== undefined && Number(min) >= 0 && (e.key === "-" || e.key === "e")) {
            e.preventDefault();
          }
        }}
        onChange={(event) => {
          const nextVal = event.target.value;
          if (type === "number" && min !== undefined && Number(min) >= 0 && Number(nextVal) < 0) {
            return;
          }
          onChange(nextVal);
        }}
        className={`${inputClass} ${
          invalid ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-50" : ""
        }`}
      />
      <FieldError message={error} />
    </label>
  );
}

function TabIntro({
  icon,
  title,
  description,
  onAdd,
  addLabel,
  accent = "emerald",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAdd: () => void;
  addLabel: string;
  accent?: "emerald" | "amber";
}) {
  const buttonClass =
    accent === "amber"
      ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
      : "bg-emerald-50 text-[#137A3D] hover:bg-emerald-100";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-black text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${buttonClass}`}
      >
        <Plus size={15} />
        {addLabel}
      </button>
    </div>
  );
}

function EmptyRowsHint({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-gray-400">{text}</p>;
}

function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 text-red-400 hover:bg-red-50"
    >
      <Trash2 size={17} />
    </button>
  );
}
