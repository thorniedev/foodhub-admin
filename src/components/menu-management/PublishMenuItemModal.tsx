"use client";

import {
  AlertCircle,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Heart,
  HeartPulse,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Store,
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

type AllergenRow = {
  allergenUuid: string;
  declarationType: "CONTAINS" | "MAY_CONTAIN" | string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
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

  // 1. URLs / paths first
  if (Array.isArray(item.primaryMediaUrls)) item.primaryMediaUrls.forEach(add);
  add(item.thumbnail);
  add(item.imageUrl);

  // 2. Direct UUID fields
  add(item.thumbnailMediaUuid);
  add(item.primaryMediaUuid);
  if (Array.isArray(item.primaryMediaUuids)) item.primaryMediaUuids.forEach(add);

  // 3. Arrays / Media
  if (Array.isArray(item.gallery)) item.gallery.forEach(add);
  if (Array.isArray(item.images)) item.images.forEach(add);
  if (Array.isArray(item.galleryMediaUuids)) item.galleryMediaUuids.forEach(add);
  if (Array.isArray((item as any).media)) {
    (item as any).media.forEach((m: any) => {
      if (typeof m === "string") add(m);
      else if (m && typeof m === "object") {
        add(m.url);
        add(m.accessUrl);
        add(m.uuid);
      }
    });
  }

  // 4. Fallback to Food catalog media
  if (allCandidates.length === 0 && item.food) {
    if (Array.isArray(item.food.primaryMediaUrls)) item.food.primaryMediaUrls.forEach(add);
    add(item.food.thumbnail);
    add(item.food.imageUrl);
    add(item.food.thumbnailMediaUuid);
    add(item.food.primaryMediaUuid);
    if (Array.isArray(item.food.primaryMediaUuids)) item.food.primaryMediaUuids.forEach(add);
    if (Array.isArray(item.food.gallery)) item.food.gallery.forEach(add);
    if (Array.isArray(item.food.images)) item.food.images.forEach(add);
    if (Array.isArray(item.food.galleryMediaUuids)) item.food.galleryMediaUuids.forEach(add);
  }

  // Separate working image URLs/paths from raw UUIDs
  const urlCandidates = allCandidates.filter(
    (c) => c.startsWith("http://") || c.startsWith("https://") || c.startsWith("/") || c.startsWith("data:"),
  );
  const uuidCandidates = allCandidates.filter(
    (c) => !c.startsWith("http://") && !c.startsWith("https://") && !c.startsWith("/") && !c.startsWith("data:"),
  );

  const sortedCandidates = [...urlCandidates, ...uuidCandidates];

  const thumbnail = sortedCandidates.length > 0 ? sortedCandidates[0] : null;
  const gallery = sortedCandidates.length > 1 ? sortedCandidates.slice(1, 5) : [];

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
  const [allergenRows, setAllergenRows] = useState<AllergenRow[]>([]);
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
      setAllergenRows([]);
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

    // ---- Allergen Declarations ----
    const rawAllergens: any[] =
      storedMenuItem?.allergenDeclarations !== undefined && Array.isArray(storedMenuItem.allergenDeclarations) && storedMenuItem.allergenDeclarations.length > 0
        ? storedMenuItem.allergenDeclarations
        : Array.isArray((activeItem as any).allergenDeclarations) && (activeItem as any).allergenDeclarations.length > 0
        ? (activeItem as any).allergenDeclarations
        : Array.isArray(storedFood?.allergens) && storedFood.allergens.length > 0
        ? storedFood.allergens
        : Array.isArray(activeItem.food?.allergens)
        ? (activeItem.food as any).allergens
        : [];

    setAllergenRows(
      rawAllergens
        .map((raw: any) => {
          const allergenUuid =
            typeof raw === "string"
              ? raw
              : raw.allergenUuid || raw.uuid || raw.id || "";
          const found = (allergens as any[]).find(
            (a: any) =>
              a.uuid === allergenUuid ||
              a.code === allergenUuid ||
              (typeof a === "object" && a.id === allergenUuid),
          );
          return {
            allergenUuid: found?.uuid || allergenUuid,
            declarationType: raw.declarationType || "MAY_CONTAIN",
            riskLevel: raw.riskLevel || "MEDIUM",
            verificationStatus: raw.verificationStatus || "VERIFIED",
            notes: raw.notes || "",
          };
        })
        .filter((a) => Boolean(a.allergenUuid)),
    );

    setError(null);
    setFieldErrors({});
  }, [activeItem, item, open, stores, foods, ingredients, dietaryTypes, allergens, storeFixedId]);

  const safeFoods = useMemo(
    () =>
      Array.isArray(foods)
        ? foods
        : (foods as any)?.content ?? (foods as any)?.contents ?? [],
    [foods],
  );

  const safeIngredients = useMemo(
    () =>
      Array.isArray(ingredients)
        ? ingredients
        : (ingredients as any)?.contents ?? [],
    [ingredients],
  );

  const safeDietaryTypes = useMemo(
    () =>
      Array.isArray(dietaryTypes)
        ? dietaryTypes
        : (dietaryTypes as any)?.contents ?? [],
    [dietaryTypes],
  );

  const activeFoods = useMemo(
    () =>
      safeFoods.filter(
        (food) =>
          food.isActive !== false ||
          food.uuid === item?.foodUuid ||
          food.uuid === (item as any)?.food?.uuid ||
          food.uuid === values.foodUuid,
      ),
    [safeFoods, item, values.foodUuid],
  );

  const activeIngredients = useMemo(
    () => safeIngredients.filter((ingredient) => ingredient.isActive !== false),
    [safeIngredients],
  );

  const activeDietaryTypes = useMemo(
    () => safeDietaryTypes.filter((dt) => dt.active !== false),
    [safeDietaryTypes],
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
      nextErrors.foodUuid = "សូមរើសមុខម៉ឺនុយ";
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
        allergenDeclarations: allergenRows
          .filter((r) => Boolean(r.allergenUuid))
          .map((r) => ({
            allergenUuid: r.allergenUuid,
            declarationType: r.declarationType || "MAY_CONTAIN",
            riskLevel: r.riskLevel || "MEDIUM",
            verificationStatus: r.verificationStatus || "VERIFIED",
            notes: r.notes.trim() || null,
          })),
      };

      const targetMenuItemUuid =
        itemUuid ||
        activeItem?.uuid ||
        (activeItem as any)?.menuItemUuid ||
        (activeItem as any)?.id;

      if (targetMenuItemUuid) {
        saveMenuItemRelationsStorage(String(targetMenuItemUuid), {
          dietaryTypes: dietaryTypePayload,
          allergenDeclarations: allergenRows
            .filter((r) => Boolean(r.allergenUuid))
            .map((r) => ({
              allergenUuid: r.allergenUuid,
              declarationType: r.declarationType || "MAY_CONTAIN",
              riskLevel: r.riskLevel || "MEDIUM",
              verificationStatus: r.verificationStatus || "VERIFIED",
              notes: r.notes || null,
            })),
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
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/45 p-4 backdrop-blur-xs">
      <div className="mx-auto my-6 w-full max-w-4xl rounded-[30px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D] border border-emerald-100">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <p className="text-3xl font-normal text-[#137A3D]">
                {item ? "កែប្រែ ម៉ឺនុយ" : "បង្កើត ម៉ឺនុយ សម្រាប់ហាង"}
              </p>
              <p className="mt-1 text-lg font-normal text-gray-500">
                {storeFixedId
                  ? "ជ្រើសរើសមុខម្ហូបមេ កំណត់តម្លៃ គ្រឿងផ្សំ និងរូបភាពដើម្បីដាក់លក់ក្នុងហាងនេះ។"
                  : "ជ្រើសរើសហាង និងមុខម្ហូបមេ រួចកំណត់ព័ត៌មានលម្អិត ដើម្បីផ្សាយម៉ឺនុយលើ FoodHub។"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="បិទ"
            className="rounded-full p-2.5 text-gray-400 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={bodyRef} className="space-y-6 p-7">
          {/* Basic information */}
          <section className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-gray-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#137A3D]">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-normal text-gray-800">ព័ត៌មានមូលដ្ឋាន</h3>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">
                    កំណត់ហាង មុខម្ហូបមេ ឈ្មោះ តម្លៃ និងស្ថានភាពលក់។
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <InfoBadge icon={<CircleDollarSign size={18} />}>
                  {values.price ? `${values.price} ${values.currencyCode || "USD"}` : "មិនទាន់កំណត់តម្លៃ"}
                </InfoBadge>
                <InfoBadge icon={<Clock3 size={18} />}>
                  {values.preparationTimeMinutes ? `${values.preparationTimeMinutes} នាទី` : "មិនទាន់កំណត់ពេល"}
                </InfoBadge>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
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
                  placeholder="ជ្រើសរើសហាង..."
                  invalid={Boolean(fieldErrors.storeUuid)}
                  ariaLabel="ជ្រើសរើសហាង"
                />
                {(Boolean(item) || Boolean(storeFixedId)) && (
                  <p className="mt-2 flex items-center gap-2 text-base font-normal text-emerald-700">
                    <BadgeCheck size={18} className="shrink-0" />
                    ហាងត្រូវបានកំណត់រួចហើយ មិនអាចផ្លាស់ប្តូរបានទេ។
                  </p>
                )}
                <FieldError message={fieldErrors.storeUuid} />
              </div>

              <div>
                <Label required>រើសមុខម៉ឺនុយ</Label>
                <MenuItemSearchableSelect
                  value={values.foodUuid}
                  options={foodOptions}
                  onChange={handleFoodSelect}
                  placeholder="រើសមុខម៉ឺនុយ..."
                  invalid={Boolean(fieldErrors.foodUuid)}
                  ariaLabel="រើសមុខម៉ឺនុយ"
                />
                <FieldError message={fieldErrors.foodUuid} />
              </div>

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div>
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
                  placeholder="ជ្រើសរើសស្ថានភាព..."
                  ariaLabel="ជ្រើសរើសស្ថានភាព"
                />
              </div>

              <div className="md:col-span-2">
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
                  className="w-full rounded-3xl border border-gray-200 bg-white px-5 py-3.5 text-lg font-normal text-gray-700 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white p-6">
            <TabIntro
              icon={<Sparkles size={20} />}
              title="គ្រឿងផ្សំ"
              description="កំណត់គ្រឿងផ្សំ បរិមាណ ខ្នាត និងជម្រើសសម្រាប់មុខម្ហូបនេះ។"
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

            {ingredientRows.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {ingredientRows.map((row, index) => (
                  <div
                    key={index}
                    style={{ zIndex: ingredientRows.length - index + 20 }}
                    className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-emerald-100 hover:shadow"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-normal text-emerald-800">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <MenuItemSearchableSelect
                        value={row.ingredientUuid}
                        options={ingredientOptions}
                        onChange={(next) =>
                          updateIngredientRow(index, { ingredientUuid: next })
                        }
                        placeholder="ជ្រើសរើសគ្រឿងផ្សំ..."
                        ariaLabel="ជ្រើសរើសគ្រឿងផ្សំ"
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="បរិមាណ"
                        value={row.quantity}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") e.preventDefault();
                        }}
                        onChange={(event) => {
                          const val = event.target.value;
                          if (Number(val) < 0) return;
                          updateIngredientRow(index, { quantity: val });
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div className="w-28">
                      <input
                        placeholder="ខ្នាត (g, ml)"
                        value={row.unit}
                        onChange={(event) =>
                          updateIngredientRow(index, { unit: event.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-base font-normal text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50/40">
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
                      <span className="whitespace-nowrap">ជាជម្រើស</span>
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
              </div>
            ) : (
              <div className="mt-4">
                <EmptyRowsHint text="មិនទាន់បានបន្ថែមគ្រឿងផ្សំទេ។" />
              </div>
            )}
          </section>

          {/* Dietary types */}
          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white p-6">
            <TabIntro
              icon={<Heart size={20} />}
              title="របបអាហារ"
              description="សម្គាល់របបអាហារ និងស្ថានភាពផ្ទៀងផ្ទាត់សម្រាប់ម៉ឺនុយនេះ។"
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

            {dietaryTypeRows.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {dietaryTypeRows.map((row, index) => (
                  <div
                    key={index}
                    style={{ zIndex: dietaryTypeRows.length - index + 20 }}
                    className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-emerald-100 hover:shadow"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-normal text-emerald-800">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <MenuItemSearchableSelect
                        value={row.dietaryTypeUuid}
                        options={dietaryTypeOptions}
                        onChange={(next) =>
                          updateDietaryTypeRow(index, { dietaryTypeUuid: next })
                        }
                        placeholder="ជ្រើស Dietary Type..."
                        ariaLabel="ជ្រើស Dietary Type"
                      />
                    </div>

                    <div className="w-44">
                      <MenuItemSearchableSelect
                        value={row.verificationStatus}
                        options={verificationStatusOptions}
                        onChange={(next) =>
                          updateDietaryTypeRow(index, {
                            verificationStatus: next,
                          })
                        }
                        placeholder="ជ្រើសរើសស្ថានភាព..."
                        ariaLabel="ជ្រើសរើសស្ថានភាព"
                      />
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <input
                        placeholder="កំណត់ចំណាំ (Notes)..."
                        value={row.notes}
                        onChange={(event) =>
                          updateDietaryTypeRow(index, { notes: event.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <RemoveRowButton
                      onClick={() =>
                        setDietaryTypeRows((current) =>
                          current.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyRowsHint text="មិនទាន់បានកំណត់របបអាហារទេ។" />
              </div>
            )}
          </section>

          {/* Allergen Declarations */}
          <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/40 to-white p-6">
            <TabIntro
              icon={<ShieldAlert size={20} />}
              title="សារធាតុអាឡែហ្ស៊ី (Allergens)"
              description="សម្គាល់ប្រភេទអាឡែហ្ស៊ី ប្រភេទការប្រកាស និងកម្រិតហានិភ័យ។"
              onAdd={() =>
                setAllergenRows((current) => [
                  ...current,
                  {
                    allergenUuid: "",
                    declarationType: "MAY_CONTAIN",
                    riskLevel: "MEDIUM",
                    verificationStatus: "VERIFIED",
                    notes: "",
                  },
                ])
              }
              addLabel="បន្ថែមអាឡែហ្ស៊ី"
            />

            {allergenRows.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {allergenRows.map((row, index) => (
                  <div
                    key={index}
                    style={{ zIndex: allergenRows.length - index + 20 }}
                    className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-rose-100 hover:shadow"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-base font-normal text-rose-700">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <MenuItemSearchableSelect
                        value={row.allergenUuid}
                        options={(allergens as any[]).map((a: any) => ({
                          value: a.uuid || a.id || "",
                          label: (a as any).localName || a.name || a.code || "",
                          sublabel: a.code,
                        }))}
                        onChange={(next) =>
                          setAllergenRows((current) =>
                            current.map((r, i) => i === index ? { ...r, allergenUuid: next } : r)
                          )
                        }
                        placeholder="ជ្រើសអាឡែហ្ស៊ី..."
                        ariaLabel="ជ្រើសអាឡែហ្ស៊ី"
                      />
                    </div>

                    <div className="w-36">
                      <MenuItemSearchableSelect
                        value={row.declarationType}
                        options={[
                          { value: "CONTAINS", label: "មាន" },
                          { value: "MAY_CONTAIN", label: "អាចមាន" },
                        ]}
                        onChange={(next) =>
                          setAllergenRows((current) =>
                            current.map((r, i) => i === index ? { ...r, declarationType: next } : r)
                          )
                        }
                        placeholder="ប្រភេទ..."
                        ariaLabel="ជ្រើសប្រភេទ"
                      />
                    </div>

                    <div className="w-36">
                      <MenuItemSearchableSelect
                        value={row.verificationStatus}
                        options={verificationStatusOptions}
                        onChange={(next) =>
                          setAllergenRows((current) =>
                            current.map((r, i) => i === index ? { ...r, verificationStatus: next } : r)
                          )
                        }
                        placeholder="ស្ថានភាព..."
                        ariaLabel="ជ្រើសស្ថានភាពផ្ទៀងផ្ទាត់"
                      />
                    </div>

                    <div className="flex-1 min-w-[160px]">
                      <input
                        placeholder="កំណត់ចំណាំ (Notes)..."
                        value={row.notes}
                        onChange={(event) =>
                          setAllergenRows((current) =>
                            current.map((r, i) => i === index ? { ...r, notes: event.target.value } : r)
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <RemoveRowButton
                      onClick={() =>
                        setAllergenRows((current) =>
                          current.filter((_, rowIndex) => rowIndex !== index)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyRowsHint text="មិនទាន់បានកំណត់សារធាតុអាឡែហ្ស៊ីទេ។" />
              </div>
            )}
          </section>

          {/* Medical conditions */}
          <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/40 to-white p-6">
            <TabIntro
              icon={<HeartPulse size={20} />}
              title="ស្ថានភាពសុខភាព"
              description="កំណត់ថាម៉ឺនុយនេះសមរម្យ គួរប្រុងប្រយ័ត្ន ឬហាមឃាត់សម្រាប់ស្ថានភាពសុខភាពណាមួយ។"
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

            {medicalConditionRows.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {medicalConditionRows.map((row, index) => (
                  <div
                    key={index}
                    style={{ zIndex: medicalConditionRows.length - index + 20 }}
                    className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-violet-100 hover:shadow"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-base font-normal text-violet-800">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-[200px]">
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
                        placeholder="ជ្រើសស្ថានភាពសុខភាព..."
                        ariaLabel="ជ្រើសស្ថានភាពសុខភាព"
                      />
                    </div>

                    <div className="w-48">
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
                        placeholder="ជ្រើសរើសសមរម្យភាព..."
                        ariaLabel="ជ្រើសរើសសមរម្យភាព"
                      />
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <input
                        placeholder="កំណត់ចំណាំ (Notes)..."
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
                    </div>

                    <RemoveRowButton
                      onClick={() =>
                        setMedicalConditionRows((current) =>
                          current.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyRowsHint text="មិនទាន់បានកំណត់ស្ថានភាពសុខភាពទេ។" />
              </div>
            )}
          </section>

          {/* Images */}
          <section className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-200/60 pb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#137A3D]">
                <ImagePlus size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-normal text-gray-800">រូបភាពម៉ឺនុយ</h3>
                <p className="mt-0.5 text-lg font-normal text-gray-500">
                  បន្ថែម Thumbnail មួយ និង Gallery រហូតដល់ ៤ រូប ដើម្បីបង្ហាញម៉ឺនុយឱ្យច្បាស់។
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <ThumbnailImagePicker
                value={thumbnailFile}
                onChange={(file) => {
                  setThumbnailFile(file);
                  setFieldErrors((current) => ({ ...current, thumbnail: undefined }));
                }}
                existingUrl={existingThumbnail}
                onExistingChange={(newUrl) => {
                  if (!newUrl && existingGallery.length > 0) {
                    setExistingThumbnail(existingGallery[0]);
                    setExistingGallery((curr) => curr.slice(1));
                  } else {
                    setExistingThumbnail(newUrl);
                  }
                }}
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
          </section>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg font-normal text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-full border border-gray-200 px-8 py-3.5 text-xl font-normal text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#137A3D] px-8 py-3.5 text-xl font-normal text-white shadow-md hover:bg-emerald-800 disabled:opacity-60 transition active:scale-95 cursor-pointer"
            >
              {saving ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Save size={22} />
              )}
              {item ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកមុខម្ហូប"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-[#137A3D] focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

function Label({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 flex items-center gap-1 text-lg font-normal text-gray-700">
      <span>{children}</span>
      {required && <span className="ml-0.5 text-red-500 font-normal">*</span>}
    </span>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-lg font-normal text-gray-600">
      {children}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-base font-normal text-red-600">
      <AlertCircle size={16} className="shrink-0" />
      <span>{message}</span>
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
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        min={min}
        step={step}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid}
        onKeyDown={(e) => {
          if (
            type === "number" &&
            min !== undefined &&
            Number(min) >= 0 &&
            (e.key === "-" || e.key === "e")
          ) {
            e.preventDefault();
          }
        }}
        onChange={(event) => {
          const nextVal = event.target.value;
          if (
            type === "number" &&
            min !== undefined &&
            Number(min) >= 0 &&
            Number(nextVal) < 0
          ) {
            return;
          }
          onChange(nextVal);
        }}
        className={`${inputClass} ${
          invalid
            ? "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : ""
        }`}
      />
      <FieldError message={error} />
    </div>
  );
}

function TabIntro({
  icon,
  title,
  description,
  onAdd,
  addLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#137A3D]">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-normal text-gray-800">{title}</h3>
          <p className="mt-0.5 text-lg font-normal text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 cursor-pointer whitespace-nowrap"
      >
        <Plus size={18} />
        {addLabel}
      </button>
    </div>
  );
}

function InfoBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-base font-normal text-gray-600">
      {icon}
      {children}
    </span>
  );
}

function EmptyRowsHint({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white/70 px-5 py-4 text-center text-lg font-normal text-gray-400">
      {text}
    </div>
  );
}

function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95"
      title="លុបជួរនេះចេញ"
      aria-label="លុបជួរនេះចេញ"
    >
      <Trash2 size={18} />
    </button>
  );
}