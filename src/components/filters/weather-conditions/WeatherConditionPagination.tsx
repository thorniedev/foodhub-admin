"use client";

import Pagination from "@/src/components/ui/Pagination";

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export default function WeatherConditionPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: Props) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      unit="ស្ថានភាពអាកាសធាតុ"
      disabled={disabled}
      zeroIndexed={true}
      onPageChange={onPageChange}
      className="border-t border-gray-100"
    />
  );
}
