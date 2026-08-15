// "use client";

// import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// import { UserStatusSegment } from "../../types/dashboard";
// import { ChevronDown } from "lucide-react";

// export default function UserStatusChart({
//   data,
// }: {
//   data: UserStatusSegment[];
// }) {
//   const total = data.reduce((sum, seg) => sum + seg.value, 0);

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-6">
//       <div className="flex items-center justify-between mb-4">
//         <p className="text-2xl font-semibold text-[#136C34]">
//           ស្ថានភាពអ្នកប្រើប្រាស់
//         </p>
//         <div className="relative w-32">
//           <select className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-9 text-base text-gray-500 outline-none">
//             <option>ខែនេះ</option>
//           </select>

//           <ChevronDown
//             size={18}
//             className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//           />
//         </div>
//       </div>

//       <div className="relative flex items-center justify-center">
//         <ResponsiveContainer width="100%" height={200}>
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="value"
//               nameKey="label"
//               innerRadius={65}
//               outerRadius={90}
//               paddingAngle={2}
//               strokeWidth={0}
//             >
//               {data.map((seg) => (
//                 <Cell key={seg.label} fill={seg.color} />
//               ))}
//             </Pie>
//           </PieChart>
//         </ResponsiveContainer>
//         <span className="absolute text-2xl font-bold text-gray-900">
//           {total}
//         </span>
//       </div>

//       <div className="mt-4 space-y-2">
//         {data.map((seg) => (
//           <div
//             key={seg.label}
//             className="flex items-center justify-between text-lg"
//           >
//             <span className="flex items-center gap-2 text-gray-600">
//               <span
//                 className="w-2.5 h-2.5 rounded-full"
//                 style={{ backgroundColor: seg.color }}
//               />
//               {seg.label}
//             </span>
//             <span className="text-gray-500">{seg.value}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

//  new

"use client";

import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { UserStatusSegment } from "../../types/dashboard";
import { Check, ChevronDown } from "lucide-react";

const filterOptions = [
  { label: "ខែនេះ", value: "this-month" },
  { label: "ខែមុន", value: "last-month" },
  { label: "៣ ខែចុងក្រោយ", value: "last-3-months" },
  { label: "៦ ខែចុងក្រោយ", value: "last-6-months" },
  { label: "ឆ្នាំនេះ", value: "this-year" },
];

export default function UserStatusChart({
  data,
}: {
  data: UserStatusSegment[];
}) {
  const total = data.reduce((sum, seg) => sum + seg.value, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-4 ">
        <p className="text-2xl font-semibold text-[#136C34]">
          ស្ថានភាពអ្នកប្រើប្រាស់
        </p>

        {/* Custom Dropdown */}
        {/* <div ref={dropdownRef} className="relative w-[210px]">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="
              flex w-full items-center mt-6 justify-between
              rounded-xl border border-gray-200
              bg-white px-4 py-2.5
              text-lg font-medium text-gray-600
              transition-all duration-200
              hover:border-gray-300 hover:bg-gray-50
              focus:border-[#136C34]
              focus:outline-none
              focus:ring-2 focus:ring-[#136C34]/50
            "
          >
            <span>{selectedFilter.label}</span>

            <ChevronDown
              size={20}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div
              className="
                absolute right-0 top-full z-50 mt-2
                w-full overflow-hidden
                rounded-xl border border-gray-100
                bg-white p-1.5
                shadow-[0_12px_35px_rgba(0,0,0,0.10)]
              "
            >
              {filterOptions.map((option) => {
                const isSelected = selectedFilter.value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(option);
                      setIsOpen(false);
                    }}
                    className={`
                      flex w-full items-center justify-between
                      rounded-lg px-3.5 py-2.5
                      text-left text-lg
                      transition-colors duration-150
                      ${
                        isSelected
                          ? "bg-[#136C34]/10 font-semibold text-[#136C34]"
                          : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <span>{option.label}</span>

                    {isSelected && (
                      <Check
                        size={19}
                        strokeWidth={2.5}
                        className="text-[#136C34]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div> */}
      </div>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((seg) => (
                <Cell key={seg.label} fill={seg.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <span className="absolute text-2xl font-bold text-gray-900">
          {total}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-between text-lg"
          >
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              {seg.label}
            </span>

            <span className="text-gray-500">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
