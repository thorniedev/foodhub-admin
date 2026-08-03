// "use client";

// import { Search } from "lucide-react";
// import { ShopStatus } from "../../types/shop";

// export type ShopFilter = "all" | ShopStatus;

// interface ShopsTabsProps {
//   counts: Record<ShopFilter, number>;
//   active: ShopFilter;
//   onChange: (filter: ShopFilter) => void;
//   search: string;
//   onSearchChange: (value: string) => void;
// }

// const TABS: { key: ShopFilter; label: string }[] = [
//   { key: "all", label: "ទាំងអស់" },
//   { key: "active", label: "កំពុងដំណើរការ" },
//   { key: "stopped", label: "បានបញ្ឈប់" },
//   { key: "banned", label: "ត្រូវបានហាមឃាត់" },
// ];

// export default function ShopsTabs({
//   counts,
//   active,
//   onChange,
//   search,
//   onSearchChange,
// }: ShopsTabsProps) {
//   return (
//     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
//       <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
//         {TABS.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => onChange(tab.key)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-medium transition whitespace-nowrap shrink-0 ${
//               active === tab.key
//                 ? "bg-[#136C34] text-white"
//                 : "text-gray-500 hover:bg-gray-100"
//             }`}
//           >
//             {tab.label}
//             <span
//               className={`text-xs px-1.5 py-0.5 rounded-full ${
//                 active === tab.key ? "bg-white/20" : "bg-gray-100 text-gray-500"
//               }`}
//             >
//               {counts[tab.key]}
//             </span>
//           </button>
//         ))}
//       </div>

//       <div className="relative w-full lg:w-72">
//         <Search
//           size={16}
//           className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//         />
//         <input
//           value={search}
//           onChange={(e) => onSearchChange(e.target.value)}
//           placeholder="ស្វែងរក, លេខទូរស័ព្ទ..."
//           className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
//         />
//       </div>
//     </div>
//   );
// }








"use client";

import { Search } from "lucide-react";
import { AccountStatus } from "../../types/shop";

export type ShopFilter = "all" | AccountStatus;

interface ShopsTabsProps {
  counts: Record<ShopFilter, number>;
  active: ShopFilter;
  onChange: (filter: ShopFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const TABS: { key: ShopFilter; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "ACTIVE", label: "កំពុងដំណើរការ" },
  { key: "SUSPENDED", label: "បានផ្អាក" },
  { key: "BANNED", label: "ត្រូវបានហាមឃាត់" },
  { key: "PENDING", label: "កំពុងរង់ចាំ" },
];

export default function ShopsTabs({
  counts,
  active,
  onChange,
  search,
  onSearchChange,
}: ShopsTabsProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-medium transition whitespace-nowrap shrink-0 ${
              active === tab.key
                ? "bg-[#136C34] text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                active === tab.key ? "bg-white/20" : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="relative w-full lg:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរក, លេខទូរស័ព្ទ..."
          className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>
    </div>
  );
}