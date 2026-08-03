"use client";

interface UsersHeaderProps {
  total: number;
  filteredCount?: number;
  onAddNew: () => void;
}

export default function UsersHeader({
  total,
  filteredCount,
}: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#136C34]">
          អ្នកប្រើប្រាស់
        </p>
        <p className="text-sm sm:text-base lg:text-lg text-[#F97316] mt-2 sm:mt-3">
          កំពុងបង្ហាញអ្នកប្រើប្រាស់ {filteredCount ?? total} ក្នុងចំណោម {total} នាក់
        </p>
      </div>
    </div>
  );
}