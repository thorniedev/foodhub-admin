export default function ShopsPagination({ total, shown }: { total: number; shown: number }) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
      <span>
        បង្ហាញ {shown} ក្នុងចំណោម {total}
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className={`w-8 h-8 rounded-lg ${
              n === 1 ? "bg-emerald-800 text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {n}
          </button>
        ))}
        <span className="px-1">...</span>
        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600">10</button>
      </div>
    </div>
  );
}
