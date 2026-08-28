"use client";

import Pagination from "@/src/components/ui/Pagination";

interface FoodByAreaPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function FoodByAreaPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: FoodByAreaPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      totalElements={total}
      unit="រូបភាព"
      onPageChange={onPageChange}
      className="mt-4"
    />
  );
}
