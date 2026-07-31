"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UserGrowthPoint } from "../../types/dashboard";

export default function UserGrowthChart({ data }: { data: UserGrowthPoint[] }) {
  return (
    <div className="bg-white rounded-2xl lg:min-h-93.75 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-semibold text-gray-800">
          ទិន្នន័យអភិវឌ្ឍនៃអ្នកប្រើប្រាស់
        </p>
        <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500">
          <option>ខែនេះ</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#15803d"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
