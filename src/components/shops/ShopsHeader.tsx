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
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#136C34]">
          ការគ្រប់គ្រងហាង
        </p>
        <p className="text-sm sm:text-base lg:text-lg text-[#F97316] mt-2 sm:mt-3">
          កំពុងបង្ហាញហាង {filteredCount ?? total} ហាង ក្នុងចំណោម {total} ហាង
        </p>
      </div>
      <button
        onClick={() => router.push("/shops/create")}
        className="flex items-center justify-center gap-2 bg-[#136C34] hover:bg-[#136C34] text-white text-sm sm:text-base font-medium px-4 py-2.5 rounded-full transition-colors w-full sm:w-auto"
      >
        <Plus size={16} />
        បន្ថែមហាងថ្មី
      </button>
    </div>
  );
}