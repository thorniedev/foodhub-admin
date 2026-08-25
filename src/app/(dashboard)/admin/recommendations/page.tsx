"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Search,
  RefreshCw,
  Eye,
  Copy,
  Check,
  User,
  Users,
  Clock,
  Zap,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  ShieldCheck,
  Utensils,
  Layers,
} from "lucide-react";
import {
  AdminSessionSummary,
  AdminSessionDetail,
  AdminKpiMetrics,
} from "@/src/types/adminRecommendation";
import {
  fetchAdminSessions,
  fetchAdminSessionDetail,
  calculateKpiMetrics,
  getSessionLatency,
} from "@/src/services/adminRecommendationService";
import KpiMetricsSection from "@/src/components/recommendations/KpiMetricsSection";
import SessionInspectorDrawer from "@/src/components/recommendations/SessionInspectorDrawer";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/src/components/ui/table";

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

  // Inspector Modal / Slide-over State
  const [selectedSessionUuid, setSelectedSessionUuid] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<AdminSessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

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

  // 2. Open Session Inspector
  const handleInspect = async (uuid: string) => {
    setSelectedSessionUuid(uuid);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const detail = await fetchAdminSessionDetail(uuid);
      setSessionDetail(detail);
    } catch (err: any) {
      console.warn("Backend detail fetch failed:", err?.message);
      setSessionDetail(null);
      setDetailError(err?.message || "Could not load live session audit details.");
    } finally {
      setDetailLoading(false);
    }
  };

  // 1-click UUID copy helper
  const handleCopyUuid = (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(uuid);
    setTimeout(() => setCopiedUuid(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            AI Recommendation & Safety Audit
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time audit log of AI recommendations, multi-strategy score breakdowns, and zero-tolerance allergen safety decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSessions}
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Live backend unavailable:</strong> No mock recommendation sessions are shown in production mode.
            </span>
          </div>
          <button
            type="button"
            onClick={loadSessions}
            className="font-semibold underline hover:text-amber-900 ml-4 flex-shrink-0 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <KpiMetricsSection kpis={kpis} loading={loading} />

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Username, User ID, or UUID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline">
              Mode:
            </span>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="SINGLE">🍽️ Solo Rec (Single)</option>
              <option value="GROUP">👥 Group Dining</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* ShadCN Sessions Explorer Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3.5 px-5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Session Type & Info
              </TableHead>
              <TableHead className="py-3.5 px-5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                User / Requester
              </TableHead>
              <TableHead className="py-3.5 px-5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Safety Filter Rate
              </TableHead>
              <TableHead className="py-3.5 px-5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Latency
              </TableHead>
              <TableHead className="py-3.5 px-5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="py-3.5 px-5 font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Date & Time
              </TableHead>
              <TableHead className="py-3.5 px-5 text-right font-semibold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
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
                const shortUuid = `${session.uuid.substring(0, 8)}...${session.uuid.substring(session.uuid.length - 4)}`;

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
                    onClick={() => handleInspect(session.uuid)}
                    className="cursor-pointer group hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition duration-150"
                  >
                    {/* Session Type & UUID Subtitle */}
                    <TableCell className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border shadow-2xs ${
                              isGroup
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            }`}
                          >
                            {isGroup ? <Users className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
                            {isGroup ? "Group Dining" : "Solo Recommendation"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                          <span>UUID:</span>
                          <span className="bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                            {shortUuid}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyUuid(session.uuid, e)}
                            title="Copy full UUID"
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition opacity-0 group-hover:opacity-100"
                          >
                            {copiedUuid === session.uuid ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* User / Requester */}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${userDisplay.colorTheme.bg}`}
                        >
                          {userDisplay.initial}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {userDisplay.primary}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {userDisplay.secondary}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Safety Filter Rate */}
                    <TableCell className="px-5 py-4">
                      <div className="space-y-1.5 max-w-[150px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {safeCandidates} <span className="text-zinc-400 font-normal">/ {totalCandidates} Safe</span>
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                              safeRate === 100
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {safeRate}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              safeRate === 100 ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, safeRate))}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Latency with Zap badge */}
                    <TableCell className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg text-xs font-mono">
                        <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                        {latency} ms
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border shadow-2xs ${
                          isReady
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : isFailed
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : isProcessing
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : "bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isReady
                              ? "bg-emerald-500 animate-pulse"
                              : isFailed
                              ? "bg-rose-500"
                              : "bg-amber-500 animate-pulse"
                          }`}
                        />
                        {session.status}
                      </span>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {formattedDate}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {formattedTime}
                        </p>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(session.uuid);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition shadow-2xs cursor-pointer group-hover:border-amber-400"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-2">
                    <Layers className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">No recommendation sessions found</p>
                    <p className="text-xs">Try adjusting your filters or search keywords</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        {totalElements > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {page * pageSize + 1} - {Math.min(totalElements, (page + 1) * pageSize)}
              </span>
              <span>of</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {totalElements.toLocaleString()}
              </span>
              <span>sessions</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="px-2 py-1 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-1 font-semibold text-zinc-800 dark:text-zinc-200">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Inspector Drawer */}
      <SessionInspectorDrawer
        sessionUuid={selectedSessionUuid}
        sessionDetail={sessionDetail}
        loading={detailLoading}
        error={detailError}
        onClose={() => {
          setSelectedSessionUuid(null);
          setSessionDetail(null);
          setDetailError(null);
        }}
        onRefresh={() => selectedSessionUuid && handleInspect(selectedSessionUuid)}
      />
    </div>
  );
}
