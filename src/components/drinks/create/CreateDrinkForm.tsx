"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateDrinkMutation } from "@/src/app/store/drinkApi";
import { AgeGroupKey } from "@/src/types/createDrink";
import DrinkImageUploadGrid from "./DrinkImageUploadGrid";
import DrinkClassificationSection from "./DrinkClassificationSection";
import DrinkDetailsSection from "./DrinkDetailsSection";
import DrinkShopSection from "./DrinkShopSection";
// import DrinkLocationSection from "./DrinkLocationSection";

export default function CreateDrinkForm() {
  const router = useRouter();
  const [createDrink, { isLoading }] = useCreateDrinkMutation();

  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState("hot");
  const [ageGroups, setAgeGroups] = useState<AgeGroupKey[]>(["adult18to59y"]);
  const [sugarLevel, setSugarLevel] = useState("ធម្មតា");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [drinkName, setDrinkName] = useState("");
  const [description, setDescription] = useState("");
  const [shopId, setShopId] = useState("");
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");

  const handleAddImages = (files: FileList) => {
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectShop = (id: string, name: string, addr: string) => {
    setShopId(id);
    setShopName(name);
    if (!address) setAddress(addr);
  };

  const buildPayload = (status: "draft" | "published") => ({
    images,
    category,
    ageGroups,
    sugarLevel,
    customTags,
    drinkName,
    description,
    shopId,
    shopName,
    address,
    status,
  });

  const handleSaveDraft = async () => {
    await createDrink(buildPayload("draft"));
    router.push("/dashboard/food-types/drinks");
  };

  const handlePublish = async () => {
    if (!drinkName.trim() || !description.trim() || !shopId) return;
    await createDrink(buildPayload("published"));
    router.push("/dashboard/food-types/drinks");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <DrinkImageUploadGrid
        images={images}
        onAdd={handleAddImages}
        onRemove={handleRemoveImage}
      />

      <DrinkClassificationSection
        category={category}
        onCategoryChange={setCategory}
        ageGroups={ageGroups}
        onAgeGroupsChange={setAgeGroups}
        sugarLevel={sugarLevel}
        onSugarLevelChange={setSugarLevel}
        customTags={customTags}
        onCustomTagsChange={setCustomTags}
      />

      <DrinkDetailsSection
        drinkName={drinkName}
        onDrinkNameChange={setDrinkName}
        description={description}
        onDescriptionChange={setDescription}
      />

      <DrinkShopSection
        shopId={shopId}
        shopName={shopName}
        onSelect={handleSelectShop}
      />

      {/* <DrinkLocationSection address={address} onAddressChange={setAddress} /> */}

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