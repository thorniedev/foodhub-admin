"use client";

import { MapPin } from "lucide-react";

interface LocationSectionProps {
  address: string;
  onAddressChange: (value: string) => void;
}

export default function LocationSection({
  address,
  onAddressChange,
}: LocationSectionProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-1">
        <MapPin size={18} className="text-emerald-600" />
        ទីតាំង
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        ជាជម្រើស — ជួយឱ្យអ្នកប្រើប្រាស់នៅក្បែរនោះស្គាល់មុខម្ហូបនេះ
      </p>
      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="ឧទាហរណ៍: រាជធានីភ្នំពេញ"
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}