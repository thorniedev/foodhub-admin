"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AgeGroup } from "../../../types/userProfile";

interface AgeGroupSectionProps {
  ageGroup: AgeGroup;
}

export default function AgeGroupSection({ ageGroup }: AgeGroupSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">ក្រុមអាយុ</h3>
      <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
        <p><span className="text-gray-500">ក្រុមអាយុ:</span> <span className="font-medium text-gray-800">{ageGroup.name}</span></p>
        <p><span className="text-gray-500">អាយុអប្បបរមា:</span> <span className="font-medium text-gray-800">{ageGroup.minAge}</span></p>
        <p><span className="text-gray-500">អាយុអតិបរមា:</span> <span className="font-medium text-gray-800">{ageGroup.maxAge}</span></p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-emerald-600 pt-2"
        >
          <ChevronDown size={14} className={expanded ? "rotate-180" : ""} />
          ព័ត៌មានបច្ចេកទេស
        </button>
        {expanded && (
          <p className="text-xs text-gray-400 pt-1">
            <code className="bg-white px-2 py-1 rounded border border-gray-200">{ageGroup.code}</code>{" "}
            <code className="bg-white px-2 py-1 rounded border border-gray-200">{ageGroup.uuid}</code>
          </p>
        )}
      </div>
    </div>
  );
}