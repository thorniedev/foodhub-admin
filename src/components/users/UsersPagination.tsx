import Pagination from "@/src/components/ui/Pagination";

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export default function UsersPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: UsersPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      unit="នាក់"
      disabled={disabled}
      zeroIndexed={true}
      onPageChange={onPageChange}
      className="border-t border-gray-100"
    />
  );
}
