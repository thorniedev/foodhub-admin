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
        "relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-none",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 bg-transparent p-4 sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3.5">
            {icon && (
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
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
                <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
                {hint && <InfoTooltip label={hint} />}
              </div>

              {description && (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>

      <div className={cn("flex-1 p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
