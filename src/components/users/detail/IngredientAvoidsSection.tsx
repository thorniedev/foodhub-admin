"use client";

import { useState } from "react";
import { ChevronDown, UtensilsCrossed } from "lucide-react";
import { IngredientAvoid } from "../../../types/userProfile";

interface IngredientAvoidsSectionProps {
  ingredientAvoids: IngredientAvoid[];
}

export default function IngredientAvoidsSection({ ingredientAvoids }: IngredientAvoidsSectionProps) {
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed size={16} className="text-gray-500" />
        <h3 className="text-base sm:text-lg font-bold text-gray-800">គ្រឿងផ្សំដែលចង់ជៀសវាង</h3>
      </div>

      {ingredientAvoids.length === 0 ? (
        <p className="text-sm text-gray-400">គ្មានគ្រឿងផ្សំដែលត្រូវជៀសវាង</p>
      ) : (
        <div className="space-y-2">
          {ingredientAvoids.map((i) => (
            <div key={i.uuid} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenUuid(openUuid === i.uuid ? null : i.uuid)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium text-gray-800">{i.name}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-red-500 font-medium">{i.avoidLevel}</span>
                  <span>{i.reasonCode}</span>
                  <ChevronDown size={14} className={openUuid === i.uuid ? "rotate-180" : ""} />
                </div>
              </button>
              {openUuid === i.uuid && (
                <div className="px-4 pb-3 text-xs text-gray-500 bg-gray-50">
                  <p>កំណត់ចំណាំ: {i.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}