import {
  AlertTriangle,
  Bookmark,
  CircleCheckBig,
  Hourglass,
  Sparkles,
  Store,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";

import type { DashboardKpis, DashboardMetric } from "@/src/types/adminDashboard";
import DashboardKpiCard from "./DashboardKpiCard";
import {
  formatCount,
  formatPercentValue,
  type Tone,
} from "./dashboard-theme";

type ValueFormatter = (value: number | null | undefined) => string;

interface KpiDefinition {
  key: string;
  label: string;
  icon: React.ReactNode;
  tone: Tone;
  format: ValueFormatter;
  higherIsBetter?: boolean;
  hint?: string;
  /**
   * `primary` metrics move day to day and are what the page is for.
   * `secondary` metrics are inventory counts that rarely change — they were
   * previously given the same weight, which left eight identical cards and
   * nothing for the eye to land on.
   */
  tier: "primary" | "secondary";
}

/**
 * Ordered by operational usefulness — the metrics an admin acts on first.
 * Tones are mixed deliberately so "everything is green" never reads as
 * "everything is fine".
 */
const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    key: "activeUsers",
    label: "អ្នកប្រើប្រាស់សកម្ម",
    icon: <Users size={18} aria-hidden="true" />,
    tone: "green",
    format: formatCount,
    tier: "primary",
    hint: "ចំនួនអ្នកប្រើប្រាស់ផ្សេងគ្នា ដែលមានសកម្មភាព (មើល ចុច ចូលចិត្ត...) ក្នុងចន្លោះកាលបរិច្ឆេទដែលបានជ្រើស។",
  },
  {
    key: "newUsers",
    label: "អ្នកប្រើប្រាស់ថ្មី",
    icon: <UserPlus size={18} aria-hidden="true" />,
    tone: "blue",
    format: formatCount,
    tier: "primary",
    hint: "គណនីដែលបានបង្កើតក្នុងចន្លោះកាលបរិច្ឆេទដែលបានជ្រើស។",
  },
  {
    key: "recommendationSessions",
    label: "វគ្គណែនាំ",
    icon: <Sparkles size={18} aria-hidden="true" />,
    tone: "orange",
    format: formatCount,
    tier: "primary",
    hint: "ចំនួនវគ្គណែនាំម្ហូបដែលបានចាប់ផ្ដើមក្នុងចន្លោះកាលបរិច្ឆេទនេះ។",
  },
  {
    key: "recommendationSuccessRate",
    label: "អត្រាជោគជ័យនៃការណែនាំ",
    icon: <CircleCheckBig size={18} aria-hidden="true" />,
    tone: "green",
    format: formatPercentValue,
    tier: "primary",
    hint: "វគ្គដែលមានស្ថានភាព READY ឬ COMPLETED ធៀបនឹងវគ្គទាំងអស់។",
  },
  {
    key: "activeStores",
    label: "ហាងសកម្ម",
    icon: <Store size={16} aria-hidden="true" />,
    tone: "green",
    format: formatCount,
    tier: "secondary",
    hint: "ហាងដែលបានអនុម័ត និងគណនីនៅសកម្ម។",
  },
  {
    // Previously invisible on the dashboard — the only place a real pending
    // count existed was folded, unlabelled, into `openDataIssues`, and the
    // Action Items panel below shows only a short preview list, which read as
    // the full count. This is the actual total.
    key: "pendingStores",
    label: "ហាងរង់ចាំអនុម័ត",
    icon: <Hourglass size={16} aria-hidden="true" />,
    tone: "amber",
    format: formatCount,
    higherIsBetter: false,
    tier: "secondary",
    hint: "ចំនួនហាងសរុបដែលកំពុងរង់ចាំការត្រួតពិនិត្យ និងអនុម័ត។",
  },
  {
    key: "liveMenuItems",
    label: "មុខម្ហូបកំពុងលក់",
    icon: <Utensils size={16} aria-hidden="true" />,
    tone: "blue",
    format: formatCount,
    tier: "secondary",
    hint: "មុខម្ហូបដែលមានស្ថានភាព AVAILABLE។",
  },
  {
    key: "bookmarks",
    label: "ការរក្សាទុក",
    icon: <Bookmark size={16} aria-hidden="true" />,
    tone: "amber",
    format: formatCount,
    tier: "secondary",
    hint: "ចំនួនការរក្សាទុកមុខម្ហូប ឬហាង ក្នុងចន្លោះកាលបរិច្ឆេទនេះ។",
  },
  {
    key: "openDataIssues",
    label: "បញ្ហាទិន្នន័យមិនទាន់ដោះស្រាយ",
    icon: <AlertTriangle size={16} aria-hidden="true" />,
    tone: "red",
    format: formatCount,
    higherIsBetter: false,
    tier: "secondary",
    hint: "មុខម្ហូបខ្វះព័ត៌មាន បូកនឹងហាងដែលកំពុងរង់ចាំការអនុម័ត។ លេខទាបគឺល្អ។",
  },
];

interface DashboardKpiGridProps {
  kpis: DashboardKpis;
}

function readMetric(
  kpis: DashboardKpis,
  key: string,
): DashboardMetric | undefined {
  return kpis?.[key];
}

export default function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  const renderCard = (
    definition: KpiDefinition,
    variant: "primary" | "compact",
  ) => {
    const metric = readMetric(kpis, definition.key);

    return (
      <DashboardKpiCard
        key={definition.key}
        label={definition.label}
        icon={definition.icon}
        tone={definition.tone}
        hint={definition.hint}
        higherIsBetter={definition.higherIsBetter}
        variant={variant}
        value={definition.format(metric?.value)}
        previousValue={
          metric?.previousValue === null || metric?.previousValue === undefined
            ? null
            : definition.format(metric.previousValue)
        }
        changePercent={metric?.changePercent ?? null}
      />
    );
  };

  const primary = KPI_DEFINITIONS.filter((d) => d.tier === "primary");
  const secondary = KPI_DEFINITIONS.filter((d) => d.tier === "secondary");

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((definition) => renderCard(definition, "primary"))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {secondary.map((definition) => renderCard(definition, "compact"))}
      </div>
    </div>
  );
}

export { KPI_DEFINITIONS };
