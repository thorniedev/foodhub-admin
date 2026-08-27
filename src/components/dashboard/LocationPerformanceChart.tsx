"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPin } from "lucide-react";

import type { LocationSummary } from "@/src/types/adminDashboard";
import SectionCard from "./SectionCard";
import ChartTooltip from "./ChartTooltip";
import DashboardEmptyState from "./DashboardEmptyState";
import { ChartSkeleton } from "./DashboardLoadingSkeleton";
import {
  CHART_AXIS_TEXT,
  CHART_GRID,
  CHART_SERIES,
  formatCompact,
  formatCount,
  formatRatio,
} from "./dashboard-theme";
import { cn } from "@/src/lib/utils";

type LocationMetric = "views" | "clicks";

const METRICS: { value: LocationMetric; label: string; color: string }[] = [
  { value: "views", label: "ការមើល", color: CHART_SERIES.views },
  { value: "clicks", label: "ការចុច", color: CHART_SERIES.clicks },
];

const TOP_LOCATIONS = 8;

interface LocationPerformanceChartProps {
  data: LocationSummary[];
  isLoading?: boolean;
  /** Applies this location as a dashboard filter. */
  onSelectLocation?: (location: LocationSummary) => void;
  activeLocationLabel?: string | null;
}

export default function LocationPerformanceChart({
  data,
  isLoading = false,
  onSelectLocation,
  activeLocationLabel,
}: LocationPerformanceChartProps) {
  const [metric, setMetric] = useState<LocationMetric>("views");
  const activeMetric = METRICS.find((option) => option.value === metric)!;

  const rows = useMemo(
    () =>
      [...data]
        .sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))
        .slice(0, TOP_LOCATIONS),
    [data, metric],
  );

  const hasSignal = rows.some((row) => (row[metric] ?? 0) > 0);

  return (
    <SectionCard
      title="សមិទ្ធកម្មតាមទីតាំង"
      description={`ទីតាំងកំពូល ${TOP_LOCATIONS} តាម${activeMetric.label}`}
      icon={<MapPin size={18} aria-hidden="true" />}
      tone="blue"
      hint="ដាក់ជាក្រុមតាមក្រុងមុន បន្ទាប់មកខេត្ត។ ហាងដែលគ្មានទាំងពីរនឹងបង្ហាញជា Unknown។"
      actions={
        <div
          role="group"
          aria-label="ជ្រើសរើសរង្វាស់ទីតាំង"
          className="flex items-center gap-1 rounded-full bg-gray-100 p-1"
        >
          {METRICS.map((option) => {
            const active = option.value === metric;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setMetric(option.value)}
                className={cn(
                  "min-h-9 rounded-full px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {option.label}
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
          title="គ្មានទិន្នន័យទីតាំង"
          description="មិនមានហាងដែលមានសកម្មភាពក្នុងតម្រងនេះទេ។"
        />
      ) : (
        <>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
                barCategoryGap={6}
              >
                <CartesianGrid
                  stroke={CHART_GRID}
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  tickFormatter={formatCompact}
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_GRID }}
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="location"
                  tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={124}
                />

                <Tooltip
                  cursor={{ fill: "rgba(17,24,39,0.04)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as LocationSummary;

                    return (
                      <ChartTooltip
                        title={row.location}
                        rows={[
                          {
                            key: "views",
                            color: CHART_SERIES.views,
                            label: "ការមើល",
                            value: formatCount(row.views),
                          },
                          {
                            key: "clicks",
                            color: CHART_SERIES.clicks,
                            label: "ការចុច",
                            value: formatCount(row.clicks),
                          },
                          {
                            key: "uniqueViewers",
                            color: CHART_SERIES.activeUsers,
                            label: "អ្នកមើលផ្សេងគ្នា",
                            value: formatCount(row.uniqueViewers),
                          },
                        ]}
                        footer={`CTR ${formatRatio(row.clickThroughRate)} · ហាងសកម្ម ${formatCount(row.activeStores)}`}
                      />
                    );
                  }}
                />

                <Bar
                  dataKey={metric}
                  name={activeMetric.label}
                  radius={[0, 10, 10, 0]}
                  maxBarSize={22}
                  background={{ fill: "#eef2f7" }}
                >
                  <LabelList
                    dataKey={metric}
                    position="right"
                    offset={8}
                    formatter={(value: number) => formatCompact(value)}
                    style={{ fill: CHART_AXIS_TEXT, fontSize: 12, fontWeight: 600 }}
                  />

                  {rows.map((row) => (
                    <Cell
                      key={row.location}
                      fill={activeMetric.color}
                      opacity={
                        activeLocationLabel && activeLocationLabel !== row.location
                          ? 0.45
                          : 1
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {onSelectLocation && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
              <span className="w-full text-sm text-gray-500">
                ចុចទីតាំង ដើម្បីត្រងផ្ទាំងទាំងមូលតាមទីតាំងនោះ
              </span>

              {rows.map((row) => {
                const active = activeLocationLabel === row.location;

                return (
                  <button
                    key={row.location}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelectLocation(row)}
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                      active
                        ? "border-primary-300 bg-primary-50 text-primary-800"
                        : "border-gray-200 text-gray-700 hover:border-primary-200 hover:bg-primary-50/60",
                    )}
                  >
                    <MapPin size={14} aria-hidden="true" />
                    {row.location}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
