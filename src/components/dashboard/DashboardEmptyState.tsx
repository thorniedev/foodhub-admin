import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

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
      className={`flex flex-col items-center justify-center gap-2 text-center ${
        compact ? "py-8" : "py-14"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon ?? <Inbox size={22} aria-hidden="true" />}
      </span>

      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-xs text-muted-foreground">{description}</p>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
