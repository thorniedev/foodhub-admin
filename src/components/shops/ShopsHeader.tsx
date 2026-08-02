"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface ShopsHeaderProps {
  total: number;
  filteredCount?: number;
}

export default function ShopsHeader({ total, filteredCount }: ShopsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <p className="text-5xl font-bold text-[#136C34]">ការគ្រប់គ្រងហាង</p>
        <p className="text-lg text-[#F97316] mt-3">
          កំពុងបង្ហាញហាង {filteredCount ?? total} ហាង ក្នុងចំណោម {total} ហាង
        </p>
      </div>
      <button
        onClick={() => router.push("/shops/create")}
        className="flex items-center gap-2 bg-[#136C34] hover:bg-[#136C34] text-white text-base font-medium px-4 py-2.5 rounded-full  transition-colors"
      >
        <Plus size={16} />
        បន្ថែមហាងថ្មី
      </button>
    </div>
  );
}