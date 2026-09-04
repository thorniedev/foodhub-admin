"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Eye,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info,
  Utensils,
  Layers,
} from "lucide-react";
import {
  AdminSessionSummary,
  AdminKpiMetrics,
} from "@/src/types/adminRecommendation";
import {
  fetchAdminSessions,
  calculateKpiMetrics,
  getSessionLatency,
} from "@/src/services/adminRecommendationService";
import KpiMetricsSection from "@/src/components/recommendations/KpiMetricsSection";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

/** Shared select styling for the two filter dropdowns. */
const selectClassName =
  "h-9 cursor-pointer rounded-lg border bg-background px-2.5 text-xs text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25";

/**
 * Format user identity nicely with username, full name, or smart fallback
 */
function getUserDisplay(session: AdminSessionSummary) {
  const username =
    session.username ||
    session.requestedByUsername ||
    session.user?.username;

  const fullName =
    session.requesterName ||
    session.userFullName ||
    session.user?.fullName ||
    session.user?.name;

  const id =
    session.requestedByUserId ||
    session.userId ||
    session.user?.id;

  const isGroup = session.mode === "GROUP";
  const groupCount = session.totalGroupMembers || session.groupMembersCount || 0;

  let primary = "";
  let secondary = session.requestSource ? session.requestSource.replace("_", " ") : "Unknown source";

  if (username) {
    primary = `@${username.replace(/^@/, "")}`;
    if (fullName) secondary = fullName;
    else if (id) secondary = `ID: #${id}`;
  } else if (fullName) {
    primary = fullName;
    if (id) secondary = `User #${id}`;
  } else if (id && String(id) !== "0") {
    primary = `User #${id}`;
    secondary = isGroup && groupCount > 0 ? `Group Dining (${groupCount} Diners)` : "Solo Diner";
  } else if (isGroup) {
    primary = groupCount > 0 ? `Group (${groupCount} Diners)` : "Group Session";
    secondary = "Shared Session";
  } else {
    primary = "Customer (Guest)";
    secondary = "Anonymous Request";
  }

  // Deterministic avatar color palette based on name
  const colors = [
    { bg: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
    { bg: "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    { bg: "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
    { bg: "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    { bg: "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  ];
  const charCode = (primary.charCodeAt(0) || 65) + (primary.charCodeAt(1) || 66);
  const colorTheme = colors[charCode % colors.length];
  const initial = (primary.replace(/^@/, "")[0] || "U").toUpperCase();

  return { primary, secondary, initial, colorTheme };
}

export default function AdminRecommendationsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AdminSessionSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [modeFilter, setModeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 1. Fetch sessions from API
  const loadSessions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const parsedUserId = /^\d+$/.test(searchQuery.trim())
        ? parseInt(searchQuery.trim(), 10)
        : undefined;

      const data = await fetchAdminSessions({
        page,
        size: pageSize,
        mode: modeFilter,
        status: statusFilter,
        userId: parsedUserId,
        search: !parsedUserId && searchQuery.trim() ? searchQuery.trim() : undefined,
      });

      if (data.content && data.content.length > 0) {
        setSessions(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } else {
        setSessions([]);
        setTotalElements(data.totalElements ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      }
    } catch (err: any) {
      console.warn("Backend fetch failed:", err?.message);
      setFetchError(err?.message || "Could not connect to recommendation engine API.");
      setSessions([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, modeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // KPI Metrics calculated from active sessions
  const kpis: AdminKpiMetrics = useMemo(() => {
    return calculateKpiMetrics(sessions, totalElements);
  }, [sessions, totalElements]);

  // 2. Open Dedicated Session Inspector Page
  const handleInspect = (session: AdminSessionSummary) => {
    router.push(`/admin/recommendations/${session.uuid}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 pb-8">
      {/* Header Section */}
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          >
            <Image
              src="/Image/ai-recommendation.png"
              alt=""
              width={20}
              height={20}
              className="size-5 object-contain dark:invert"
              priority
            />
          </span>

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              AI Recommendation &amp; Safety Audit
            </h1>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Real-time audit log of AI recommendations, multi-strategy score
              breakdowns, and zero-tolerance allergen safety decisions.
            </p>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : undefined} aria-hidden="true" />
          <span>Refresh</span>
        </Button>
      </header>

      {fetchError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Info size={15} aria-hidden="true" className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong className="font-semibold">Live backend unavailable:</strong>{" "}
              No mock recommendation sessions are shown in production mode.
            </span>
          </div>
          <button
            type="button"
            onClick={loadSessions}
            className="shrink-0 cursor-pointer font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <KpiMetricsSection kpis={kpis} loading={loading} />

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border bg-card p-3 shadow-card">
        <div className="relative min-w-[16rem] flex-1 sm:max-w-sm">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            aria-label="Search sessions"
            placeholder="Search by username, user ID, or UUID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="h-9 w-full rounded-lg border bg-background pr-3 pl-9 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.6875rem] font-medium text-muted-foreground">Mode</span>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(0);
              }}
              className={selectClassName}
            >
              <option value="ALL">All Modes</option>
              <option value="SINGLE">Solo Rec (Single)</option>
              <option value="GROUP">Group Dining</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[0.6875rem] font-medium text-muted-foreground">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className={selectClassName}
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </label>
        </div>
      </div>

      {/* ShadCN Sessions Explorer Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        {/* The Action column used to be clipped off the right edge on anything
            narrower than ~1500px because the wrapper hid its overflow. */}
        <div className="overflow-x-auto">
        <Table className="min-w-[1020px]">
          <TableHeader className="border-b bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                Session Type & Info
              </TableHead>
              <TableHead className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                User / Requester
              </TableHead>
              <TableHead className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                Safety Filter Rate
              </TableHead>
              <TableHead className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                Latency
              </TableHead>
              <TableHead className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                Date & Time
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sessions.length > 0 ? (
              sessions.map((session) => {
                const isGroup = session.mode === "GROUP";
                const isReady = session.status === "READY" || session.status === "COMPLETED";
                const isFailed = session.status === "FAILED";
                const isProcessing = session.status === "PROCESSING";

                const totalCandidates = session.candidateCount ?? 0;
                const safeCandidates = session.eligibleCount ?? 0;
                const safeRate = totalCandidates > 0 ? Math.round((safeCandidates / totalCandidates) * 100) : 0;
                const latency = getSessionLatency(session);

                const userDisplay = getUserDisplay(session);

                // Format timestamp
                const rawTimestamp = session.createdAt || session.startedAt;
                const dateObj = rawTimestamp ? new Date(rawTimestamp) : null;
                const formattedDate = dateObj
                  ? dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })
                  : "Unknown";
                const formattedTime = dateObj
                  ? dateObj.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                  : "No timestamp";

                return (
                  <TableRow
                    key={session.uuid}
                    onClick={() => handleInspect(session)}
                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    {/* Session Type & UUID Subtitle */}
                    <TableCell className="px-4 py-2.5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap",
                              isGroup
                                ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
                            )}
                          >
                            {isGroup ? <Users size={12} aria-hidden="true" /> : <Utensils size={12} aria-hidden="true" />}
                            <span>{isGroup ? "Group Dining" : "Solo Recommendation"}</span>
                          </span>
                        </div>
                        
                      </div>
                    </TableCell>

                    {/* User / Requester */}
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-semibold",
                            userDisplay.colorTheme.bg,
                          )}
                        >
                          {userDisplay.initial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[0.8125rem] font-medium text-foreground" title={userDisplay.primary}>
                            {userDisplay.primary}
                          </p>
                          <p className="truncate text-[0.6875rem] text-muted-foreground" title={userDisplay.secondary}>
                            {userDisplay.secondary}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Safety Filter Rate */}
                    <TableCell className="px-4 py-2.5">
                      <div className="min-w-[9rem] space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[0.6875rem]">
                          <span className="font-semibold text-primary-700 tabular-nums dark:text-primary-400">
                            {safeCandidates}
                            <span className="font-normal text-muted-foreground">
                              {" "}/ {totalCandidates} Safe
                            </span>
                          </span>
                          <Badge tone={safeRate === 100 ? "green" : "amber"} size="sm">
                            {safeRate}%
                          </Badge>
                        </div>
                        <div
                          role="meter"
                          aria-valuenow={safeRate}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Safety filter rate"
                          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              safeRate === 100 ? "bg-primary-500" : "bg-amber-500",
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, safeRate))}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Latency with Zap badge */}
                    <TableCell className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap text-primary-800 tabular-nums dark:border-primary-800/60 dark:bg-primary-950/50 dark:text-primary-300">
                        <Zap size={11} aria-hidden="true" className="fill-primary-500 text-primary-500" />
                        <span>{latency} ms</span>
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap",
                          isReady
                            ? "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800 dark:bg-primary-950/60 dark:text-primary-300"
                            : isFailed
                              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : isProcessing
                                ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 rounded-full",
                            isReady
                              ? "bg-primary-500"
                              : isFailed
                                ? "bg-rose-500"
                                : "animate-pulse bg-amber-500",
                          )}
                        />
                        <span>{session.status}</span>
                      </span>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell className="px-4 py-2.5">
                      <div className="whitespace-nowrap">
                        <p className="text-[0.8125rem] text-foreground tabular-nums">
                          {formattedDate}
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground tabular-nums">
                          {formattedTime}
                        </p>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="px-4 py-2.5 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(session);
                        }}
                      >
                        <Eye size={13} aria-hidden="true" />
                        <span>Inspect</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Layers size={18} aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      No recommendation sessions found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your filters or search keywords
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>

        {/* Pagination Bar */}
        {totalElements > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5 text-[0.6875rem] text-muted-foreground">
            <p className="tabular-nums" aria-live="polite">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {page * pageSize + 1}–{Math.min(totalElements, (page + 1) * pageSize)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalElements.toLocaleString()}
              </span>{" "}
              sessions
            </p>

            <div className="flex items-center gap-3">
              {/* Page size selector */}
              <label className="flex items-center gap-1.5">
                <span>Per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="h-8 cursor-pointer rounded-lg border bg-background px-2 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                <span className="px-2 font-medium text-foreground tabular-nums">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
