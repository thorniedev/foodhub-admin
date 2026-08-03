"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { DietaryType } from "../../../types/userProfile";

interface DietarySectionProps {
  dietaryTypes: DietaryType[];
}

export default function DietarySection({ dietaryTypes }: DietarySectionProps) {
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-gray-500" />
        <h3 className="text-base sm:text-lg font-bold text-gray-800">តម្រូវការរបបអាហារ</h3>
      </div>

      {dietaryTypes.length === 0 ? (
        <p className="text-sm text-gray-400">គ្មានលក្ខខណ្ឌរបបអាហារ</p>
      ) : (
        <div className="space-y-2">
          {dietaryTypes.map((d) => (
            <div key={d.uuid} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenUuid(openUuid === d.uuid ? null : d.uuid)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium text-gray-800">{d.name}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{d.category}</span>
                  <span className="text-emerald-600 font-medium">{d.enforcementLevel}</span>
                  <span>អាទិភាព {d.priority}</span>
                  <ChevronDown size={14} className={openUuid === d.uuid ? "rotate-180" : ""} />
                </div>
              </button>
              {openUuid === d.uuid && (
                <div className="px-4 pb-3 text-xs text-gray-500 bg-gray-50">
                  <p>កំណត់ចំណាំ: {d.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}