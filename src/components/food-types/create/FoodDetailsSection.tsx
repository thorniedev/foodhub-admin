"use client";

import { Utensils } from "lucide-react";

interface FoodDetailsSectionProps {
  foodName: string;
  onFoodNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const NAME_LIMIT = 80;
const DESCRIPTION_LIMIT = 500;

export default function FoodDetailsSection({
  foodName,
  onFoodNameChange,
  description,
  onDescriptionChange,
}: FoodDetailsSectionProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
        <Utensils size={18} className="text-emerald-600" />
        ព័ត៌មានលម្អិតអំពីអាហារ
      </h2>

      <div className="mb-5">
        <label className="text-sm text-gray-600 mb-1 block">
          ឈ្មោះអាហារ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={foodName}
          maxLength={NAME_LIMIT}
          onChange={(e) => onFoodNameChange(e.target.value)}
          placeholder="ឧទាហរណ៍: គុយទាវសាច់គោ"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-gray-400 text-right mt-1">
          {foodName.length}/{NAME_LIMIT}
        </p>
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">
          ការពិពណ៌នា <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          maxLength={DESCRIPTION_LIMIT}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="ពិពណ៌នាអំពីសាច់អាហារ ជាមួយគ្រឿងផ្សំ និងអ្វីៗដែលធ្វើឲ្យម្ហូបនេះពិសេស។"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400">Min. 50 characters recommended</p>
          <p className="text-xs text-gray-400">
            {description.length}/{DESCRIPTION_LIMIT}
          </p>
        </div>
      </div>
    </div>
  );
}