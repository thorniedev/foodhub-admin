import {
  AlertTriangle,
  Bookmark,
  CircleCheckBig,
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
    icon: <Users size={20} aria-hidden="true" />,
    tone: "green",
    format: formatCount,
    hint: "ចំនួនអ្នកប្រើប្រាស់ផ្សេងគ្នា ដែលមានសកម្មភាព (មើល ចុច ចូលចិត្ត...) ក្នុងចន្លោះកាលបរិច្ឆេទដែលបានជ្រើស។",
  },
  {
    key: "newUsers",
    label: "អ្នកប្រើប្រាស់ថ្មី",
    icon: <UserPlus size={20} aria-hidden="true" />,
    tone: "blue",
    format: formatCount,
    hint: "គណនីដែលបានបង្កើតក្នុងចន្លោះកាលបរិច្ឆេទដែលបានជ្រើស។",
  },
  {
    key: "recommendationSessions",
    label: "វគ្គណែនាំ",
    icon: <Sparkles size={20} aria-hidden="true" />,
    tone: "violet",
    format: formatCount,
    hint: "ចំនួនវគ្គណែនាំម្ហូបដែលបានចាប់ផ្ដើមក្នុងចន្លោះកាលបរិច្ឆេទនេះ។",
  },
  {
    key: "recommendationSuccessRate",
    label: "អត្រាជោគជ័យនៃការណែនាំ",
    icon: <CircleCheckBig size={20} aria-hidden="true" />,
    tone: "green",
    format: formatPercentValue,
    hint: "វគ្គដែលមានស្ថានភាព READY ឬ COMPLETED ធៀបនឹងវគ្គទាំងអស់។",
  },
  {
    key: "activeStores",
    label: "ហាងសកម្ម",
    icon: <Store size={20} aria-hidden="true" />,
    tone: "green",
    format: formatCount,
    hint: "ហាងដែលបានអនុម័ត និងគណនីនៅសកម្ម។",
  },
  {
    key: "liveMenuItems",
    label: "មុខម្ហូបកំពុងលក់",
    icon: <Utensils size={20} aria-hidden="true" />,
    tone: "blue",
    format: formatCount,
    hint: "មុខម្ហូបដែលមានស្ថានភាព AVAILABLE។",
  },
  {
    key: "bookmarks",
    label: "ការរក្សាទុក",
    icon: <Bookmark size={20} aria-hidden="true" />,
    tone: "amber",
    format: formatCount,
    hint: "ចំនួនការរក្សាទុកមុខម្ហូប ឬហាង ក្នុងចន្លោះកាលបរិច្ឆេទនេះ។",
  },
  {
    key: "openDataIssues",
    label: "បញ្ហាទិន្នន័យមិនទាន់ដោះស្រាយ",
    icon: <AlertTriangle size={20} aria-hidden="true" />,
    tone: "red",
    format: formatCount,
    higherIsBetter: false,
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
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_DEFINITIONS.map((definition) => {
        const metric = readMetric(kpis, definition.key);

        return (
          <DashboardKpiCard
            key={definition.key}
            label={definition.label}
            icon={definition.icon}
            tone={definition.tone}
            hint={definition.hint}
            higherIsBetter={definition.higherIsBetter}
            value={definition.format(metric?.value)}
            previousValue={
              metric?.previousValue === null || metric?.previousValue === undefined
                ? null
                : definition.format(metric.previousValue)
            }
            changePercent={metric?.changePercent ?? null}
          />
        );
      })}
    </div>
  );
}

export { KPI_DEFINITIONS };
