export default function ShopsPagination({
  total,
  shown,
}: {
  total: number;
  shown: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-sm text-gray-500">
      <span>
        បង្ហាញ {shown} ក្នុងចំណោម {total}
      </span>
      <div className="flex items-center gap-1 overflow-x-auto">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className={`w-8 h-8 rounded-lg shrink-0 ${
              n === 1
                ? "bg-emerald-800 text-white"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {n}
          </button>
        ))}
        <span className="px-1">...</span>
        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0">
          10
        </button>
      </div>
    </div>
  );
}
