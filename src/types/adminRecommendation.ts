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
  requestedByUserId?: number | string;
  userId?: number | string;
  userUuid?: string;
  username?: string;
  requestedByUsername?: string;
  requesterName?: string;
  userFullName?: string;
  user?: {
    id?: number | string;
    uuid?: string;
    username?: string;
    name?: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };
  mode: RecommendationMode;
  status: SessionStatus;
  requestSource?: string;
  searchRadiusKm?: number;
  maximumPrice?: number;
  currencyCode?: string;
  candidateCount: number;
  eligibleCount: number;
  responseTimeMs?: number;
  latencyMs?: number;
  durationMs?: number;
  executionTimeMs?: number;
  responseTime?: number;
  totalGroupMembers?: number;
  groupMembersCount?: number;
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
  isExploration?: boolean;
}

export type SafetyAuditResult = "SAFE" | "WARNING" | "BLOCKED";
export type SafetyCheckResult = SafetyAuditResult;

export interface AdminSafetyCheckItem {
  uuid: string;
  profileId: number;
  profileName: string;
  menuItemId: number;
  menuItemName: string;
  result: SafetyAuditResult;
  ruleVersion: string;
  reasons: string | string[];
  checkDurationMs: number;
  checkedAt: string;
}

export interface AdminSessionDetail extends AdminSessionSummary {
  contextData?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    userLat?: number;
    userLng?: number;
    radiusKm?: number;
    userPreferences?: {
      spiceTolerance?: string;
      dietaryProfileId?: number;
      preferredCuisines?: string[];
    };
    rawRequestPayload?: Record<string, unknown>;
  };
  items: AdminRecommendedItem[];
  safetyChecks: AdminSafetyCheckItem[];
}

export interface AdminKpiMetrics {
  totalSessions: number;
  avgLatencyMs: number;
  totalCandidatesEvaluated: number;
  totalCandidatesBlocked: number;
  safetyBlockRate: number;
  soloModeCount: number;
  groupModeCount: number;
  aiStrategyHealthRate: number;
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
  size: number;
  number: number;
}
