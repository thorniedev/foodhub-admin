"use client";

import Pagination from "@/src/components/ui/Pagination";

interface DrinksPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DrinksPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: DrinksPaginationProps) {
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