"use client";

import { GlassWater } from "lucide-react";

interface DrinkDetailsSectionProps {
  drinkName: string;
  onDrinkNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const NAME_LIMIT = 80;
const DESCRIPTION_LIMIT = 500;

export default function DrinkDetailsSection({
  drinkName,
  onDrinkNameChange,
  description,
  onDescriptionChange,
}: DrinkDetailsSectionProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
        <GlassWater size={18} className="text-emerald-600" />
        ព័ត៌មានលម្អិតអំពីភេសជ្ជៈ
      </h2>

      <div className="mb-5">
        <label className="text-sm text-gray-600 mb-1 block">
          ឈ្មោះភេសជ្ជៈ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={drinkName}
          maxLength={NAME_LIMIT}
          onChange={(e) => onDrinkNameChange(e.target.value)}
          placeholder="ឧទាហរណ៍: កាហ្វេទឹកកក"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-gray-400 text-right mt-1">
          {drinkName.length}/{NAME_LIMIT}
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
          placeholder="ពិពណ៌នាអំពីភេសជ្ជៈ រសជាតិ និងគ្រឿងផ្សំ។"
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