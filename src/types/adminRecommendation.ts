// types/adminRecommendation.ts

export type RecommendationMode = "SINGLE" | "GROUP";

export type SessionStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface AdminSessionSummary {
  uuid: string;
  requestedByUserId: number;
  mode: RecommendationMode;
  status: SessionStatus;
  requestSource: string;
  searchRadiusKm?: number;
  maximumPrice?: number;
  currencyCode?: string;
  candidateCount: number;
  eligibleCount: number;
  responseTimeMs?: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export type ScoreStrategyKey =
  | "CONTENT_BASED"
  | "BEHAVIOR"
  | "POPULARITY"
  | "TRENDING"
  | "AI_JUDGMENT"
  | string;

export interface AdminRecommendedItem {
  uuid: string;
  menuItemId: number;
  menuItemName: string;
  storeId: number;
  storeName: string;
  rankPosition: number;
  finalScore: number;
  groupScore?: number;
  candidateSource: string;
  distanceKm?: number;
  priceSnapshot?: number;
  currencyCode?: string;
  scoreBreakdown?: {
    CONTENT_BASED?: number;
    BEHAVIOR?: number;
    POPULARITY?: number;
    TRENDING?: number;
    AI_JUDGMENT?: number;
    [key: string]: number | undefined;
  };
  reasonCodes?: string[];
  reasonText?: string;
  isExploration: boolean;
}

export type SafetyCheckResult = "SAFE" | "WARNING" | "BLOCKED";

export interface AdminSafetyCheckItem {
  uuid: string;
  profileId: number;
  profileName?: string;
  menuItemId: number;
  menuItemName: string;
  result: SafetyCheckResult;
  ruleVersion: string;
  reasons: any; // String or Object explaining allergen/dietary conflict
  checkDurationMs: number;
  checkedAt: string;
}

export interface AdminSessionDetail extends AdminSessionSummary {
  contextData?: Record<string, any>;
  items: AdminRecommendedItem[];
  safetyChecks: AdminSafetyCheckItem[];
}

export interface AdminKpiMetrics {
  totalSessions: number;
  avgLatencyMs: number;
  totalCandidatesEvaluated: number;
  totalCandidatesBlocked: number;
  safetyBlockRate: number; // percentage (e.g. 18.5)
  soloModeCount: number;
  groupModeCount: number;
  aiStrategyHealthRate?: number; // percentage (e.g. 96.2)
}

export interface FetchAdminSessionsParams {
  page?: number;
  size?: number;
  mode?: string;
  status?: string;
  userId?: number;
  search?: string;
}

export interface AdminSessionPageResponse {
  content: AdminSessionSummary[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
}
