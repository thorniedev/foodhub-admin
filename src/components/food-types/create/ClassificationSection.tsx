"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AgeGroupKey, DietSuitabilityKey } from "@/src/types/createFood";

interface ClassificationSectionProps {
  category: string;
  onCategoryChange: (value: string) => void;
  ageGroups: AgeGroupKey[];
  onAgeGroupsChange: (value: AgeGroupKey[]) => void;
  dietSuitability: DietSuitabilityKey[];
  onDietSuitabilityChange: (value: DietSuitabilityKey[]) => void;
  customTags: string[];
  onCustomTagsChange: (value: string[]) => void;
}

const CATEGORY_OPTIONS = [
  { value: "general", label: "ជ្រើសប្រភេទអាហារ (មូប, បង្អែម, ភេសជ្ជៈ...)" },
  { value: "noodle", label: "មូប" },
  { value: "dessert", label: "បង្អែម" },
  { value: "drink", label: "ភេសជ្ជៈ" },
];

const AGE_OPTIONS: { key: AgeGroupKey; label: string }[] = [
  { key: "infant0to6m", label: "0-6 ខែ" },
  { key: "infant6to12m", label: "6-12 ខែ" },
  { key: "toddler1to3y", label: "1-3 ឆ្នាំ" },
  { key: "child4to12y", label: "4-12 ឆ្នាំ" },
  { key: "teen13to17y", label: "13-17 ឆ្នាំ" },
  { key: "adult18to59y", label: "18-59 ឆ្នាំ" },
  { key: "elderly60plus", label: "60 ឆ្នាំឡើង" },
];

const DIET_OPTIONS: { key: DietSuitabilityKey; label: string }[] = [
  { key: "halal", label: "ហាឡាល់" },
  { key: "glutenFree", label: "គ្មានជាតិ Gluten" },
  { key: "vegetarian", label: "មូបបួស" },
  { key: "dairyFree", label: "គ្មានទឹកដោះគោ" },
  { key: "nutFree", label: "គ្មានគ្រឿងផ្សំជាតិសែន" },
  { key: "lowCarb", label: "អាហារកាបូអ៊ីដ្រាតទាប" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
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
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || customTags.includes(trimmed)) return;
    onCustomTagsChange([...customTags, trimmed]);
    setTagInput("");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">ការចាត់ថ្នាក់</h2>

      <div className="mb-5">
        <label className="text-sm text-gray-600 mb-2 block">ប្រភេទ</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="text-sm text-gray-600 mb-2 block">
          ស្លាកសញ្ញាអាហារតាមអាយុ
        </label>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((opt) => {
            const active = ageGroups.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => onAgeGroupsChange(toggle(ageGroups, opt.key))}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-2 block">
          ស្លាកសញ្ញាសម្រាប់របបអាហារ
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {DIET_OPTIONS.map((opt) => {
            const active = dietSuitability.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() =>
                  onDietSuitabilityChange(toggle(dietSuitability, opt.key))
                }
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="បន្ថែមស្លាកផ្ទាល់ខ្លួន..."
            className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleAddTag}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-2.5"
          >
            <Plus size={18} />
          </button>
        </div>

        {customTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-medium px-3 py-1 rounded-full"
              >
                {tag}
                <button
                  onClick={() =>
                    onCustomTagsChange(customTags.filter((t) => t !== tag))
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}