"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { UserStatusSegment } from "../../types/dashboard";


export default function UserStatusChart({ data }: { data: UserStatusSegment[] }) {
  const total = data.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl font-semibold text-[#136C34]">ស្ថានភាពអ្នកប្រើប្រាស់</p>
        <select className="text-base border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500">
          <option>ខែនេះ</option>
        </select>
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
        <span className="absolute text-2xl font-bold text-gray-900">{total}</span>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full"
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