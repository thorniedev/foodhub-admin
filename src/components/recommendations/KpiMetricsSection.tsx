"use client";

import React from "react";
import {
  Layers,
  Clock,
  ShieldAlert,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { AdminKpiMetrics } from "@/src/types/adminRecommendation";

interface KpiMetricsSectionProps {
  kpis: AdminKpiMetrics;
  loading?: boolean;
}

/**
 * Shared shell for the five audit KPIs.
 *
 * Every card previously repeated the same twenty classes inline at `text-lg`
 * for the label and `text-3xl` for the value, which made a four-word label like
 * "Allergen Block Rate" wrap to two lines inside a card 200px wide.
 */
function KpiCard({
  label,
  icon,
  iconClassName,
  value,
  valueClassName,
  loading,
  children,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  iconClassName: string;
  value: string;
  valueClassName?: string;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 p-4 transition-colors", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          {icon}
        </span>
      </div>

      {loading ? (
        <Skeleton className="mt-2.5 h-7 w-24" />
      ) : (
        <p
          className={cn(
            "mt-2.5 text-2xl leading-8 font-bold tracking-tight tabular-nums",
            valueClassName ?? "text-foreground",
          )}
        >
          {value}
        </p>
      )}

      {children && <div className="mt-2">{children}</div>}
    </Card>
  );
}

export default function KpiMetricsSection({
  kpis,
  loading = false,
}: KpiMetricsSectionProps) {
  const total = kpis.totalSessions || 0;
  const soloCount = kpis.soloModeCount || 0;
  const groupCount = kpis.groupModeCount || 0;
  const totalModes = soloCount + groupCount;
  const soloPercent = totalModes > 0 ? Math.round((soloCount / totalModes) * 100) : 0;
  const groupPercent = totalModes > 0 ? 100 - soloPercent : 0;

  const blockRate = Math.min(100, Math.max(0, kpis.safetyBlockRate ?? 0));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        label="Total Sessions"
        icon={<Layers size={16} aria-hidden="true" />}
        iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        value={total.toLocaleString()}
        loading={loading}
      >
        <p className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
          <TrendingUp size={12} aria-hidden="true" className="text-blue-500" />
          <span>Recorded recommendation runs</span>
        </p>
      </KpiCard>

      <KpiCard
        label="Avg Latency"
        icon={<Clock size={16} aria-hidden="true" />}
        iconClassName="bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-400"
        value={`${kpis.avgLatencyMs || 0} ms`}
        loading={loading}
      >
        <p className="text-[0.6875rem] text-muted-foreground">
          Deterministic AI &amp; filter pipeline
        </p>
      </KpiCard>

      <KpiCard
        label="Allergen Block Rate"
        icon={<ShieldAlert size={16} aria-hidden="true" />}
        iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
        value={`${kpis.safetyBlockRate ?? 0}%`}
        valueClassName="text-rose-600 dark:text-rose-400"
        loading={loading}
      >
        <div className="space-y-1.5">
          <div
            role="meter"
            aria-valuenow={Math.round(blockRate)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Allergen block rate"
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-500"
              style={{ width: `${blockRate}%` }}
            />
          </div>
          <p className="text-[0.6875rem] text-muted-foreground">
            Zero-tolerance allergen filter
          </p>
        </div>
      </KpiCard>

      <KpiCard
        label="Mode Distribution"
        icon={<Users size={16} aria-hidden="true" />}
        iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
        value={`${soloPercent}% / ${groupPercent}%`}
        loading={loading}
      >
        {/* One stacked bar says the same thing as the two swatches below it and
            makes the split readable without doing the arithmetic. */}
        <div className="space-y-1.5">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="bg-blue-500" style={{ width: `${soloPercent}%` }} />
            <div className="bg-purple-500" style={{ width: `${groupPercent}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem]">
            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-blue-500"
              />
              Solo {soloPercent}%
            </span>
            <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-purple-500"
              />
              Group {groupPercent}%
            </span>
          </div>
        </div>
      </KpiCard>

      <KpiCard
        label="AI Strategy Health"
        icon={<Sparkles size={16} aria-hidden="true" />}
        iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        value={`${kpis.aiStrategyHealthRate ?? 0}%`}
        valueClassName="text-amber-600 dark:text-amber-400"
        loading={loading}
        className="sm:col-span-2 lg:col-span-1"
      >
        <p className="text-[0.6875rem] text-muted-foreground">
          Active multi-strategy scoring
        </p>
      </KpiCard>
    </div>
  );
}
