import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import InfoTooltip from "@/src/components/ui/InfoTooltip";

interface SectionCardProps {
  title: string;
  description?: string;
  hint?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
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
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary-700">{icon}</span>}
            <p className="text-lg font-bold text-gray-900">{title}</p>
            {hint && <InfoTooltip label={hint} />}
          </div>
          {description && (
            <p className="mt-1 text-base text-gray-500">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>

      <div className={cn("flex-1 px-5 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}
