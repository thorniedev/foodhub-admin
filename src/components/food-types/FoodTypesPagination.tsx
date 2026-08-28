"use client";

import Pagination from "@/src/components/ui/Pagination";

interface FoodTypesPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function FoodTypesPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: FoodTypesPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      totalElements={total}
      unit="មុខ"
      onPageChange={onPageChange}
      className="mt-4"
    />
  );
}