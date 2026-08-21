"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Check, ChevronDown } from "lucide-react";
import { OrdersPoint } from "../../types/dashboard";

const filterOptions = [
  { label: "ខែនេះ", value: "this-month" },
  { label: "ខែមុន", value: "last-month" },
  { label: "៣ ខែចុងក្រោយ", value: "last-3-months" },
  { label: "៦ ខែចុងក្រោយ", value: "last-6-months" },
  { label: "ឆ្នាំនេះ", value: "this-year" },
];

export default function OrdersChart({ data }: { data: OrdersPoint[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState(filterOptions[3]);

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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 lg:min-h-[415px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-2xl font-semibold text-[#136C34]">
          កំណើនគណនីអ្នកប្រើប្រាស់
        </p>

        {/* Filter Dropdown */}
        <div ref={dropdownRef} className="relative w-[210px]">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="
              flex w-full items-center justify-between
              rounded-xl border border-gray-200
              bg-white px-4 py-2.5
              text-lg font-medium text-gray-600
              transition-all duration-200
              hover:border-gray-300 hover:bg-gray-50
              focus:border-[#136C34]
              focus:outline-none
              focus:ring-4 focus:ring-[#136C34]/10
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
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 15,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={60}
              tickMargin={14}
              tick={{
                fontSize: 18,
                fill: "#9CA3AF",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={50}
              tickMargin={10}
              tick={{
                fontSize: 18,
                fill: "#9CA3AF",
              }}
            />

            <Tooltip
              cursor={{
                fill: "rgba(19, 108, 52, 0.05)",
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#ffffff",
                padding: "10px 14px",
                fontSize: "18px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
              labelStyle={{
                color: "#374151",
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "#136C34",
                fontWeight: 600,
              }}
            />

            <Bar
              dataKey="orders"
              fill="#136C34"
              radius={[8, 8, 0, 0]}
              barSize={32}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
