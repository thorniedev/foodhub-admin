import { Plus } from "lucide-react";

export default function ShopsHeader({ total }: { total: number }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ការគ្រប់គ្រងហាង</h2>
        <p className="text-sm text-gray-400 mt-1">
          កំពុងបង្ហាញហាង {total} ហាង ក្នុងចំណោម {total} ហាង
        </p>
      </div>
      <button className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
        <Plus size={16} />
        បន្ថែមហាងថ្មី
      </button>
    </div>
  );
}