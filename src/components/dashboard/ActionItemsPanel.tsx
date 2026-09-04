"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, ShieldCheck } from "lucide-react";

import type { DashboardActionItem } from "@/src/types/adminDashboard";
import SectionCard from "./SectionCard";
import DashboardEmptyState from "./DashboardEmptyState";
import StatusBadge from "@/src/components/ui/StatusBadge";
import { Badge } from "@/src/components/ui/badge";
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

interface ActionItemsGroup {
  issueType: string;
  severity: string;
  recommendation: string;
  items: DashboardActionItem[];
}

interface ActionItemsPanelProps {
  items: DashboardActionItem[];
  isLoading?: boolean;
}

export default function ActionItemsPanel({
  items,
  isLoading = false,
}: ActionItemsPanelProps) {
  /**
   * The recommendation is a property of the issue *type*, not of the row —
   * every pending store carries the identical sentence. Rendering it once per
   * row turned ten entries into a wall of duplicated paragraphs, so it is
   * hoisted to the group header and each row keeps only what is unique to it.
   */
  const groups = useMemo<ActionItemsGroup[]>(() => {
    const byType = new Map<string, ActionItemsGroup>();

    for (const item of items) {
      const issueType = item.issueType?.toUpperCase() ?? "UNKNOWN";
      const existing = byType.get(issueType);

      if (existing) {
        existing.items.push(item);
        continue;
      }

      byType.set(issueType, {
        issueType,
        severity: item.severity,
        recommendation: RECOMMENDATIONS[issueType] ?? item.recommendation,
        items: [item],
      });
    }

    return [...byType.values()].sort((a, b) => b.items.length - a.items.length);
  }, [items]);

  return (
    <SectionCard
      title="សកម្មភាពត្រូវធ្វើ"
      description="បញ្ហាទិន្នន័យដែលកំពុងរារាំងគុណភាពនៃការណែនាំ"
      icon={<ClipboardCheck size={16} aria-hidden="true" />}
      hint="បញ្ជីនេះមិនអាស្រ័យលើចន្លោះកាលបរិច្ឆេទទេ — វាបង្ហាញស្ថានភាពទិន្នន័យបច្ចុប្បន្ន។"
      tone="amber"
      actions={
        items.length > 0 ? (
          <Badge tone="amber">{items.length} បញ្ហា</Badge>
        ) : undefined
      }
      bodyClassName="pt-0"
    >
      {isLoading ? (
        <div className="pt-4">
          <TableSkeleton rows={4} />
        </div>
      ) : items.length === 0 ? (
        <div className="pt-4">
          <DashboardEmptyState
            compact
            icon={<ShieldCheck size={22} aria-hidden="true" />}
            title="គ្មានបញ្ហាទិន្នន័យ"
            description="មុខម្ហូបទាំងអស់មានព័ត៌មានពេញលេញ ហើយគ្មានហាងរង់ចាំអនុម័តទេ។"
          />
        </div>
      ) : (
        <div className="divide-y">
          {groups.map((group) => (
            <section key={group.issueType} className="py-4 first:pt-4 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={severityTone(group.severity)}>
                  {labelFor(SEVERITY_LABELS, group.severity)}
                </StatusBadge>

                <h3 className="text-xs font-semibold text-foreground">
                  {labelFor(ISSUE_TYPE_LABELS, group.issueType)}
                </h3>

                <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
                  {group.items.length}
                </span>
              </div>

              {group.recommendation && (
                <p className="mt-1 text-[0.6875rem] leading-5 text-muted-foreground">
                  {group.recommendation}
                </p>
              )}

              <ul className="mt-2.5 grid grid-cols-1 gap-1.5 lg:grid-cols-2">
                {group.items.map((item) => {
                  const href = actionHref(item);

                  return (
                    <li key={`${item.issueType}-${item.entityUuid}`}>
                      <ActionRow item={item} href={href} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function ActionRow({
  item,
  href,
}: {
  item: DashboardActionItem;
  href: string | null;
}) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-xs font-medium text-foreground"
          title={item.entityName}
        >
          {item.entityName}
        </span>
        {item.relatedName && (
          <span
            className="block truncate text-[0.6875rem] text-muted-foreground"
            title={item.relatedName}
          >
            {item.relatedName}
          </span>
        )}
      </span>

      {href && (
        <span className="inline-flex shrink-0 items-center gap-0.5 text-[0.6875rem] font-medium text-muted-foreground transition group-hover:text-primary">
          ដោះស្រាយ
          <ArrowUpRight size={13} aria-hidden="true" />
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2">
        {body}
      </div>
    );
  }

  // The whole row is the target rather than a small trailing button — the
  // button was the only hit area and sat at the far right of a wide row.
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2 transition hover:border-primary/30 hover:bg-primary-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:hover:bg-primary-950/30"
    >
      {body}
    </Link>
  );
}
