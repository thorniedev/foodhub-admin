import Pagination from "@/src/components/ui/Pagination";

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export default function IngredientsPagination({
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
      unit="គ្រឿងផ្សំ"
      disabled={disabled}
      zeroIndexed={true}
      onPageChange={onPageChange}
      className="border-t border-gray-100"
    />
  );
}