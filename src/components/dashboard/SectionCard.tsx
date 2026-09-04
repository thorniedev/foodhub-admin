import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import InfoTooltip from "@/src/components/ui/InfoTooltip";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b">
        {/* `min-w-0` at every level of this row: without it a long Khmer
            description forces the header wider than the card and pushes the
            actions off the edge. */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && (
            <span
              aria-hidden="true"
              className={cn(
                // Was 48px, which on mobile wrapped onto its own line and
                // left the title stranded below it.
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                styles.surface,
                styles.icon,
              )}
            >
              {icon}
            </span>
          )}

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <CardTitle className="truncate" title={title}>
                {title}
              </CardTitle>
              {hint && <InfoTooltip label={hint} />}
            </div>

            {description && (
              <CardDescription className="mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
        </div>

        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>

      <CardContent className={cn("pt-4", bodyClassName)}>{children}</CardContent>
    </Card>
  );
}
