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
    <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <MapPin size={20} className="text-[#136C34]" />
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
          ទីតាំង
        </h2>
      </div>

      <p className="text-sm text-gray-400">
        ទីតាំងនឹងត្រូវបានបំពេញដោយស្វ័យប្រវត្តិពីហាងដែលបានជ្រើសរើស។
      </p>

      <input
        type="text"
        value={address}
        onChange={(event) => onAddressChange(event.target.value)}
        placeholder="ឧទាហរណ៍៖ រាជធានីភ្នំពេញ"
        className="w-full rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </section>
  );
}
