"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { useCreateFoodTypeMutation } from "@/store/foodTypeApi";
// import { AgeGroupKey, DietSuitabilityKey } from "@/types/createFood";
import ImageUploadGrid from "./ImageUploadGrid";
import ClassificationSection from "./ClassificationSection";
// import FoodDetailsSection from "./FoodDetailsSection";
import RestaurantSection from "./RestaurantSection";
import LocationSection from "./LocationSection";
import { useCreateFoodTypeMutation } from "@/src/app/store/foodTypeApi";
import { AgeGroupKey, DietSuitabilityKey } from "@/src/types/createFood";
import FoodDetailsSection from "./FoodDetailsSection";

export default function CreateFoodForm() {
  const router = useRouter();
  const [createFoodType, { isLoading }] = useCreateFoodTypeMutation();

  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("general");
  const [ageGroups, setAgeGroups] = useState<AgeGroupKey[]>(["infant0to6m"]);
  const [dietSuitability, setDietSuitability] = useState<DietSuitabilityKey[]>([
    "halal",
  ]);
  const [customTags, setCustomTags] = useState<string[]>(["ហាឡាល់"]);
  const [foodName, setFoodName] = useState("");
  const [description, setDescription] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");

  const handleAddImages = (files: FileList) => {
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectRestaurant = (id: string, name: string, addr: string) => {
    setRestaurantId(id);
    setRestaurantName(name);
    if (!address) setAddress(addr);
  };

  const buildPayload = (status: "draft" | "published") => ({
    images,
    category,
    ageGroups,
    dietSuitability,
    customTags,
    foodName,
    description,
    restaurantId,
    restaurantName,
    address,
    status,
  });

  const handleSaveDraft = async () => {
    await createFoodType(buildPayload("draft"));
    router.push("/dashboard/food-types/dishes");
  };

  const handlePublish = async () => {
    if (!foodName.trim() || !description.trim() || !restaurantId) return;
    await createFoodType(buildPayload("published"));
    router.push("/dashboard/food-types/dishes");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
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
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        onSelect={handleSelectRestaurant}
      />

      <LocationSection address={address} onAddressChange={setAddress} />

      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          onClick={handlePublish}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
        >
          ✨ Publish Post
        </button>
      </div>
    </div>
  );
}