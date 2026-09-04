import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/src/lib/utils";
import InfoTooltip from "@/src/components/ui/InfoTooltip";
import { Card } from "@/src/components/ui/card";
import { TONE_STYLES, formatChange, type Tone } from "./dashboard-theme";

export interface DashboardKpiCardProps {
  label: string;
  icon: ReactNode;
  tone: Tone;
  /** Already formatted for display. */
  value: string;
  previousValue: string | null;
  changePercent: number | null;
  /** Drives the direction colour: false means a rise is a regression. */
  higherIsBetter?: boolean;
  hint?: string;
  /**
   * `primary` is the headline tier — big figure, full-width footer.
   * `compact` is the supporting tier, one line taller than a table row.
   */
  variant?: "primary" | "compact";
}

export default function DashboardKpiCard({
  label,
  icon,
  tone,
  value,
  previousValue,
  changePercent,
  higherIsBetter = true,
  hint,
  variant = "primary",
}: DashboardKpiCardProps) {
  const styles = TONE_STYLES[tone];
  const change = formatChange(changePercent);

  const flat = changePercent !== null && Math.abs(changePercent) < 0.05;
  const rising = changePercent !== null && changePercent > 0;
  const improving = rising === higherIsBetter;

  const changeClassName = flat
    ? "text-muted-foreground"
    : improving
      ? "text-primary-700 dark:text-primary-400"
      : "text-red-600 dark:text-red-400";

  const ChangeIcon = flat ? Minus : rising ? ArrowUpRight : ArrowDownRight;

  const delta = change ? (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-semibold tabular-nums",
        changeClassName,
      )}
      // The clamped form hides the real magnitude, so keep it reachable.
      title={
        change.clamped && changePercent !== null
          ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`
          : undefined
      }
    >
      <ChangeIcon size={13} aria-hidden="true" />
      {change.text}
    </span>
  ) : (
    <span className="text-muted-foreground">គ្មានទិន្នន័យប្រៀបធៀប</span>
  );

  if (variant === "compact") {
    return (
      <Card className="group gap-0 p-3.5 transition-colors hover:border-primary/30">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              styles.surface,
              styles.icon,
            )}
          >
            {icon}
          </span>

          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {/* `title` keeps the full Khmer label recoverable once the
                ellipsis hides it — several of these labels are long. */}
            <p
              title={label}
              className="min-w-0 truncate text-xs font-medium text-muted-foreground"
            >
              {label}
            </p>
            {hint && <InfoTooltip label={hint} />}
          </div>
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          <span className="pb-0.5 text-[0.6875rem]">{delta}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group relative gap-0 overflow-hidden p-5 transition-colors hover:border-primary/30">
      {/* Tone lives on this rail rather than on the card fill, so a row of
          cards stays a row of cards instead of a swatch book. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] opacity-70",
          styles.bar,
        )}
      />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p
            title={label}
            className="min-w-0 truncate text-xs font-medium text-muted-foreground"
          >
            {label}
          </p>
          {hint && <InfoTooltip label={hint} />}
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            styles.surface,
            styles.icon,
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-[1.75rem] leading-9 font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-3 text-[0.6875rem]">
        {delta}
        <span className="text-muted-foreground tabular-nums">
          ធៀបនឹង {previousValue ?? "—"}
        </span>
      </div>
    </Card>
  );
}
