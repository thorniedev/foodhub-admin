"use client";

import { MapPin } from "lucide-react";

interface ShopLocationSectionProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  onLatLngChange: (lat: number | null, lng: number | null) => void;
}

export default function ShopLocationSection({
  address,
  latitude,
  longitude,
  onLatLngChange,
}: ShopLocationSectionProps) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-2 block">
        ទីតាំងនៅលើផែនទី <span className="text-red-500">*</span>
      </label>

      {/* Placeholder map — replace with a real Google Maps / Mapbox embed
          once you have an API key. For now this just shows the typed address
          so admins can visually confirm what they entered. */}
      <div className="relative bg-gray-100 border border-gray-200 rounded-xl h-64 flex flex-col items-center justify-center gap-2 overflow-hidden">
        <MapPin size={28} className="text-emerald-600" />
        <p className="text-sm text-gray-500 px-6 text-center">
          {address.trim() || "ទីតាំងនឹងបង្ហាញនៅទីនេះបន្ទាប់ពីអ្នកបញ្ចូលអាសយដ្ឋាន"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude ?? ""}
            onChange={(e) =>
              onLatLngChange(
                e.target.value ? Number(e.target.value) : null,
                longitude
              )
            }
            placeholder="11.5564"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude ?? ""}
            onChange={(e) =>
              onLatLngChange(
                latitude,
                e.target.value ? Number(e.target.value) : null
              )
            }
            placeholder="104.9282"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}