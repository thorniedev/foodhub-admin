"use client";

import {
  Apple,
  Beef,
  Cake,
  Coffee,
  CupSoda,
  Egg,
  Eye,
  Fish,
  GlassWater,
  Milk,
  MinusCircle,
  Pencil,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Trash2,
  UtensilsCrossed,
  Wine,
  Zap,
} from "lucide-react";
import type { FoodCategory } from "@/src/types/foodCategory";

type Props = {
  items: FoodCategory[];
  mode: "FOOD" | "DRINK";
  busy: boolean;
  onView: (item: FoodCategory) => void;
  onEdit: (item: FoodCategory) => void;
  onToggleActive: (item: FoodCategory) => void;
  onDelete: (item: FoodCategory) => void;
};

// ─── Subcategory icon helper ───────────────────────────────────────────────
function getSubCategoryIcon(item: FoodCategory, mode: "FOOD" | "DRINK") {
  const code = (item.code || "").toUpperCase();
  const name = (item.name || "").toLowerCase();

  if (mode === "DRINK") {
    if (code.includes("COFFEE") || name.includes("កាហ្វេ")) return <Coffee size={20} />;
    if (code.includes("MILK") || name.includes("ទឹកដោះគោ")) return <Milk size={20} />;
    if (
      code.includes("JUICE") ||
      code.includes("SMOOTHIE") ||
      name.includes("ទឹកផ្លែឈើ") ||
      name.includes("ក្រឡុក")
    ) {
      return <GlassWater size={20} />;
    }
    if (code.includes("WATER") || name.includes("ទឹកសុទ្ធ") || name.includes("ទឹកបរិសុទ្ធ")) {
      return <GlassWater size={20} />;
    }
    if (code.includes("ENERGY") || name.includes("ប៉ូវកម្លាំង")) return <Zap size={20} />;
    if (
      code.includes("ALCOHOL") ||
      code.includes("BEER") ||
      code.includes("WINE") ||
      name.includes("ស្រា") ||
      name.includes("ប៊ីយែរ")
    ) {
      return <Wine size={20} />;
    }
    return <CupSoda size={20} />;
  }

  // FOOD
  if (
    code.includes("SEAFOOD") ||
    code.includes("FISH") ||
    name.includes("គ្រឿងសមុទ្រ") ||
    name.includes("ត្រី")
  ) {
    return <Fish size={20} />;
  }
  if (
    code.includes("MEAT") ||
    code.includes("BEEF") ||
    code.includes("PORK") ||
    code.includes("CHICKEN") ||
    name.includes("សាច់")
  ) {
    return <Beef size={20} />;
  }
  if (
    code.includes("SOUP") ||
    code.includes("STEAMED") ||
    name.includes("ស៊ុប") ||
    name.includes("ស្ងោរ") ||
    name.includes("ចំហុយ")
  ) {
    return <Soup size={20} />;
  }
  if (code.includes("EGG") || name.includes("ស៊ុត") || name.includes("ពង")) {
    return <Egg size={20} />;
  }
  if (
    code.includes("VEGETARIAN") ||
    code.includes("VEGAN") ||
    code.includes("SALAD") ||
    name.includes("បន្លែ") ||
    name.includes("សាឡាត់") ||
    name.includes("បួស")
  ) {
    return <Salad size={20} />;
  }
  if (code.includes("FRUIT") || name.includes("ផ្លែឈើ")) return <Apple size={20} />;
  if (
    code.includes("BAKED") ||
    code.includes("BREAD") ||
    code.includes("CAKE") ||
    code.includes("DESSERT") ||
    name.includes("ដុត") ||
    name.includes("នំ")
  ) {
    return <Cake size={20} />;
  }
  if (code.includes("PIZZA") || code.includes("FAST_FOOD")) return <Pizza size={20} />;
  if (code.includes("SANDWICH") || code.includes("BURGER")) return <Sandwich size={20} />;
  return <UtensilsCrossed size={20} />;
}

// ─── Main Table ──────────────────────────────────────────────────────────────
export default function SubCategoryTable({
  items,
  mode,
  busy,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}: Props) {
  const emptyText =
    mode === "DRINK"
      ? "មិនទាន់មានអនុប្រភេទភេសជ្ជៈនៅឡើយទេ។"
      : "មិនទាន់មានអនុប្រភេទម្ហូបនៅឡើយទេ។";

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-lg font-medium text-gray-500">{emptyText}</p>
        <p className="mt-1 text-lg text-gray-400">
          បន្ថែមអនុប្រភេទថ្មីដើម្បីងាយស្រួលគ្រប់គ្រង។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[600px] table-auto border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-lg font-normal text-primary-800">
            <th className="py-4 pl-6 pr-4 font-normal">
              ឈ្មោះអនុប្រភេទ
            </th>
            <th className="px-4 py-4 font-normal">
              កូដ
            </th>
            <th className="px-4 py-4 font-normal">
              ការពិពណ៌នា
            </th>
            <th className="px-4 py-4 text-center font-normal">
              ស្ថានភាព
            </th>
           
            <th className="min-w-[130px] py-4 pl-4 pr-6 text-center font-normal">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const active = item.isActive !== false;

            return (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Name with Icon */}
                <td className="py-3.5 pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                      {getSubCategoryIcon(item, mode)}
                    </div>
                    <p className="text-lg font-normal text-gray-800">
                      {item.name}
                    </p>
                  </div>
                </td>

                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-lg font-normal text-gray-700">
                    {item.code}
                  </span>
                </td>

                {/* Description */}
                <td className="max-w-xs truncate px-4 py-3.5 text-lg font-normal text-gray-500">
                  {item.description || "—"}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1 text-lg font-normal ${
                      active
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        active ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    {active ? "សកម្ម" : "អសកម្ម"}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 pl-4 pr-6">
                  <div className="flex items-center justify-center gap-2">
                    {/* 1. View */}
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      title="មើលព័ត៌មានលម្អិត"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none"
                    >
                      <Eye size={17} />
                    </button>

                    {/* 2. Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="កែប្រែ"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none"
                    >
                      <Pencil size={17} />
                    </button>

                    {/* 3. Toggle Active (Circle Minus) */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onToggleActive(item)}
                      title={active ? "បិទដំណើរការ" : "បើកដំណើរការ"}
                      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition focus:outline-none disabled:opacity-50 ${
                        active
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      <MinusCircle size={17} />
                    </button>

                    {/* 4. Delete (Trash) */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete(item)}
                      title="លុប"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none disabled:opacity-50"
                    >
                      <Trash2 size={17} />
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
