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
import { Segmented } from "@/src/components/ui/segmented";
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
  withAlpha,
} from "./dashboard-theme";

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
        <Segmented
          label="ជ្រើសរើសរង្វាស់សម្រាប់សសរ"
          options={BAR_METRICS}
          value={barMetric}
          onChange={setBarMetric}
          size="sm"
        />
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
        <div className="flex flex-col gap-3">
          {/* One legend style for all three series. Two of them used to be
              hand-tinted chips and the third an inline-styled one, so the
              same list carried three different visual weights. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <LegendItem color={CHART_SERIES.activeUsers} label="អ្នកប្រើប្រាស់សកម្ម" />
            <LegendItem color={CHART_SERIES.newUsers} label="អ្នកប្រើប្រាស់ថ្មី" />
            <LegendItem color={activeBar.color} label={activeBar.label} muted />
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
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
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
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  allowDecimals={false}
                />

                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  tickFormatter={formatCompact}
                  tick={{ fill: activeBar.color, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  allowDecimals={false}
                />

                <Tooltip
                  cursor={{ fill: "var(--muted)", fillOpacity: 0.6 }}
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
                  strokeOpacity={0.4}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
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
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
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
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function LegendItem({
  color,
  label,
  muted = false,
}: {
  color: string;
  label: string;
  /** Marks the series drawn as context bars rather than a headline line. */
  muted?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full"
        style={{
          backgroundColor: muted ? withAlpha(color, 35) : color,
          outline: muted ? `1px solid ${color}` : undefined,
          outlineOffset: muted ? "-1px" : undefined,
        }}
      />
      {label}
    </span>
  );
}
