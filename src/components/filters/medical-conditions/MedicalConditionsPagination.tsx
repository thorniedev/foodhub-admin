import Pagination from "@/src/components/ui/Pagination";

type Props = {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export default function MedicalConditionsPagination({
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
      unit="ស្ថានភាពសុខភាព"
      disabled={disabled}
      zeroIndexed={true}
      onPageChange={onPageChange}
      className="border-t border-gray-100"
    />
  );
}