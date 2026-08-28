"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, ShieldCheck } from "lucide-react";

import type { DashboardActionItem } from "@/src/types/adminDashboard";
import SectionCard from "./SectionCard";
import DashboardEmptyState from "./DashboardEmptyState";
import StatusBadge from "@/src/components/ui/StatusBadge";
import { TableSkeleton } from "./DashboardLoadingSkeleton";
import {
  ISSUE_TYPE_LABELS,
  SEVERITY_LABELS,
  labelFor,
  severityTone,
} from "./dashboard-theme";

/** Khmer guidance per issue type; the backend text is the fallback. */
const RECOMMENDATIONS: Record<string, string> = {
  INCOMPLETE_MENU_ITEM:
    "បំពេញការពិពណ៌នា រូបភាព និងទិន្នន័យគ្រឿងផ្សំ ដើម្បីឱ្យការត្រួតពិនិត្យសុវត្ថិភាពដំណើរការបានត្រឹមត្រូវ។",
  STALE_MENU_ITEM:
    "ពិនិត្យឡើងវិញនូវភាពអាចរកបាន តម្លៃ និងមាតិកា ព្រោះមុខម្ហូបនេះមិនបានធ្វើបច្ចុប្បន្នភាពជាង ៩០ ថ្ងៃ។",
  PENDING_STORE: "ត្រួតពិនិត្យហាងនេះ រួចអនុម័ត ឬបដិសេធ។",
};

function actionHref(item: DashboardActionItem): string | null {
  switch (item.issueType?.toUpperCase()) {
    case "PENDING_STORE":
      return `/shops/${item.entityUuid}`;
    case "INCOMPLETE_MENU_ITEM":
    case "STALE_MENU_ITEM":
      return "/menu-items";
    default:
      return null;
  }
}

interface ActionItemsPanelProps {
  items: DashboardActionItem[];
  isLoading?: boolean;
}

export default function ActionItemsPanel({
  items,
  isLoading = false,
}: ActionItemsPanelProps) {
  return (
    <SectionCard
      title="សកម្មភាពត្រូវធ្វើ"
      description="បញ្ហាទិន្នន័យដែលកំពុងរារាំងគុណភាពនៃការណែនាំ"
      icon={<ClipboardCheck size={18} aria-hidden="true" />}
      hint="បញ្ជីនេះមិនអាស្រ័យលើចន្លោះកាលបរិច្ឆេទទេ — វាបង្ហាញស្ថានភាពទិន្នន័យបច្ចុប្បន្ន។"
      bodyClassName="px-5 py-4"
    >
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : items.length === 0 ? (
        <DashboardEmptyState
          compact
          icon={<ShieldCheck size={22} aria-hidden="true" />}
          title="គ្មានបញ្ហាទិន្នន័យ"
          description="មុខម្ហូបទាំងអស់មានព័ត៌មានពេញលេញ ហើយគ្មានហាងរង់ចាំអនុម័តទេ។"
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => {
            const href = actionHref(item);
            const recommendation =
              RECOMMENDATIONS[item.issueType?.toUpperCase()] ?? item.recommendation;

            return (
              <li
                key={`${item.issueType}-${item.entityUuid}`}
                className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge tone={severityTone(item.severity)}>
                      {labelFor(SEVERITY_LABELS, item.severity)}
                    </StatusBadge>

                    <span className="text-lg font-normal text-gray-500">
                      {labelFor(ISSUE_TYPE_LABELS, item.issueType)}
                    </span>
                  </div>

                  <p className="mt-1.5 truncate text-xl font-medium text-gray-800">
                    {item.entityName}
                  </p>

                  {item.relatedName && (
                    <p className="truncate text-lg font-normal text-gray-400">
                      {item.relatedName}
                    </p>
                  )}

                  <p className="mt-1 text-lg font-normal leading-relaxed text-gray-600">
                    {recommendation}
                  </p>
                </div>

                {href && (
                  <Link
                    href={href}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span>ដោះស្រាយ</span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
