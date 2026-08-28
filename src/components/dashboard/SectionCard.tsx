import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import InfoTooltip from "@/src/components/ui/InfoTooltip";
import { TONE_STYLES, type Tone } from "./dashboard-theme";

interface SectionCardProps {
  title: string;
  description?: string;
  hint?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: Tone;
}

/**
 * The single card surface used across the dashboard. Everything sits directly
 * on this shell — nested cards are deliberately avoided.
 */
export default function SectionCard({
  title,
  description,
  hint,
  icon,
  actions,
  children,
  className,
  bodyClassName,
  tone = "gray",
}: SectionCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <section
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <div className={cn("h-1.5 w-full", styles.surface)} />

      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100/90 bg-gradient-to-r from-gray-50/75 via-white to-white px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            {icon && (
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                  styles.surface,
                  styles.border,
                  styles.icon,
                )}
              >
                {icon}
              </span>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900">{title}</p>
                {hint && <InfoTooltip label={hint} />}
              </div>

              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>

      <div className={cn("flex-1 px-5 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}
