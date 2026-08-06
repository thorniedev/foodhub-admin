// "use client";

// import { useState } from "react";
// import { Sparkles } from "lucide-react";

// import ImageUploadGrid from "./ImageUploadGrid";
// import ClassificationSection from "./ClassificationSection";
// import FoodDetailsSection from "./FoodDetailsSection";
// import RestaurantSection from "./RestaurantSection";
// import LocationSection from "./LocationSection";

// interface Restaurant {
//   id: string;
//   name: string;
// }

// interface CreateFoodFormProps {
//   restaurants: Restaurant[];
//   onSaveDraft: (data: FoodDraft) => void;
//   onPublish: (data: FoodDraft) => void;
// }

// export interface FoodDraft {
//   images: string[];
//   foodType: string;
//   ageTags: string[];
//   dietTags: string[];
//   name: string;
//   description: string;
//   restaurantId: string | null;
//   location: string;
// }

// export default function CreateFoodForm({
//   restaurants,
//   onSaveDraft,
//   onPublish,
// }: CreateFoodFormProps) {
//   const [images, setImages] = useState<string[]>([]);
//   const [foodType, setFoodType] = useState("");
//   const [ageTags, setAgeTags] = useState<string[]>([]);
//   const [dietTags, setDietTags] = useState<string[]>(["ហាឡាល់"]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [restaurantId, setRestaurantId] = useState<string | null>(null);
//   const [location, setLocation] = useState("");

//   const buildDraft = (): FoodDraft => ({
//     images,
//     foodType,
//     ageTags,
//     dietTags,
//     name,
//     description,
//     restaurantId,
//     location,
//   });

//   const toggle = (list: string[], setList: (v: string[]) => void, tag: string) => {
//     setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
//   };

//   const removeTag = (tag: string) => {
//     setAgeTags((prev) => prev.filter((t) => t !== tag));
//     setDietTags((prev) => prev.filter((t) => t !== tag));
//   };

//   const handleAddImages = (files: FileList) => {
//     const urls = Array.from(files).map((f) => URL.createObjectURL(f));
//     setImages((prev) => [...prev, ...urls]);
//   };

//   return (
//     <div className="space-y-6 pb-24">
//       <ImageUploadGrid
//         images={images}
//         onAddImages={handleAddImages}
//         onRemoveImage={(i) => setImages((prev) => prev.filter((_, idx) => idx !== i))}
//       />

//       <ClassificationSection
//         foodType={foodType}
//         onFoodTypeChange={setFoodType}
//         ageTags={ageTags}
//         onToggleAgeTag={(tag) => toggle(ageTags, setAgeTags, tag)}
//         dietTags={dietTags}
//         onToggleDietTag={(tag) => toggle(dietTags, setDietTags, tag)}
//         onAddCustomTag={(tag) => setDietTags((prev) => [...prev, tag])}
//         onRemoveTag={removeTag}
//       />

//       <FoodDetailsSection
//         name={name}
//         onNameChange={setName}
//         description={description}
//         onDescriptionChange={setDescription}
//       />

//       <RestaurantSection
//         restaurants={restaurants}
//         selectedRestaurantId={restaurantId}
//         onSelect={setRestaurantId}
//       />

//       <LocationSection location={location} onLocationChange={setLocation} />

//       <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
//         <button
//           type="button"
//           onClick={() => onSaveDraft(buildDraft())}
//           className="px-6 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
//         >
//           Save Draft
//         </button>
//         <button
//           type="button"
//           onClick={() => onPublish(buildDraft())}
//           className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#136C34] hover:bg-emerald-700 rounded-xl"
//         >
//           <Sparkles size={16} /> Publish Post
//         </button>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { Plus, Tags, X } from "lucide-react";

import type {
  AgeGroupKey,
  DietSuitabilityKey,
  FoodCategoryKey,
} from "@/src/types/createFood";

interface ClassificationSectionProps {
  category: FoodCategoryKey;
  onCategoryChange: (value: FoodCategoryKey) => void;
  ageGroups: AgeGroupKey[];
  onAgeGroupsChange: (value: AgeGroupKey[]) => void;
  dietSuitability: DietSuitabilityKey[];
  onDietSuitabilityChange: (value: DietSuitabilityKey[]) => void;
  customTags: string[];
  onCustomTagsChange: (value: string[]) => void;
}

const CATEGORY_OPTIONS: Array<{
  value: FoodCategoryKey;
  label: string;
}> = [
  { value: "khmerFood", label: "ម្ហូបខ្មែរ" },
  { value: "fastFood", label: "អាហាររហ័ស" },
  { value: "chineseFood", label: "ម្ហូបចិន" },
  { value: "other", label: "ផ្សេងៗ" },
];

const AGE_OPTIONS: Array<{
  value: AgeGroupKey;
  label: string;
}> = [
  { value: "infant0to6m", label: "0–6 ខែ" },
  { value: "infant6to12m", label: "6–12 ខែ" },
  { value: "toddler1to3y", label: "1–3 ឆ្នាំ" },
  { value: "child4to12y", label: "4–12 ឆ្នាំ" },
  { value: "teen13to17y", label: "13–17 ឆ្នាំ" },
  { value: "adult18to59y", label: "18–59 ឆ្នាំ" },
  { value: "elderly60plus", label: "60 ឆ្នាំឡើង" },
];

const DIET_OPTIONS: Array<{
  value: DietSuitabilityKey;
  label: string;
}> = [
  { value: "halal", label: "ហាឡាល់" },
  { value: "glutenFree", label: "គ្មានជាតិ Gluten" },
  { value: "vegetarian", label: "បួស" },
  { value: "dairyFree", label: "គ្មានទឹកដោះគោ" },
  { value: "nutFree", label: "គ្មានគ្រាប់ធញ្ញជាតិ" },
  { value: "lowCarb", label: "កាបូអ៊ីដ្រាតទាប" },
];

function toggleValue<T extends string>(current: T[], value: T): T[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export default function ClassificationSection({
  category,
  onCategoryChange,
  ageGroups,
  onAgeGroupsChange,
  dietSuitability,
  onDietSuitabilityChange,
  customTags,
  onCustomTagsChange,
}: ClassificationSectionProps) {
  const [customTag, setCustomTag] = useState("");

  const addCustomTag = () => {
    const normalizedTag = customTag.trim();

    if (!normalizedTag || customTags.includes(normalizedTag)) {
      return;
    }

    onCustomTagsChange([...customTags, normalizedTag]);
    setCustomTag("");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Tags size={20} className="text-[#136C34]" />
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
          ការចាត់ថ្នាក់
        </h2>
      </div>

      <div>
        <label
          htmlFor="food-category"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          ប្រភេទម្ហូប
        </label>

        <select
          id="food-category"
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as FoodCategoryKey)
          }
          className="w-full rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-600">
          សាកសមសម្រាប់ក្រុមអាយុ
        </p>

        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((option) => {
            const selected = ageGroups.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onAgeGroupsChange(toggleValue(ageGroups, option.value))
                }
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[#136C34] bg-[#136C34] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-600">
          សាកសមសម្រាប់របបអាហារ
        </p>

        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((option) => {
            const selected = dietSuitability.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onDietSuitabilityChange(
                    toggleValue(dietSuitability, option.value),
                  )
                }
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[#136C34] bg-[#136C34] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="custom-tag"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          គ្រឿងផ្សំ ឬស្លាកបន្ថែម
        </label>

        <div className="flex gap-2">
          <input
            id="custom-tag"
            value={customTag}
            onChange={(event) => setCustomTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="បញ្ចូលគ្រឿងផ្សំ..."
            className="min-w-0 flex-1 rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="button"
            onClick={addCustomTag}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#136C34] text-white hover:bg-emerald-700"
            aria-label="Add custom tag"
          >
            <Plus size={18} />
          </button>
        </div>

        {customTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    onCustomTagsChange(
                      customTags.filter((currentTag) => currentTag !== tag),
                    )
                  }
                  aria-label={`Remove ${tag}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
