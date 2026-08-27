import { CloudRain, Eye, MinusCircle, Pencil } from "lucide-react";
import type { WeatherCondition } from "@/src/types/weather-condition";
import { formatAdminDate } from "@/src/types/safetyResource";

function activeOf(item: WeatherCondition): boolean {
  return item.isActive ?? item.active ?? true;
}

export default function WeatherConditionTable({
  items,
  busy,
  onView,
  onEdit,
  onDeactivate,
}: {
  items: WeatherCondition[];
  busy: boolean;
  onView: (item: WeatherCondition) => void;
  onEdit: (item: WeatherCondition) => void;
  onDeactivate: (item: WeatherCondition) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xl font-medium text-gray-500">មិនមានទិន្នន័យស្ថានភាពអាកាសធាតុទេ</p>
        <p className="mt-1 text-lg text-gray-400">បន្ថែមស្ថានភាពអាកាសធាតុដូចជា Rainy, Sunny ឬ Cold។</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[700px] table-auto border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="whitespace-nowrap px-4 py-3.5 text-xl font-normal text-primary-800">ឈ្មោះស្ថានភាពអាកាសធាតុ</th>
            <th className="whitespace-nowrap px-4 py-3.5 text-xl font-normal text-primary-800">កូដ</th>
            <th className="whitespace-nowrap px-4 py-3.5 text-xl font-normal text-primary-800">ការពិពណ៌នា</th>
            <th className="whitespace-nowrap px-4 py-3.5 text-center text-xl font-normal text-primary-800">ស្ថានភាព</th>
       
            <th className="min-w-[120px] whitespace-nowrap px-4 py-3.5 text-center text-xl font-normal text-primary-800">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const active = activeOf(item);
            return (
              <tr key={item.uuid} className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70">
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                      <CloudRain size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-normal text-gray-800">{item.localName || item.name}</p>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-lg font-normal text-gray-700">
                    {item.code || "—"}
                  </span>
                </td>

                {/* Description */}
                <td className="max-w-[320px] px-4 py-3">
                  <p className="line-clamp-2 text-lg font-normal text-gray-500">{item.description || "—"}</p>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1 text-lg font-normal ${active ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {active ? "សកម្ម" : "អសកម្ម"}
                  </span>
                </td>


                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      title="មើលព័ត៌មានលម្អិត"
                      aria-label="View"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(item)}
                      title="កែប្រែ"
                      aria-label="Edit"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={busy || !active}
                      onClick={() => onDeactivate(item)}
                      title="បិទដំណើរការ"
                      aria-label="Deactivate"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MinusCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
