export type SystemSettingCategory =
  | "NEARBY_ALERTS"
  | "MEAL_REMINDERS"
  | "STORE_IMPORT"
  | "AI_RECOMMENDATION"
  | "NOTIFICATIONS";

export type SystemSettingValueType = "INTEGER" | "DECIMAL" | "BOOLEAN" | "STRING";

export type SystemSettingKey =
  | "NEARBY_ALERT_MAX_RADIUS_METERS"
  | "NEARBY_ALERT_DAILY_LIMIT"
  | "NEARBY_ALERT_STORE_COOLDOWN_HOURS"
  | "NEARBY_ALERT_MAX_SPEED_KMH"
  | "NEARBY_ALERT_CANDIDATE_LIMIT"
  | "MEAL_REMINDER_NO_PROFILE_RADIUS_KM"
  | "MEAL_REMINDER_CANDIDATE_CACHE_TTL_MINUTES"
  | "STORE_IMPORT_SOUTHWEST_LATITUDE"
  | "STORE_IMPORT_SOUTHWEST_LONGITUDE"
  | "STORE_IMPORT_NORTHEAST_LATITUDE"
  | "STORE_IMPORT_NORTHEAST_LONGITUDE"
  | "STORE_IMPORT_REGION_CODE"
  | "AI_RECOMMENDATION_ENABLED"
  | "AI_RECOMMENDATION_CONCURRENCY"
  | "AI_RECOMMENDATION_FALLBACK_COOLDOWN_SECONDS"
  | "AI_RECOMMENDATION_FALLBACK_CANDIDATE_LIMIT"
  | "NOTIFICATIONS_WEB_PUSH_ENABLED"
  | "NOTIFICATIONS_TELEGRAM_ENABLED";

export interface SystemSetting {
  key: SystemSettingKey;
  category: SystemSettingCategory;
  valueType: SystemSettingValueType;
  value: string;
  defaultValue: string;
  minValue: string | null;
  maxValue: string | null;
  overridden: boolean;
  description: string;
  updatedAt: string | null;
}

export interface UpdateSystemSettingPayload {
  value: string;
}
