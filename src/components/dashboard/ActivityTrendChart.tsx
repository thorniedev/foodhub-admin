"use client";

import { useId, useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
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
  CHART_CONTEXT_FILL_OPACITY,
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
  // Teal rather than the shared "views" green: in this chart the bars sit
  // behind a green active-users area and must stay separable from it.
  { value: "itemViews", label: "ការមើលមុខម្ហូប", color: CHART_SERIES.clicks },
];

interface ActivityTrendChartProps {
  data: DashboardTrendPoint[];
  isLoading?: boolean;
}

export default function ActivityTrendChart({
  data,
  isLoading = false,
}: ActivityTrendChartProps) {
  const activeUsersFillId = useId().replace(/:/g, "");
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
      tone="green"
      hint="ថ្ងៃដែលគ្មានសកម្មភាពត្រូវបានបំពេញដោយសូន្យ ដើម្បីកុំឱ្យក្រាហ្វិកលោតរំលងថ្ងៃ។"
      actions={
        <div
          role="group"
          aria-label="ជ្រើសរើសរង្វាស់សម្រាប់សសរ"
          className="flex items-center gap-1.5 rounded-full bg-gray-100 p-1"
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
                  "min-h-9 cursor-pointer rounded-full px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  active
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800",
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-emerald-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_SERIES.activeUsers }}
                aria-hidden="true"
              />
              អ្នកប្រើប្រាស់សកម្ម
            </span>

            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 text-blue-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_SERIES.newUsers }}
                aria-hidden="true"
              />
              អ្នកប្រើប្រាស់ថ្មី
            </span>

            <span
              className="inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5"
              style={{
                borderColor: `${activeBar.color}33`,
                backgroundColor: `${activeBar.color}14`,
                color: activeBar.color,
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: activeBar.color }}
                aria-hidden="true"
              />
              {activeBar.label}
            </span>
          </div>

          <div className="h-[280px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
              >
                <defs>
                  <linearGradient id={activeUsersFillId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={CHART_SERIES.activeUsers} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={CHART_SERIES.activeUsers} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={CHART_GRID}
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 13 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_GRID }}
                  minTickGap={24}
                />

                {/* Both people series share the left axis because they are the
                    same unit and are meant to be compared. Event volume is a
                    different unit, so it gets its own right axis instead of
                    flattening the user lines against a much larger scale. */}
                <YAxis
                  yAxisId="people"
                  tickFormatter={formatCompact}
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 13 }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                  allowDecimals={false}
                />

                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  tickFormatter={formatCompact}
                  tick={{ fill: activeBar.color, fontSize: 18 }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
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

                {/* Declared first so Recharts paints the volume bars behind the
                    two user series rather than burying them. */}
                <Bar
                  isAnimationActive={false}
                  yAxisId="volume"
                  dataKey={barMetric}
                  name={activeBar.label}
                  fill={activeBar.color}
                  fillOpacity={CHART_CONTEXT_FILL_OPACITY}
                  stroke={activeBar.color}
                  strokeOpacity={0.45}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                />

                <Area
                  isAnimationActive={false}
                  yAxisId="people"
                  type="monotone"
                  dataKey="activeUsers"
                  name="អ្នកប្រើប្រាស់សកម្ម"
                  stroke={CHART_SERIES.activeUsers}
                  strokeWidth={2.5}
                  fill={`url(#${activeUsersFillId})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                />

                <Line
                  isAnimationActive={false}
                  yAxisId="people"
                  type="monotone"
                  dataKey="newUsers"
                  name="អ្នកប្រើប្រាស់ថ្មី"
                  stroke={CHART_SERIES.newUsers}
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
