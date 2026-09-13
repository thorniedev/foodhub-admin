"use client";

import { useState } from "react";

import {
  Bell,
  Bot,
  Clock,
  MapPin,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Store,
} from "lucide-react";

import {
  useGetSystemSettingsQuery,
  useResetSystemSettingMutation,
  useUpdateSystemSettingMutation,
} from "@/src/app/store/systemSettingApi";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";

import { getApiErrorMessage, type ApiMessage } from "@/src/types/safetyResource";

import AiProviderKeyManager from "./AiProviderKeyManager";
import SettingsMessageBanner from "./SettingsMessageBanner";

import type {
  SystemSetting,
  SystemSettingCategory,
  SystemSettingKey,
} from "@/src/types/system-setting";

/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORY_ORDER: SystemSettingCategory[] = [
  "NEARBY_ALERTS",
  "MEAL_REMINDERS",
  "STORE_IMPORT",
  "AI_RECOMMENDATION",
  "NOTIFICATIONS",
];

const CATEGORY_LABELS: Record<SystemSettingCategory, string> = {
  NEARBY_ALERTS: "ការជូនដំណឹងហាងនៅជិត",
  MEAL_REMINDERS: "ម៉ោងរំលឹកអាហារ",
  STORE_IMPORT: "នាំចូលហាង (Google Places)",
  AI_RECOMMENDATION: "អនុសាសន៍ AI",
  NOTIFICATIONS: "ការជូនដំណឹង",
};

const CATEGORY_SUBTITLES: Record<SystemSettingCategory, string> = {
  NEARBY_ALERTS: "កំណត់ចម្ងាយ ចំនួនដងក្នុងមួយថ្ងៃ និងល្បឿនកាត់ផ្តាច់សម្រាប់ការជូនដំណឹងហាងនៅជិត",
  MEAL_REMINDERS: "កំណត់កាំរង្វង់ស្វែងរកលំនាំដើម និងរយៈពេលកាស់ Redis",
  STORE_IMPORT: "កំណត់ក្របខណ្ឌទីតាំង (bounding box) និងលេខកូដតំបន់សម្រាប់ស្វែងរកហាងតាម Google Places",
  AI_RECOMMENDATION: "គ្រប់គ្រងថាតើ AI ត្រូវប្រើឬអត់ និងដែនកំណត់សម្រាប់ការហៅ AI",
  NOTIFICATIONS: "កុងតាក់សម្រាប់បិទ/បើកប្រព័ន្ធជូនដំណឹងទាំងមូល",
};

const CATEGORY_ICONS: Record<SystemSettingCategory, typeof Bell> = {
  NEARBY_ALERTS: MapPin,
  MEAL_REMINDERS: Clock,
  STORE_IMPORT: Store,
  AI_RECOMMENDATION: Bot,
  NOTIFICATIONS: Bell,
};

const SETTING_LABELS: Record<SystemSettingKey, string> = {
  NEARBY_ALERT_MAX_RADIUS_METERS: "Max Alert Radius (meters)",
  NEARBY_ALERT_DAILY_LIMIT: "Daily Alert Limit (per user)",
  NEARBY_ALERT_STORE_COOLDOWN_HOURS: "Per-Store Cooldown (hours)",
  NEARBY_ALERT_MAX_SPEED_KMH: "Max Speed Cutoff (km/h)",
  NEARBY_ALERT_CANDIDATE_LIMIT: "Candidate Limit",
  MEAL_REMINDER_NO_PROFILE_RADIUS_KM: "No-Profile Fallback Radius (km)",
  MEAL_REMINDER_CANDIDATE_CACHE_TTL_MINUTES: "Candidate Cache TTL (minutes)",
  STORE_IMPORT_SOUTHWEST_LATITUDE: "Southwest Latitude",
  STORE_IMPORT_SOUTHWEST_LONGITUDE: "Southwest Longitude",
  STORE_IMPORT_NORTHEAST_LATITUDE: "Northeast Latitude",
  STORE_IMPORT_NORTHEAST_LONGITUDE: "Northeast Longitude",
  STORE_IMPORT_REGION_CODE: "Region Code",
  AI_RECOMMENDATION_ENABLED: "AI Recommendation Enabled",
  AI_RECOMMENDATION_CONCURRENCY: "AI Concurrency (parallel calls)",
  AI_RECOMMENDATION_FALLBACK_COOLDOWN_SECONDS: "Fallback Cooldown (seconds)",
  AI_RECOMMENDATION_FALLBACK_CANDIDATE_LIMIT: "Fallback Candidate Limit",
  NOTIFICATIONS_WEB_PUSH_ENABLED: "Web Push Enabled",
  NOTIFICATIONS_TELEGRAM_ENABLED: "Telegram Enabled",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("km-KH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  setting,
  onMessage,
}: {
  setting: SystemSetting;
  onMessage: (message: ApiMessage) => void;
}) {
  const [draftValue, setDraftValue] = useState(setting.value);
  const [updateSetting, { isLoading: isSaving }] = useUpdateSystemSettingMutation();
  const [resetSetting, { isLoading: isResetting }] = useResetSystemSettingMutation();

  const busy = isSaving || isResetting;
  const dirty = draftValue !== setting.value;
  const label = SETTING_LABELS[setting.key] ?? setting.key;

  const handleSave = async () => {
    try {
      await updateSetting({ key: setting.key, body: { value: draftValue } }).unwrap();
      onMessage({ type: "success", text: `បានធ្វើបច្ចុប្បន្នភាព "${label}"` });
    } catch (error) {
      onMessage({ type: "error", text: getApiErrorMessage(error) });
    }
  };

  const handleReset = async () => {
    try {
      await resetSetting(setting.key).unwrap();
      onMessage({ type: "success", text: `បានត្រឡប់ "${label}" ទៅលំនាំដើមវិញ` });
    } catch (error) {
      onMessage({ type: "error", text: getApiErrorMessage(error) });
    }
  };

  return (
    <div className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.8125rem] font-medium text-foreground">{label}</span>
          {setting.overridden && (
            <Badge tone="amber" size="sm">
              កំពុងប្តូរពីលំនាំដើម
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {setting.description}
        </p>
        <p className="mt-1 text-[0.6875rem] text-muted-foreground/80 tabular-nums">
          លំនាំដើម: {setting.defaultValue}
          {setting.minValue !== null && setting.maxValue !== null && (
            <>
              {" "}
              &middot; ដែនកំណត់: {setting.minValue}–{setting.maxValue}
            </>
          )}
          {setting.overridden && (
            <> &middot; កែប្រែចុងក្រោយ: {formatDateTime(setting.updatedAt)}</>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {setting.valueType === "BOOLEAN" ? (
          <label className="flex items-center gap-2 text-xs text-foreground">
            <Switch
              checked={draftValue === "true"}
              onCheckedChange={(checked) => setDraftValue(checked ? "true" : "false")}
              aria-label={label}
            />
            <span className="w-8 tabular-nums">{draftValue === "true" ? "បើក" : "បិទ"}</span>
          </label>
        ) : (
          <Input
            type={setting.valueType === "STRING" ? "text" : "number"}
            inputMode={setting.valueType === "DECIMAL" ? "decimal" : undefined}
            step={
              setting.valueType === "DECIMAL"
                ? "any"
                : setting.valueType === "INTEGER"
                  ? "1"
                  : undefined
            }
            min={setting.minValue ?? undefined}
            max={setting.maxValue ?? undefined}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            className="w-36 tabular-nums"
          />
        )}

        <Button type="button" size="sm" disabled={busy || !dirty} onClick={handleSave}>
          <Save size={13} aria-hidden="true" />
          {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
        </Button>

        {setting.overridden && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={busy}
            onClick={handleReset}
            title="ត្រឡប់ទៅលំនាំដើម"
            aria-label={`ត្រឡប់ "${label}" ទៅលំនាំដើម`}
            className="hover:text-amber-600"
          >
            <RotateCcw size={14} aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LOADING / ERROR
========================================================= */

function CategorySkeleton() {
  return (
    <Card className="gap-0">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="divide-y pt-4">
        {[0, 1].map((row) => (
          <div key={row} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function SystemSettingsManager() {
  const { data, isLoading, error } = useGetSystemSettingsQuery();
  const [message, setMessage] = useState<ApiMessage | null>(null);

  const settings = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-12">
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-400"
        >
          <SettingsIcon size={18} />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            ការកំណត់ប្រព័ន្ធ
          </h1>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            ប្តូរតម្លៃទាំងនេះមានប្រសិទ្ធភាពភ្លាមៗសម្រាប់ការកំណត់ភាគច្រើន ដោយមិនចាំបាច់ដាក់ម៉ាស៊ីនមេឱ្យដំណើរការឡើងវិញឡើយ
            (លើកលែងតែមានចែងផ្សេងក្នុងការពិពណ៌នា)។
          </p>
        </div>
      </header>

      <AiProviderKeyManager />

      {message && (
        <SettingsMessageBanner message={message} onDismiss={() => setMessage(null)} />
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {CATEGORY_ORDER.map((category) => (
            <CategorySkeleton key={category} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card className="items-center gap-2 border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900/60 dark:bg-red-950/30">
          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
            មិនអាចផ្ទុកការកំណត់ប្រព័ន្ធបានទេ
          </p>
          <p className="text-xs text-red-800/90 dark:text-red-300/90">
            {getApiErrorMessage(error)}
          </p>
        </Card>
      )}

      {!isLoading &&
        !error &&
        CATEGORY_ORDER.map((category) => {
          const categorySettings = settings.filter((s) => s.category === category);
          if (categorySettings.length === 0) return null;

          const Icon = CATEGORY_ICONS[category];

          return (
            <Card key={category} className="gap-0 overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-400"
                  >
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <CardTitle>{CATEGORY_LABELS[category]}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {CATEGORY_SUBTITLES[category]}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="divide-y pt-1">
                {categorySettings.map((setting) => (
                  <SettingRow key={`${setting.key}|${setting.value}`} setting={setting} onMessage={setMessage} />
                ))}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
