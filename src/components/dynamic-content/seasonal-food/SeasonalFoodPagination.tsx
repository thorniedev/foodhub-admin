"use client";

import Pagination from "@/src/components/ui/Pagination";

interface SeasonalFoodPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SeasonalFoodPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: SeasonalFoodPaginationProps) {
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