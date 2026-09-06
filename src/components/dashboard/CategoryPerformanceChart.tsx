"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Layers } from "lucide-react";

import type { CategorySummary } from "@/src/types/adminDashboard";
import { Segmented } from "@/src/components/ui/segmented";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/src/components/ui/chart";
import SectionCard from "./SectionCard";
import { ChartTooltipPanel, ChartTooltipRow } from "./ChartTooltipRow";
import DashboardEmptyState from "./DashboardEmptyState";
import { ChartSkeleton } from "./DashboardLoadingSkeleton";
import {
  CHART_AXIS_TEXT,
  CHART_GRID,
  CHART_SERIES,
  formatCompact,
  formatCount,
  formatRatio,
  rankOpacity,
} from "./dashboard-theme";

type CategoryMetric = "views" | "clicks" | "bookmarks";

const METRICS: { value: CategoryMetric; label: string; color: string }[] = [
  { value: "views", label: "ការមើល", color: CHART_SERIES.views },
  { value: "clicks", label: "ការចុច", color: CHART_SERIES.clicks },
  { value: "bookmarks", label: "ការរក្សាទុក", color: CHART_SERIES.bookmarks },
];

const CHART_CONFIG: ChartConfig = {
  views: { label: "ការមើល", color: CHART_SERIES.views },
  clicks: { label: "ការចុច", color: CHART_SERIES.clicks },
  bookmarks: { label: "ការរក្សាទុក", color: CHART_SERIES.bookmarks },
};

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
        // Categories with no activity are dropped rather than given an empty
        // lane in the ranking. See LocationPerformanceChart for the reasoning.
        .filter((row) => (row[metric] ?? 0) > 0)
        .sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))
        .slice(0, TOP_CATEGORIES),
    [data, metric],
  );

  const hasSignal = rows.length > 0;

  return (
    <SectionCard
      title="សមិទ្ធកម្មតាមប្រភេទម្ហូប"
      description={`ប្រភេទកំពូល ${TOP_CATEGORIES} តាម${activeMetric.label}`}
      icon={<Layers size={18} aria-hidden="true" />}
      tone="orange"
      hint="អ្នកមើលផ្សេងគ្នា ត្រូវបានរាប់ដាច់ដោយឡែកសម្រាប់ប្រភេទទាំងមូល មិនមែនបូកបញ្ចូលពីមុខម្ហូបនីមួយៗទេ។"
      actions={
        <Segmented
          label="ជ្រើសរើសរង្វាស់ប្រភេទ"
          options={METRICS}
          value={metric}
          onChange={setMetric}
          size="sm"
        />
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
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[340px] w-full">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 30, bottom: 0, left: 0 }}
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
              width={150}
            />

            {/* Shows all three metrics per category, not just the one
                plotted — see LocationPerformanceChart for why this is a
                custom renderer rather than <ChartTooltipContent>. */}
            <ChartTooltip
              cursor={{ fill: "var(--muted)", fillOpacity: 0.6 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as CategorySummary | undefined;
                if (!row) return null;

                return (
                  <ChartTooltipPanel
                    title={`${row.categoryName} (${row.categoryCode})`}
                    footer={`CTR ${formatRatio(row.clickThroughRate)} · អ្នកមើលផ្សេងគ្នា ${formatCount(row.uniqueViewers)}`}
                  >
                    {METRICS.map((option) => (
                      <ChartTooltipRow
                        key={option.value}
                        color={option.color}
                        label={option.label}
                        value={formatCount(row[option.value])}
                      />
                    ))}
                  </ChartTooltipPanel>
                );
              }}
            />

            <Bar
              isAnimationActive={false}
              dataKey={metric}
              name={activeMetric.label}
              radius={[0, 4, 4, 0]}
              maxBarSize={18}
              background={{ fill: "var(--muted)", opacity: 0.55 }}
            >
              <LabelList
                dataKey={metric}
                position="right"
                offset={8}
                formatter={(value: number) => formatCompact(value)}
                style={{ fill: CHART_AXIS_TEXT, fontSize: 11, fontWeight: 600 }}
              />

              {/* Rows are already sorted by the active metric, so fading
                  down the list makes rank legible without reading the axis,
                  while the hue keeps saying which metric this is. */}
              {rows.map((row, index) => (
                <Cell
                  key={row.categoryCode}
                  fill={activeMetric.color}
                  fillOpacity={rankOpacity(index, rows.length)}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </SectionCard>
  );
}
