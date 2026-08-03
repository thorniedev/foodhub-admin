"use client";

import { useState } from "react";
import { ChevronDown, Leaf } from "lucide-react";
import { Allergy } from "../../../types/userProfile";

const SEVERITY_BADGE: Record<string, string> = {
  MILD: "bg-yellow-50 text-yellow-700",
  MODERATE: "bg-amber-50 text-amber-700",
  SEVERE: "bg-red-50 text-red-600",
};

interface AllergiesSectionProps {
  allergies: Allergy[];
}

export default function AllergiesSection({ allergies }: AllergiesSectionProps) {
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Leaf size={16} className="text-gray-500" />
        <h3 className="text-base sm:text-lg font-bold text-gray-800">អាឡែហ្ស៊ីអាហារ</h3>
      </div>

      {allergies.length === 0 ? (
        <p className="text-sm text-gray-400">គ្មានអាឡែហ្ស៊ី</p>
      ) : (
        <div className="space-y-2">
          {allergies.map((a) => (
            <div key={a.uuid} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenUuid(openUuid === a.uuid ? null : a.uuid)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium text-gray-800">{a.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_BADGE[a.severity]}`}>
                    {a.severity}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 ${openUuid === a.uuid ? "rotate-180" : ""}`} />
                </div>
              </button>
              {openUuid === a.uuid && (
                <div className="px-4 pb-3 text-xs text-gray-500 space-y-1 bg-gray-50">
                  <p>ជៀសវាងទំនាក់ទំនងឆ្លង: {a.avoidCrossContact ? "បាទ/ចាស" : "ទេ"}</p>
                  <p>ធ្វើរោគវិនិច្ឆ័យផ្នែកវេជ្ជសាស្ត្រ: {a.medicallyDiagnosed ? "បាទ/ចាស" : "ទេ"}</p>
                  <p>កំណត់ចំណាំ: {a.reactionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}