"use client";

import {
  AlertCircle,
  Check,
  Globe2,
  Heart,
  HeartPulse,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ThumbnailImagePicker from "./ThumbnailImagePicker";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";
import { readFoodRelationsStorage, readMenuItemRelationsStorage, saveMenuItemRelationsStorage } from "@/src/lib/filterCatalogStorage";
import GalleryImagePicker from "./GalleryImagePicker";
import MenuItemSearchableSelect, {
  type SearchableOption,
} from "./MenuItemSearchableSelect";
import {
  useGetPublishedMenuItemDetailQuery,
} from "@/src/app/store/menuManagementApi";
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";

import type { DietaryType } from "@/src/types/dietaryType";
import type { MedicalCondition } from "@/src/types/medicalCondition";
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

type MedicalConditionRow = {
  medicalConditionUuid: string;
  suitabilityStatus: "ALLOWED" | "NOT_RECOMMENDED" | "RESTRICTED" | string;
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
  Record<"storeUuid" | "foodUuid" | "name" | "price" | "thumbnail", string>
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
  allergens = [],
  mealTypes = [],
  ageGroups = [],
  seasons = [],
  weatherConditions = [],
  events = [],
  medicalConditions = [],
  saving,
  fixedStoreUuid,
  defaultStoreUuid,
  onClose,
  onSubmit,
  onEditFood,
  onSaveFoodOnly,
}: {
  open: boolean;
  item: MenuItemRecord | null;
  foods: FoodRecord[];
  stores: StoreOption[];
  ingredients: IngredientOption[];
  dietaryTypes?: DietaryType[];
  allergens?: unknown[];
  mealTypes?: any[];
  ageGroups?: any[];
  seasons?: any[];
  weatherConditions?: any[];
  events?: any[];
  medicalConditions?: MedicalCondition[];
  saving: boolean;
  fixedStoreUuid?: string;
  defaultStoreUuid?: string;
  onClose: () => void;
  onSubmit: (
    storeUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => Promise<void>;
  onEditFood?: (food: FoodRecord) => void;
  onSaveFoodOnly?: (foodUuid: string, data: any) => Promise<void>;
}) {
  const storeFixedId = fixedStoreUuid || defaultStoreUuid;
  const itemUuid = item?.uuid || (item as any)?.menuItemUuid || (item as any)?.id;
  const { data: detailedItem } = useGetPublishedMenuItemDetailQuery(
    itemUuid ? String(itemUuid) : "",
    { skip: !open || !itemUuid },
  );

  const activeItem = item ? (detailedItem || item) : null;

  const [values, setValues] = useState<FormState>(EMPTY);
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([]);
  const [dietaryTypeRows, setDietaryTypeRows] = useState<DietaryTypeRow[]>([]);
  const [medicalConditionRows, setMedicalConditionRows] = useState<MedicalConditionRow[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [storeSearchInput, setStoreSearchInput] = useState("");
  const { data: searchedShops } = useGetShopsQuery(
    {
      query: storeSearchInput.trim() || undefined,
      reviewStatus: "APPROVED",
      accountStatus: "ACTIVE",
      size: 50,
    },
    { skip: !open || storeSearchInput.trim().length < 2 },
  );
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !item || !activeItem) {
      setValues({
        ...EMPTY,
        storeUuid: storeFixedId || "",
      });
      setIngredientRows([]);
      setDietaryTypeRows([]);
      setMedicalConditionRows([]);
      setThumbnailFile(null);
      setExistingThumbnail(null);
      setGalleryFiles([]);
      setExistingGallery([]);
      setError(null);
      setFieldErrors({});
      return;
    }

    const { thumbnail, gallery } = extractAllMenuItemImages(activeItem);
    setExistingThumbnail(thumbnail);
    setThumbnailFile(null);
    setExistingGallery(gallery);
    setGalleryFiles([]);

    const isItemUuid = (candidate?: string | null) =>
      Boolean(
        candidate &&
        activeItem &&
        (candidate === activeItem.uuid ||
         candidate === (activeItem as any).menuItemUuid ||
         candidate === (activeItem as any).id)
      );

    const rawStoreUuid = String(
      activeItem.storeUuid ||
      activeItem.store?.uuid ||
      (activeItem.store as any)?.id ||
      "",
    );

    const foundStore = stores.find(
      (s) =>
        (rawStoreUuid && (String(s.uuid) === rawStoreUuid || String(s.id) === rawStoreUuid)) ||
        (activeItem.store?.storeName &&
          (s.storeName === activeItem.store.storeName ||
            s.name === activeItem.store.storeName ||
            s.localName === activeItem.store.storeName)) ||
        (activeItem.store?.name &&
          (s.storeName === activeItem.store.name ||
            s.name === activeItem.store.name ||
            s.localName === activeItem.store.name)),
    );

    const matchedStoreUuid = foundStore ? String(foundStore.uuid || foundStore.id || "") : rawStoreUuid;

    const rawFoodUuid = String(
      activeItem.foodUuid ||
      activeItem.food?.uuid ||
      (typeof activeItem.food === "object" && (activeItem.food as any)?.id) ||
      "",
    );

    const foundFood = foods.find(
      (f) =>
        (rawFoodUuid && !isItemUuid(rawFoodUuid) && (String(f.uuid) === rawFoodUuid || String(f.id) === rawFoodUuid)) ||
        (activeItem.food?.canonicalName &&
          (f.canonicalName?.toLowerCase() === activeItem.food.canonicalName?.toLowerCase() ||
           f.localName?.toLowerCase() === activeItem.food.canonicalName?.toLowerCase())) ||
        (activeItem.food?.localName &&
          (f.localName === activeItem.food.localName ||
           f.canonicalName === activeItem.food.localName)) ||
        (activeItem.name &&
          (f.canonicalName?.toLowerCase() === activeItem.name.toLowerCase() ||
           f.localName?.toLowerCase() === activeItem.name.toLowerCase())),
    );

    const matchedFoodUuid = foundFood
      ? String(foundFood.uuid || foundFood.id || "")
      : (rawFoodUuid && !isItemUuid(rawFoodUuid) && foods.some((f) => String(f.uuid || f.id) === rawFoodUuid)
          ? rawFoodUuid
          : (foods[0]?.uuid || ""));

    setValues({
      storeUuid: matchedStoreUuid,
      foodUuid: matchedFoodUuid,
      name: activeItem.name || "",
      description: activeItem.description || "",
      price:
        activeItem.price != null
          ? String(activeItem.price)
          : "",
      currencyCode: activeItem.currencyCode || "USD",
      preparationTimeMinutes:
        activeItem.preparationTimeMinutes != null
          ? String(activeItem.preparationTimeMinutes)
          : "",
      availabilityStatus:
        activeItem.availabilityStatus || "AVAILABLE",
      ingredientDataStatus:
        activeItem.ingredientDataStatus || "VERIFIED",
      isFeatured: Boolean(activeItem.isFeatured),
      source: activeItem.source || "MANUAL",
    });

    setIngredientRows(
      (activeItem.ingredients ?? []).map((raw: any) => {
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

    const currentMenuItemUuid =
      activeItem.uuid ||
      (activeItem as any).menuItemUuid ||
      (activeItem as any).id ||
      itemUuid;
    const storedMenuItem = currentMenuItemUuid ? readMenuItemRelationsStorage(String(currentMenuItemUuid)) : null;

    const targetFood = foundFood || (matchedFoodUuid ? foods.find((f) => String(f.uuid || f.id) === matchedFoodUuid) : undefined);
    const storedFood = targetFood?.uuid ? readFoodRelationsStorage(targetFood.uuid) : null;

    const rawDietary =
      storedMenuItem?.dietaryTypes !== undefined && Array.isArray(storedMenuItem.dietaryTypes)
        ? storedMenuItem.dietaryTypes
        : activeItem.dietaryTypes !== undefined && Array.isArray(activeItem.dietaryTypes)
        ? activeItem.dietaryTypes
        : storedFood?.dietaryTypes !== undefined && Array.isArray(storedFood.dietaryTypes)
        ? storedFood.dietaryTypes
        : targetFood?.dietaryTypes !== undefined && Array.isArray(targetFood.dietaryTypes)
        ? targetFood.dietaryTypes
        : Array.isArray(activeItem.food?.dietaryTypes)
        ? activeItem.food.dietaryTypes
        : [];

    setDietaryTypeRows(
      rawDietary
        .map((raw: any) => {
          const codeOrUuid =
            typeof raw === "string"
              ? raw
              : raw.dietaryTypeUuid || raw.uuid || raw.code || raw.dietaryTypeCode || raw.id || "";
          const rawName =
            typeof raw === "string"
              ? raw
              : raw.name || raw.localName || raw.dietaryTypeName || "";
          const found = dietaryTypes.find(
            (d) =>
              (codeOrUuid && (d.uuid === codeOrUuid || d.code === codeOrUuid || (d as any).id === codeOrUuid)) ||
              (rawName && (d.name === rawName || (d as any).localName === rawName)),
          );
          return {
            dietaryTypeUuid: found?.uuid || codeOrUuid,
            verificationStatus: raw.verificationStatus || "VERIFIED",
            notes: raw.notes || "",
          };
        })
        .filter((d) => Boolean(d.dietaryTypeUuid)),
    );

    setError(null);
    setFieldErrors({});
  }, [activeItem, item, open, stores, foods, ingredients, dietaryTypes, storeFixedId]);

  const activeFoods = useMemo(
    () =>
      foods.filter(
        (food) =>
          food.isActive !== false ||
          food.uuid === item?.foodUuid ||
          food.uuid === (item as any)?.food?.uuid ||
          food.uuid === values.foodUuid,
      ),
    [foods, item, values.foodUuid],
  );

  const activeIngredients = useMemo(
    () => ingredients.filter((ingredient) => ingredient.isActive !== false),
    [ingredients],
  );

  const activeDietaryTypes = useMemo(
    () => dietaryTypes.filter((dt) => dt.active !== false),
    [dietaryTypes],
  );

  const storeOptions: SearchableOption[] = useMemo(() => {
    const list: SearchableOption[] = [];
    const seen = new Set<string>();

    const add = (s: any) => {
      if (!s) return;
      const id = String(s.uuid || s.id || "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      list.push({
        value: id,
        label: storeLabel(s),
      });
    };

    (stores ?? []).forEach(add);
    (searchedShops?.contents ?? []).forEach(add);

    return list;
  }, [stores, searchedShops]);

  const foodOptions: SearchableOption[] = useMemo(
    () =>
      activeFoods.map((f) => ({
        value: String(f.uuid || f.id || ""),
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

  const activeMedicalConditions = useMemo(
    () => (medicalConditions ?? []).filter((m) => m.active !== false),
    [medicalConditions],
  );

  const medicalConditionOptions: SearchableOption[] = useMemo(
    () =>
      activeMedicalConditions.map((m) => ({
        value: m.uuid,
        label: m.name,
        sublabel: m.code,
      })),
    [activeMedicalConditions],
  );

  const verificationStatusOptions: SearchableOption[] = useMemo(
    () => [
      { value: "UNVERIFIED", label: "មិនទាន់ផ្ទៀងផ្ទាត់" },
      { value: "VERIFIED", label: "បានផ្ទៀងផ្ទាត់" },
    ],
    [],
  );

  const suitabilityStatusOptions: SearchableOption[] = useMemo(
    () => [
      { value: "ALLOWED", label: "សមរម្យ" },
      { value: "NOT_RECOMMENDED", label: "មិនណែនាំ" },
      { value: "RESTRICTED", label: "ហាមឃាត់" },
    ],
    [],
  );

  const availabilityStatusOptions: SearchableOption[] = useMemo(
    () => [
      { value: "AVAILABLE", label: "មានលក់" },
      { value: "UNAVAILABLE", label: "មិនមានលក់" },
      { value: "SOLD_OUT", label: "អស់ស្តុក" },
      { value: "DISCONTINUED", label: "ឈប់លក់" },
    ],
    [],
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

    const storedFood = selectedUuid ? readFoodRelationsStorage(selectedUuid) : null;
    const foodDietary =
      Array.isArray(storedFood?.dietaryTypes) && storedFood.dietaryTypes.length > 0
        ? storedFood.dietaryTypes
        : Array.isArray(selectedFood?.dietaryTypes) && selectedFood.dietaryTypes.length > 0
        ? selectedFood.dietaryTypes
        : [];

    if (foodDietary.length > 0) {
      setDietaryTypeRows(
        foodDietary
          .map((raw: any) => {
            const codeOrUuid =
              typeof raw === "string"
                ? raw
                : raw.dietaryTypeUuid || raw.uuid || raw.code || raw.dietaryTypeCode || raw.id || "";
            const rawName =
              typeof raw === "string"
                ? raw
                : raw.name || raw.localName || raw.dietaryTypeName || "";
            const found = dietaryTypes.find(
              (d) =>
                (codeOrUuid && (d.uuid === codeOrUuid || d.code === codeOrUuid || (d as any).id === codeOrUuid)) ||
                (rawName && (d.name === rawName || (d as any).localName === rawName)),
            );
            return {
              dietaryTypeUuid: found?.uuid || codeOrUuid,
              verificationStatus: raw.verificationStatus || "VERIFIED",
              notes: raw.notes || "",
            };
          })
          .filter((d) => Boolean(d.dietaryTypeUuid)),
      );
    }
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
      storeFixedId ||
      values.storeUuid ||
      item?.storeUuid ||
      item?.store?.uuid ||
      ""
    ).trim();

    if (!item && !targetStoreUuid) {
      nextErrors.storeUuid = "សូមជ្រើសរើសហាង";
    }
    if (!values.foodUuid) {
      nextErrors.foodUuid = "សូមជ្រើសរើសមុខម្ហូបមេ";
    }
    if (!values.name.trim()) {
      nextErrors.name = "សូមបញ្ចូលឈ្មោះ ម៉ឺនុយ";
    }
    const price = Number(values.price);
    if (!values.price.trim() || !Number.isFinite(price) || price <= 0) {
      nextErrors.price = "តម្លៃត្រូវតែធំជាង ០";
    }
    if (!item && !thumbnailFile && !existingThumbnail) {
      nextErrors.thumbnail = "សូមបង្ហោះរូបភាព Thumbnail ចាំបាច់";
    }
    return nextErrors;
  };

  const submit = async () => {
    try {
      setError(null);

      const nextFieldErrors = validateBasics();
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setError("សូមពិនិត្យ និងបំពេញព័ត៌មានចាំបាច់ដែលបានសម្គាល់ខាងក្រោម។");
        bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setFieldErrors({});

      const targetStoreUuid = (
        storeFixedId ||
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

      const isUUID = (str?: string | null) =>
        Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

      const dietaryTypePayload: MenuItemDietaryTypePayload[] = dietaryTypeRows
        .map((r): MenuItemDietaryTypePayload | null => {
          if (isUUID(r.dietaryTypeUuid)) {
            return {
              dietaryTypeUuid: r.dietaryTypeUuid,
              verificationStatus: r.verificationStatus || "VERIFIED",
              notes: r.notes.trim() || null,
            };
          }
          const found = dietaryTypes.find((d) => d.code === r.dietaryTypeUuid || d.uuid === r.dietaryTypeUuid);
          if (found?.uuid && isUUID(found.uuid)) {
            return {
              dietaryTypeUuid: found.uuid,
              verificationStatus: r.verificationStatus || "VERIFIED",
              notes: r.notes.trim() || null,
            };
          }
          return null;
        })
        .filter((d): d is MenuItemDietaryTypePayload => d !== null);

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
          ingredientDataStatus: item?.ingredientDataStatus || "VERIFIED",
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

      const targetMenuItemUuid =
        itemUuid ||
        activeItem?.uuid ||
        (activeItem as any)?.menuItemUuid ||
        (activeItem as any)?.id;

      if (targetMenuItemUuid) {
        saveMenuItemRelationsStorage(String(targetMenuItemUuid), {
          dietaryTypes: dietaryTypePayload,
          ingredients: ingredientPayload,
          medicalConditions: medicalConditionRows,
        });
      }

      await onSubmit(targetStoreUuid, payload, allImages);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "មិនអាចរក្សាទុក ម៉ឺនុយ បានទេ។",
      );
    }
  };

  if (!open) return null;

  const effectiveStoreUuid = storeFixedId || values.storeUuid;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl border-t-4 border-t-primary-800">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-emerald-50/30 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-800">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-primary-900">
                {item ? "កែប្រែ ម៉ឺនុយ" : "បង្កើត ម៉ឺនុយ សម្រាប់ហាង"}
              </p>
              <p className="mt-0.5 text-[18px] text-gray-500">
                {storeFixedId
                  ? "ជ្រើសរើសមុខម្ហូបមេ កំណត់តម្លៃ និងរូបភាពដើម្បីដាក់លក់ក្នុងហាងនេះ"
                  : "ជ្រើសរើសហាង និងមុខម្ហូបមេ រួចកំណត់តម្លៃ និងរូបភាពដើម្បីផ្សាយលើប្រព័ន្ធ"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-gray-400 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body — everything on one page */}
        <div ref={bodyRef} className="flex-1 space-y-6 overflow-y-auto p-7">
          {/* Basic info */}
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <Label required>ហាង</Label>
              <MenuItemSearchableSelect
                disabled={Boolean(item) || Boolean(storeFixedId)}
                value={effectiveStoreUuid}
                options={storeOptions}
                onSearchChange={setStoreSearchInput}
                onChange={(next) => {
                  setValues((current) => ({ ...current, storeUuid: next }));
                  setFieldErrors((current) => ({ ...current, storeUuid: undefined }));
                }}
                placeholder="ជ្រើសរើសហាង"
                invalid={Boolean(fieldErrors.storeUuid)}
                ariaLabel="ជ្រើសរើសហាង"
              />
              {(Boolean(item) || Boolean(storeFixedId)) && (
                <p className="mt-1.5 text-sm font-semibold text-primary-800">
                  ហាងត្រូវបានកំណត់រួចហើយ មិនអាចផ្លាស់ប្តូរបានទេ។
                </p>
              )}
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
              label="ឈ្មោះ ម៉ឺនុយ"
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
              min={0}
              step={1}
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
              <MenuItemSearchableSelect
                value={values.availabilityStatus}
                options={availabilityStatusOptions}
                onChange={(next) =>
                  setValues((current) => ({
                    ...current,
                    availabilityStatus: next,
                  }))
                }
                placeholder="ជ្រើសរើសស្ថានភាព"
                ariaLabel="ជ្រើសរើសស្ថានភាព"
              />
            </label>



            <label className="md:col-span-2">
              <Label>ការពិពណ៌នា</Label>
              <textarea
                rows={3}
                spellCheck={false}
                autoComplete="off"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                data-quillbot="false"
                value={values.description}
                placeholder="ការពិពណ៌នាអំពីមុខម្ហូបនេះសម្រាប់អតិថិជន..."
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={`${inputClass} h-auto py-3.5`}
              />
            </label>
          </div>

          {/* Ingredients */}
          <section className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <TabIntro
              icon={<Sparkles size={20} className="text-primary-800" />}
              title="គ្រឿងផ្សំ"
              description="កំណត់គ្រឿងផ្សំ បរិមាណ និងខ្នាតសម្រាប់មុខម្ហូបនេះ"
              onAdd={() =>
                setIngredientRows((current) => [
                  ...current,
                  {
                    ingredientUuid: "",
                    quantity: "",
                    unit: "",
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
                  style={{ zIndex: ingredientRows.length - index + 20 }}
                  className="relative grid gap-3 rounded-2xl bg-white p-3.5 shadow-xs border border-gray-200/80 border-l-4 border-l-primary-600 md:grid-cols-[2.5fr_1fr_1fr_auto_auto] items-center"
                >
                  <MenuItemSearchableSelect
                    value={row.ingredientUuid}
                    options={ingredientOptions}
                    onChange={(next) =>
                      updateIngredientRow(index, { ingredientUuid: next })
                    }
                    placeholder="ជ្រើសរើសគ្រឿងផ្សំ"
                    ariaLabel="ជ្រើសរើសគ្រឿងផ្សំ"
                  />

                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="បរិមាណ"
                    value={row.quantity}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (Number(val) < 0) return;
                      updateIngredientRow(index, {
                        quantity: val,
                      });
                    }}
                    className={inputClass}
                  />

                  <input
                    placeholder="ខ្នាត (g, ml...)"
                    value={row.unit}
                    onChange={(event) =>
                      updateIngredientRow(index, {
                        unit: event.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <label className="flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 px-3.5 text-base font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/70 transition">
                    <input
                      type="checkbox"
                      checked={row.isOptional}
                      onChange={(event) =>
                        updateIngredientRow(index, {
                          isOptional: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-primary-800"
                    />
                    <span className="whitespace-nowrap">Optional</span>
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
                <EmptyRowsHint text="មិនទាន់បានបន្ថែមគ្រឿងផ្សំទេ។" />
              )}
            </div>
          </section>

          {/* Dietary types */}
          <section className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <TabIntro
              icon={<Heart size={20} className="text-primary-800" />}
              title="របបអាហារ"
              description="សម្គាល់របបអាហារសម្រាប់មុខម្ហូបនេះ"
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
              addLabel="បន្ថែមរបបអាហារ"
            />

            <div className="mt-4 space-y-3">
              {dietaryTypeRows.map((row, index) => (
                <div
                  key={index}
                  style={{ zIndex: dietaryTypeRows.length - index + 20 }}
                  className="relative grid gap-3 rounded-2xl bg-white p-3.5 shadow-xs border border-gray-200/80 border-l-4 border-l-primary-600 md:grid-cols-[2.5fr_1.8fr_2fr_auto] items-center"
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

                  <MenuItemSearchableSelect
                    value={row.verificationStatus}
                    options={verificationStatusOptions}
                    onChange={(next) =>
                      updateDietaryTypeRow(index, {
                        verificationStatus: next,
                      })
                    }
                    placeholder="ជ្រើសរើសស្ថានភាព"
                    ariaLabel="ជ្រើសរើសស្ថានភាព"
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
                <EmptyRowsHint text="មិនទាន់បានកំណត់របបអាហារទេ។" />
              )}
            </div>
          </section>

          {/* Medical conditions */}
          <section className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <TabIntro
              icon={<HeartPulse size={20} className="text-primary-800" />}
              title="ស្ថានភាពសុខភាព"
              description="សម្គាល់ស្ថានភាពសុខភាពដែលសាកសម ឬគួរប្រុងប្រយ័ត្ន"
              onAdd={() =>
                setMedicalConditionRows((current) => [
                  ...current,
                  {
                    medicalConditionUuid: "",
                    suitabilityStatus: "ALLOWED",
                    notes: "",
                  },
                ])
              }
              addLabel="បន្ថែមស្ថានភាពសុខភាព"
            />

            <div className="mt-4 space-y-3">
              {medicalConditionRows.map((row, index) => (
                <div
                  key={index}
                  style={{ zIndex: medicalConditionRows.length - index + 20 }}
                  className="relative grid gap-3 rounded-2xl bg-white p-3.5 shadow-xs border border-gray-200/80 border-l-4 border-l-primary-600 md:grid-cols-[2.5fr_1.8fr_2fr_auto] items-center"
                >
                  <MenuItemSearchableSelect
                    value={row.medicalConditionUuid}
                    options={medicalConditionOptions}
                    onChange={(next) =>
                      setMedicalConditionRows((current) =>
                        current.map((r, i) =>
                          i === index ? { ...r, medicalConditionUuid: next } : r,
                        ),
                      )
                    }
                    placeholder="ជ្រើសស្ថានភាពសុខភាព"
                    ariaLabel="ជ្រើសស្ថានភាពសុខភាព"
                  />

                  <MenuItemSearchableSelect
                    value={row.suitabilityStatus}
                    options={suitabilityStatusOptions}
                    onChange={(next) =>
                      setMedicalConditionRows((current) =>
                        current.map((r, i) =>
                          i === index
                            ? { ...r, suitabilityStatus: next }
                            : r,
                        ),
                      )
                    }
                    placeholder="ជ្រើសរើសសមរម្យភាព"
                    ariaLabel="ជ្រើសរើសសមរម្យភាព"
                  />

                  <input
                    placeholder="កំណត់ចំណាំ (Notes)"
                    value={row.notes}
                    onChange={(event) =>
                      setMedicalConditionRows((current) =>
                        current.map((r, i) =>
                          i === index ? { ...r, notes: event.target.value } : r,
                        ),
                      )
                    }
                    className={inputClass}
                  />

                  <RemoveRowButton
                    onClick={() =>
                      setMedicalConditionRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                  />
                </div>
              ))}

              {!medicalConditionRows.length && (
                <EmptyRowsHint text="មិនទាន់បានកំណត់ស្ថានភាពសុខភាពទេ។" />
              )}
            </div>
          </section>

          {/* Image Upload: 2 Separate Parts (Thumbnail & Gallery) */}
          <div className="space-y-5">
            <ThumbnailImagePicker
              value={thumbnailFile}
              onChange={(file) => {
                setThumbnailFile(file);
                setFieldErrors((current) => ({ ...current, thumbnail: undefined }));
              }}
              existingUrl={existingThumbnail}
              onExistingChange={setExistingThumbnail}
              error={fieldErrors.thumbnail}
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
        <div className="shrink-0 border-t border-gray-100 px-7 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg font-semibold text-red-600">
              <AlertCircle size={22} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="h-11 cursor-pointer rounded-2xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-primary-800 px-6 text-base font-semibold text-white shadow-xs hover:bg-primary-900 disabled:opacity-60 transition active:scale-95"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {item ? "រក្សាទុក" : "រក្សាទុកមុខម្ហូប"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100";

function Label({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-[18px] font-semibold text-gray-800">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-lg font-semibold text-red-500">
      <AlertCircle size={16} />
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
      : "bg-primary-50 text-primary-800 hover:bg-primary-100 border border-primary-100";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-[18px] font-bold text-primary-900">{title}</p>
          <p className="mt-0.5 text-base text-gray-500">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-2xl px-4 text-base font-semibold whitespace-nowrap transition active:scale-95 ${buttonClass}`}
      >
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
  );
}

function EmptyRowsHint({ text }: { text: string }) {
  return <p className="py-4 text-center text-base font-medium text-gray-400">{text}</p>;
}

function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 text-red-500 hover:bg-red-100 hover:text-red-600 transition active:scale-95"
      title="លុបជួរនេះចេញ"
    >
      <Trash2 size={18} />
    </button>
  );
}
