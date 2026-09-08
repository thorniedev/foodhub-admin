"use client";

import { useState } from "react";

import {
  Bell,
  Bot,
  Clock,
  MapPin,
  RotateCcw,
  Save,
  Store,
  X,
} from "lucide-react";

import {
  useGetSystemSettingsQuery,
  useResetSystemSettingMutation,
  useUpdateSystemSettingMutation,
} from "@/src/app/store/systemSettingApi";

import { getApiErrorMessage, type ApiMessage } from "@/src/types/safetyResource";

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

function formatDisplayValue(setting: Pick<SystemSetting, "valueType" | "value">, raw: string): string {
  if (setting.valueType === "BOOLEAN") {
    return raw === "true" ? "បើក (true)" : "បិទ (false)";
  }
  return raw;
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
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-800">{label}</span>
          {setting.overridden && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
              កំពុងប្តូរពីលំនាំដើម
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{setting.description}</p>
        <p className="mt-1 text-xs text-gray-400">
          លំនាំដើម: {formatDisplayValue(setting, setting.defaultValue)}
          {setting.minValue !== null && setting.maxValue !== null && (
            <> &middot; ដែនកំណត់: {setting.minValue} – {setting.maxValue}</>
          )}
          {setting.overridden && (
            <> &middot; កែប្រែចុងក្រោយ: {formatDateTime(setting.updatedAt)}</>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {setting.valueType === "BOOLEAN" ? (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={draftValue === "true"}
              onChange={(event) => setDraftValue(event.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-gray-300 text-[#136C34] focus:ring-[#136C34]"
            />
            {draftValue === "true" ? "បើក" : "បិទ"}
          </label>
        ) : (
          <input
            type={setting.valueType === "STRING" ? "text" : "number"}
            inputMode={setting.valueType === "DECIMAL" ? "decimal" : undefined}
            step={setting.valueType === "DECIMAL" ? "any" : setting.valueType === "INTEGER" ? "1" : undefined}
            min={setting.minValue ?? undefined}
            max={setting.maxValue ?? undefined}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            className="w-36 rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:border-[#136C34] focus:outline-none"
          />
        )}

        <button
          type="button"
          disabled={busy || !dirty}
          onClick={handleSave}
          title="រក្សាទុក"
          className="flex items-center gap-1 rounded-full bg-[#136C34] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0f5828] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={13} />
          {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
        </button>

        {setting.overridden && (
          <button
            type="button"
            disabled={busy}
            onClick={handleReset}
            title="ត្រឡប់ទៅលំនាំដើម"
            className="rounded-full border border-gray-200 p-1.5 text-gray-400 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">ការកំណត់ប្រព័ន្ធ</h1>
        <p className="mt-1 text-sm text-gray-500">
          ប្តូរតម្លៃទាំងនេះមានប្រសិទ្ធភាពភ្លាមៗសម្រាប់ការកំណត់ភាគច្រើន ដោយមិនចាំបាច់ដាក់ម៉ាស៊ីនមេឱ្យដំណើរការឡើងវិញឡើយ
          (លើកលែងតែមានចែងផ្សេងក្នុងការពិពណ៌នា)។
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-[#136C34]"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          កំពុងផ្ទុកទិន្នន័យ...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-red-500 shadow-sm">
          {getApiErrorMessage(error)}
        </div>
      )}

      {!isLoading && !error &&
        CATEGORY_ORDER.map((category) => {
          const categorySettings = settings.filter((s) => s.category === category);
          if (categorySettings.length === 0) return null;

          const Icon = CATEGORY_ICONS[category];

          return (
            <div
              key={category}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#136C34]">
                  <Icon size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <p className="text-sm text-gray-500">{CATEGORY_SUBTITLES[category]}</p>
                </div>
              </div>

              <div className="mt-2 divide-y divide-gray-50">
                {categorySettings.map((setting) => (
                  <SettingRow
                    key={`${setting.key}|${setting.value}`}
                    setting={setting}
                    onMessage={setMessage}
                  />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
