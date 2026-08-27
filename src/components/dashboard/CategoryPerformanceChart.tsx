"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layers } from "lucide-react";

import type { CategorySummary } from "@/src/types/adminDashboard";
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

type CategoryMetric = "views" | "clicks" | "bookmarks";

const METRICS: { value: CategoryMetric; label: string; color: string }[] = [
  { value: "views", label: "ការមើល", color: CHART_SERIES.views },
  { value: "clicks", label: "ការចុច", color: CHART_SERIES.clicks },
  { value: "bookmarks", label: "ការរក្សាទុក", color: CHART_SERIES.sessions },
];

const TOP_CATEGORIES = 8;

interface CategoryPerformanceChartProps {
  data: CategorySummary[];
  isLoading?: boolean;
}

export default function CategoryPerformanceChart({
  data,
  isLoading = false,
}: CategoryPerformanceChartProps) {
  const [metric, setMetric] = useState<CategoryMetric>("views");
  const activeMetric = METRICS.find((option) => option.value === metric)!;

  const rows = useMemo(
    () =>
      [...data]
        .sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))
        .slice(0, TOP_CATEGORIES),
    [data, metric],
  );

  const hasSignal = rows.some((row) => (row[metric] ?? 0) > 0);

  return (
    <SectionCard
      title="សមិទ្ធកម្មតាមប្រភេទម្ហូប"
      description={`ប្រភេទកំពូល ${TOP_CATEGORIES} តាម${activeMetric.label}`}
      icon={<Layers size={18} aria-hidden="true" />}
      tone="violet"
      hint="អ្នកមើលផ្សេងគ្នា ត្រូវបានរាប់ដាច់ដោយឡែកសម្រាប់ប្រភេទទាំងមូល មិនមែនបូកបញ្ចូលពីមុខម្ហូបនីមួយៗទេ។"
      actions={
        <div
          role="group"
          aria-label="ជ្រើសរើសរង្វាស់ប្រភេទ"
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
          title="គ្មានទិន្នន័យប្រភេទម្ហូប"
          description="មិនមានប្រភេទណាមួយមានសកម្មភាពក្នុងតម្រងនេះទេ។"
        />
      ) : (
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
                dataKey="categoryName"
                tick={{ fill: CHART_AXIS_TEXT, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={124}
              />

              <Tooltip
                cursor={{ fill: "rgba(17,24,39,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as CategorySummary;

                  return (
                    <ChartTooltip
                      title={`${row.categoryName} (${row.categoryCode})`}
                      rows={METRICS.map((option) => ({
                        key: option.value,
                        color: option.color,
                        label: option.label,
                        value: formatCount(row[option.value]),
                      }))}
                      footer={`CTR ${formatRatio(row.clickThroughRate)} · អ្នកមើលផ្សេងគ្នា ${formatCount(row.uniqueViewers)}`}
                    />
                  );
                }}
              />

              <Bar
                dataKey={metric}
                name={activeMetric.label}
                fill={activeMetric.color}
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
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
