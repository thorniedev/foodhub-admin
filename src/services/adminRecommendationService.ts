// services/adminRecommendationService.ts
import {
  AdminSessionSummary,
  AdminSessionDetail,
  AdminRecommendedItem,
  AdminSafetyCheckItem,
  AdminKpiMetrics,
  FetchAdminSessionsParams,
  AdminSessionPageResponse,
} from "@/src/types/adminRecommendation";
import {
  normalizePayload,
  normalizeArrayPayload,
  normalizePageResponse,
} from "@/src/utils/normalize";

function getBaseApiUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/admin";
  }

  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.mhoubahar.store";
  const trimmed = configured.replace(/\/+$/, "");
  const apiBase = /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
  return `${apiBase}/admin`;
}

function getHeaders(token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * 1. Fetch paginated list of recommendation sessions for admin
 */
export async function fetchAdminSessions(
  params: FetchAdminSessionsParams = {},
  token?: string
): Promise<AdminSessionPageResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", params.page.toString());
  if (params.size !== undefined) query.set("size", params.size.toString());
  if (params.mode && params.mode !== "ALL") query.set("mode", params.mode);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.userId !== undefined && !isNaN(params.userId)) query.set("userId", params.userId.toString());
  if (params.search && params.search.trim()) query.set("search", params.search.trim());

  const queryString = query.toString();
  const base = getBaseApiUrl();
  const url = `${base}/recommendations/sessions${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    headers: getHeaders(token),
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText || "Failed to load recommendation sessions"}`);
  }

  const data = await res.json();
  const pageResult = normalizePageResponse<AdminSessionSummary>(data, params.size || 15);

  return {
    content: pageResult.items,
    totalElements: pageResult.totalElements,
    totalPages: pageResult.totalPages,
    size: pageResult.pageSize,
    number: pageResult.pageNumber,
  };
}

/**
 * 2. Fetch full session details including recommended items & safety checks
 */
export async function fetchAdminSessionDetail(
  sessionUuid: string,
  token?: string,
  fallbackSession?: AdminSessionSummary,
): Promise<AdminSessionDetail> {
  const base = getBaseApiUrl();
  const headers = getHeaders(token);
  const safeUuid = encodeURIComponent(sessionUuid);

  const [sessionRes, itemsRes, safetyRes] = await Promise.all([
    fetch(`${base}/recommendations/sessions/${safeUuid}`, {
      headers,
      credentials: "include",
      cache: "no-store",
    }),
    fetch(`${base}/recommendations/sessions/${safeUuid}/items?limit=50`, {
      headers,
      credentials: "include",
      cache: "no-store",
    }),
    fetch(`${base}/recommendations/sessions/${safeUuid}/safety-checks`, {
      headers,
      credentials: "include",
      cache: "no-store",
    }),
  ]);

  const sessionData = sessionRes.ok
    ? normalizePayload<AdminSessionDetail>(await sessionRes.json(), {} as AdminSessionDetail)
    : fallbackSession
      ? fallbackSession
      : null;

  if (!sessionData) {
    throw new Error(`HTTP ${sessionRes.status}: Failed to fetch session metadata`);
  }

  let items: AdminRecommendedItem[] = [];
  if (itemsRes.ok) {
    const itemsRaw = await itemsRes.json();
    items = normalizeArrayPayload<AdminRecommendedItem>(itemsRaw);
  }

  let safetyChecks: AdminSafetyCheckItem[] = [];
  if (safetyRes.ok) {
    const safetyRaw = await safetyRes.json();
    safetyChecks = normalizeArrayPayload<AdminSafetyCheckItem>(safetyRaw);
  }

  return {
    ...sessionData,
    uuid: sessionData.uuid ?? sessionUuid,
    mode: sessionData.mode ?? fallbackSession?.mode ?? "SINGLE",
    status: sessionData.status ?? fallbackSession?.status ?? "READY",
    candidateCount: sessionData.candidateCount ?? fallbackSession?.candidateCount ?? 0,
    eligibleCount: sessionData.eligibleCount ?? fallbackSession?.eligibleCount ?? 0,
    startedAt: sessionData.startedAt ?? fallbackSession?.startedAt ?? new Date().toISOString(),
    createdAt: sessionData.createdAt ?? fallbackSession?.createdAt ?? new Date().toISOString(),
    items,
    safetyChecks,
  };
}

/**
 * Extract session latency from live backend fields.
 */
export function getSessionLatency(session: AdminSessionSummary): number {
  if (session.responseTimeMs && session.responseTimeMs > 0) return session.responseTimeMs;
  if (session.latencyMs && session.latencyMs > 0) return session.latencyMs;
  if (session.durationMs && session.durationMs > 0) return session.durationMs;
  if (session.executionTimeMs && session.executionTimeMs > 0) return session.executionTimeMs;
  if (session.responseTime && session.responseTime > 0) return session.responseTime;
  if (session.startedAt && session.completedAt) {
    const diff = new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
    if (diff > 0 && diff < 60000) return diff;
  }
  return 0;
}

/**
 * 3. Calculate KPI Metrics from live sessions list.
 */
export function calculateKpiMetrics(sessions: AdminSessionSummary[], totalCount?: number): AdminKpiMetrics {
  const count = totalCount ?? sessions.length;
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: count,
      avgLatencyMs: 0,
      totalCandidatesEvaluated: 0,
      totalCandidatesBlocked: 0,
      safetyBlockRate: 0,
      soloModeCount: 0,
      groupModeCount: 0,
      aiStrategyHealthRate: 0,
    };
  }

  let totalLatency = 0;
  let totalCandidates = 0;
  let totalEligible = 0;
  let soloCount = 0;
  let groupCount = 0;

  for (const s of sessions) {
    totalLatency += getSessionLatency(s);
    if (s.candidateCount) {
      totalCandidates += s.candidateCount;
      totalEligible += s.eligibleCount ?? 0;
    }
    if (s.mode === "GROUP") {
      groupCount++;
    } else {
      soloCount++;
    }
  }

  const avgLatency = sessions.length > 0 ? Math.round(totalLatency / sessions.length) : 0;
  const blockedCount = Math.max(0, totalCandidates - totalEligible);
  const blockRate = totalCandidates > 0 ? Number(((blockedCount / totalCandidates) * 100).toFixed(1)) : 0;

  return {
    totalSessions: count,
    avgLatencyMs: avgLatency,
    totalCandidatesEvaluated: totalCandidates,
    totalCandidatesBlocked: blockedCount,
    safetyBlockRate: blockRate,
    soloModeCount: soloCount,
    groupModeCount: groupCount,
    aiStrategyHealthRate: totalCandidates > 0 ? Number(((totalEligible / totalCandidates) * 100).toFixed(1)) : 0,
  };
}
