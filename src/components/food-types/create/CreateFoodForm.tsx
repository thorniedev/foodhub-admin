"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";



import ImageUploadGrid from "./ImageUploadGrid";
import ClassificationSection from "./ClassificationSection";
import FoodDetailsSection from "./FoodDetailsSection";
import RestaurantSection from "./RestaurantSection";
import LocationSection from "./LocationSection";

import { useCreateMenuItemMutation } from "@/src/app/store/menuItemApi";
import type {
  AgeGroupKey,
  DietSuitabilityKey,
  FoodCategoryKey,
} from "@/src/types/createFood";
import type {
  CodeName,
  CreateMenuItemPayload,
  DietaryType,
  StoreRef,
} from "@/src/types/menuItem";

interface CreateFoodFormProps {
  restaurants: StoreRef[];
}

type SubmitMode = "draft" | "published";

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 1024 * 1024;

const CATEGORY_MAP: Record<FoodCategoryKey, CodeName> = {
  khmerFood: {
    code: "KHMER_FOOD",
    name: "Khmer Food",
  },
  fastFood: {
    code: "FAST_FOOD",
    name: "Fast Food",
  },
  chineseFood: {
    code: "CHINESE_FOOD",
    name: "Chinese Food",
  },
  other: {
    code: "OTHER",
    name: "Other",
  },
};

const AGE_GROUP_MAP: Record<AgeGroupKey, CodeName> = {
  infant0to6m: {
    code: "INFANT_0_6_MONTHS",
    name: "Infant 0-6 months",
  },
  infant6to12m: {
    code: "INFANT_6_12_MONTHS",
    name: "Infant 6-12 months",
  },
  toddler1to3y: {
    code: "TODDLER_1_3_YEARS",
    name: "Toddler 1-3 years",
  },
  child4to12y: {
    code: "CHILD",
    name: "Child",
  },
  teen13to17y: {
    code: "TEEN",
    name: "Teen",
  },
  adult18to59y: {
    code: "ADULT",
    name: "Adult",
  },
  elderly60plus: {
    code: "SENIOR",
    name: "Senior",
  },
};

const DIETARY_MAP: Record<DietSuitabilityKey, DietaryType> = {
  halal: {
    code: "HALAL",
    name: "ហាឡាល់",
    verificationStatus: "UNVERIFIED",
  },
  glutenFree: {
    code: "GLUTEN_FREE",
    name: "គ្មានជាតិស្អិត",
    verificationStatus: "UNVERIFIED",
  },
  vegetarian: {
    code: "VEGETARIAN",
    name: "បួស",
    verificationStatus: "UNVERIFIED",
  },
  dairyFree: {
    code: "DAIRY_FREE",
    name: "គ្មានទឹកដោះគោ",
    verificationStatus: "UNVERIFIED",
  },
  nutFree: {
    code: "NUT_FREE",
    name: "គ្មានគ្រាប់ធញ្ញជាតិ",
    verificationStatus: "UNVERIFIED",
  },
  lowCarb: {
    code: "LOW_CARB",
    name: "កាបូអ៊ីដ្រាតទាប",
    verificationStatus: "UNVERIFIED",
  },
};

function createUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read image."));
    };

    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function buildStoreAddress(store: StoreRef): string {
  return [store.addressLine, store.district, store.city]
    .filter(Boolean)
    .join(", ");
}

export default function CreateFoodForm({
  restaurants,
}: CreateFoodFormProps) {
  const router = useRouter();
  const [createMenuItem, { isLoading }] = useCreateMenuItemMutation();

  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState<FoodCategoryKey>("khmerFood");
  const [ageGroups, setAgeGroups] = useState<AgeGroupKey[]>([
    "adult18to59y",
  ]);
  const [dietSuitability, setDietSuitability] = useState<
    DietSuitabilityKey[]
  >(["halal"]);
  const [customTags, setCustomTags] = useState<string[]>(["ហាឡាល់"]);
  const [foodName, setFoodName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<StoreRef | null>(null);
  const [address, setAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddImages = async (files: FileList) => {
    setErrorMessage("");

    const remainingSlots = MAX_IMAGES - images.length;
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFile) {
      setErrorMessage("សូមជ្រើសរើសតែឯកសាររូបភាព។");
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_BYTES,
    );

    if (oversizedFile) {
      setErrorMessage("រូបភាពនីមួយៗត្រូវមានទំហំតិចជាង 1 MB។");
      return;
    }

    try {
      const imageUrls = await Promise.all(selectedFiles.map(fileToDataUrl));
      setImages((currentImages) => [...currentImages, ...imageUrls]);
    } catch (error) {
      console.error("Failed to read selected images:", error);
      setErrorMessage("មិនអាចអានរូបភាពបានទេ។");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleSelectRestaurant = (restaurant: StoreRef) => {
    setSelectedRestaurant(restaurant);
    setAddress(buildStoreAddress(restaurant));
    setErrorMessage("");
  };

  const validate = (mode: SubmitMode): string | null => {
    if (!foodName.trim()) {
      return "សូមបញ្ចូលឈ្មោះម្ហូប។";
    }

    if (!selectedRestaurant) {
      return "សូមជ្រើសរើសភោជនីយដ្ឋាន។";
    }

    if (mode === "published" && !description.trim()) {
      return "សូមបញ្ចូលការពិពណ៌នាម្ហូប។";
    }

    return null;
  };

  const buildPayload = (mode: SubmitMode): CreateMenuItemPayload => {
    if (!selectedRestaurant) {
      throw new Error("Restaurant is required.");
    }

    const categoryValue = CATEGORY_MAP[category];
    const cuisineValue: CodeName =
      category === "chineseFood"
        ? { code: "CHINESE_FOOD", name: "Chinese" }
        : { code: "KHMER", name: "Khmer" };

    return {
      name: foodName.trim(),
      localName: foodName.trim(),
      description: description.trim(),
      localDescription: description.trim(),
      thumbnail: images[0] ?? null,
      gallery: images,
      price: 0,
      currencyCode: "USD",
      preparationTimeMinutes: 10,
      availabilityStatus:
        mode === "published" ? "AVAILABLE" : "UNAVAILABLE",
      isFeatured: false,
      source: "MANUAL",
      store: {
        ...selectedRestaurant,
        addressLine: address.trim() || selectedRestaurant.addressLine,
      },
      food: {
        uuid: createUuid(),
        canonicalName: foodName.trim(),
        category: categoryValue,
        cuisine: cuisineValue,
        spiceLevel: 0,
        ageGroups: ageGroups.map((ageGroup) => AGE_GROUP_MAP[ageGroup]),
      },
      mealTypes: [
        {
          code: "LUNCH",
          name: "Lunch",
        },
      ],
      dietaryTypes: dietSuitability.map(
        (dietaryType) => DIETARY_MAP[dietaryType],
      ),
      allergenDeclarations: [],
      ingredients: customTags,
      beveragePairings: [],
      nutrition: {},
    };
  };

  const submit = async (mode: SubmitMode) => {
    const validationError = validate(mode);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");

    try {
      await createMenuItem(buildPayload(mode)).unwrap();
      router.push("/food-types/dishes");
      router.refresh();
    } catch (error) {
      console.error("Failed to create menu item:", error);
      setErrorMessage("មិនអាចរក្សាទុកម្ហូបបានទេ។ សូមព្យាយាមម្តងទៀត។");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <ImageUploadGrid
        images={images}
        onAdd={handleAddImages}
        onRemove={handleRemoveImage}
      />

      <ClassificationSection
        category={category}
        onCategoryChange={setCategory}
        ageGroups={ageGroups}
        onAgeGroupsChange={setAgeGroups}
        dietSuitability={dietSuitability}
        onDietSuitabilityChange={setDietSuitability}
        customTags={customTags}
        onCustomTagsChange={setCustomTags}
      />

      <FoodDetailsSection
        foodName={foodName}
        onFoodNameChange={setFoodName}
        description={description}
        onDescriptionChange={setDescription}
      />

      <RestaurantSection
        restaurants={restaurants}
        selectedRestaurantUuid={selectedRestaurant?.uuid ?? ""}
        onSelect={handleSelectRestaurant}
      />

      <LocationSection address={address} onAddressChange={setAddress} />

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={isLoading}
          className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl border-2 border-[#136C34] px-6 py-3 text-sm font-medium text-[#136C34] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Save Draft
        </button>

        <button
          type="button"
          onClick={() => submit("published")}
          disabled={isLoading}
          className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-[#136C34] px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          Publish Post
        </button>
      </div>
    </div>
  );
}
