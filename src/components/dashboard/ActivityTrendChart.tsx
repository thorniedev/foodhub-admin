"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";

import type { DashboardTrendPoint } from "@/src/types/adminDashboard";
import SectionCard from "./SectionCard";
import ChartTooltip, { type ChartTooltipRow } from "./ChartTooltip";
import DashboardEmptyState from "./DashboardEmptyState";
import { ChartSkeleton } from "./DashboardLoadingSkeleton";
import {
  CHART_AXIS_TEXT,
  CHART_GRID,
  CHART_SERIES,
  formatCompact,
  formatCount,
  formatLongDate,
  formatShortDate,
} from "./dashboard-theme";
import { cn } from "@/src/lib/utils";

type BarMetric = "recommendationSessions" | "itemViews";

const BAR_METRICS: { value: BarMetric; label: string; color: string }[] = [
  {
    value: "recommendationSessions",
    label: "វគ្គណែនាំ",
    color: CHART_SERIES.sessions,
  },
  { value: "itemViews", label: "ការមើលមុខម្ហូប", color: CHART_SERIES.views },
];

interface ActivityTrendChartProps {
  data: DashboardTrendPoint[];
  isLoading?: boolean;
}

export default function ActivityTrendChart({
  data,
  isLoading = false,
}: ActivityTrendChartProps) {
  const [barMetric, setBarMetric] = useState<BarMetric>("recommendationSessions");
  const activeBar = BAR_METRICS.find((metric) => metric.value === barMetric)!;

  const hasSignal = useMemo(
    () =>
      data.some(
        (point) =>
          point.activeUsers > 0 ||
          point.newUsers > 0 ||
          point.recommendationSessions > 0 ||
          point.itemViews > 0,
      ),
    [data],
  );

  return (
    <SectionCard
      title="និន្នាការសកម្មភាព"
      description="អ្នកប្រើប្រាស់សកម្ម អ្នកប្រើប្រាស់ថ្មី និងបរិមាណណែនាំ តាមថ្ងៃ"
      icon={<Activity size={18} aria-hidden="true" />}
      hint="ថ្ងៃដែលគ្មានសកម្មភាពត្រូវបានបំពេញដោយសូន្យ ដើម្បីកុំឱ្យក្រាហ្វិកលោតរំលងថ្ងៃ។"
      actions={
        <div
          role="group"
          aria-label="ជ្រើសរើសរង្វាស់សម្រាប់សសរ"
          className="flex items-center gap-1 rounded-full bg-gray-100 p-1"
        >
          {BAR_METRICS.map((metric) => {
            const active = metric.value === barMetric;

            return (
              <button
                key={metric.value}
                type="button"
                aria-pressed={active}
                onClick={() => setBarMetric(metric.value)}
                className={cn(
                  "min-h-9 rounded-full px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {metric.label}
              </button>
            );
          })}
        </div>
      }
    >
      {isLoading ? (
        <ChartSkeleton height={300} />
      ) : !hasSignal ? (
        <DashboardEmptyState
          title="គ្មានសកម្មភាពក្នុងចន្លោះនេះ"
          description="មិនមានការមើល ការចុច ឬវគ្គណែនាំណាមួយត្រូវបានកត់ត្រាទេ។"
        />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
            >
              <CartesianGrid
                stroke={CHART_GRID}
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
                minTickGap={24}
              />

              {/* One shared scale on purpose — a second y-axis would make the
                  two series look comparable when they are not. */}
              <YAxis
                tickFormatter={formatCompact}
                tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={56}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(17,24,39,0.04)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  const rows: ChartTooltipRow[] = payload.map((entry) => ({
                    key: String(entry.dataKey),
                    color: String(entry.color ?? entry.stroke ?? "#9ca3af"),
                    label: String(entry.name ?? entry.dataKey),
                    value: formatCount(Number(entry.value ?? 0)),
                  }));

                  return (
                    <ChartTooltip
                      title={formatLongDate(String(label))}
                      rows={rows}
                    />
                  );
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={32}
                iconType="circle"
                iconSize={9}
                wrapperStyle={{ fontSize: 13, color: CHART_AXIS_TEXT }}
              />

              <Bar
                dataKey={barMetric}
                name={activeBar.label}
                fill={activeBar.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />

              <Line
                type="monotone"
                dataKey="activeUsers"
                name="អ្នកប្រើប្រាស់សកម្ម"
                stroke={CHART_SERIES.activeUsers}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
              />

              <Line
                type="monotone"
                dataKey="newUsers"
                name="អ្នកប្រើប្រាស់ថ្មី"
                stroke={CHART_SERIES.newUsers}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
