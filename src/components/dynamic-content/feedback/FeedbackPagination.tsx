"use client";

import Pagination from "@/src/components/ui/Pagination";

interface FeedbackPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function FeedbackPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: FeedbackPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      totalElements={total}
      unit="មតិ"
      onPageChange={onPageChange}
      className="mt-4"
    />
  );
}
