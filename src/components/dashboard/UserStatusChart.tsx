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
