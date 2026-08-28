import Pagination from "@/src/components/ui/Pagination";

export default function ShopsPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      unit="ហាង"
      disabled={disabled}
      zeroIndexed={true}
      onPageChange={onPageChange}
      className="border-t border-gray-100"
    />
  );
}
