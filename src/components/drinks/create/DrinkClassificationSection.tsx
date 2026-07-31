"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AgeGroupKey } from "@/src/types/createDrink";

interface DrinkClassificationSectionProps {
  category: string;
  onCategoryChange: (value: string) => void;
  ageGroups: AgeGroupKey[];
  onAgeGroupsChange: (value: AgeGroupKey[]) => void;
  sugarLevel: string;
  onSugarLevelChange: (value: string) => void;
  customTags: string[];
  onCustomTagsChange: (value: string[]) => void;
}

const CATEGORY_OPTIONS = [
  { value: "hot", label: "ភេសជ្ជៈក្តៅ" },
  { value: "cold", label: "ភេសជ្ជៈត្រជាក់" },
  { value: "juice", label: "ទឹកផ្លែឈើ" },
  { value: "other", label: "ភេសជ្ជៈផ្សេងៗ" },
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

const SUGAR_OPTIONS = ["គ្មាន", "តិច", "ធម្មតា", "ច្រើន"];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function DrinkClassificationSection({
  category,
  onCategoryChange,
  ageGroups,
  onAgeGroupsChange,
  sugarLevel,
  onSugarLevelChange,
  customTags,
  onCustomTagsChange,
}: DrinkClassificationSectionProps) {
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
          ស្លាកសញ្ញាភេសជ្ជៈតាមអាយុ
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
        <label className="text-sm text-gray-600 mb-2 block">កម្រិតជាតិស្ករ</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGAR_OPTIONS.map((opt) => {
            const active = sugarLevel === opt;
            return (
              <button
                key={opt}
                onClick={() => onSugarLevelChange(opt)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt}
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