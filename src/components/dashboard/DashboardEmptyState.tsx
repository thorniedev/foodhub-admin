import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/src/lib/utils";

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export default function DashboardEmptyState({
  title = "គ្មានទិន្នន័យសម្រាប់តម្រងនេះ",
  description = "សូមពង្រីកចន្លោះកាលបរិច្ឆេទ ឬដកតម្រងទីតាំង/ប្រភេទចេញ។",
  icon,
  action,
  compact = false,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        compact ? "py-8" : "py-14",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox size={18} aria-hidden="true" />}
      </span>

      {/* These titles used to render at `text-2xl` inside a card whose own
          title is 15px, so the empty state outshouted the section it sat in. */}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
