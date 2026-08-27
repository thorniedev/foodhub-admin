"use client";

import React, { useMemo } from "react";
import {
  ClipboardList,
  Shield,
  ShieldCheck,
  Activity,
  Layers,
  Calendar,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import AuditLogFilters from "./audit-log-filters";
import AuditLogTable from "./audit-log-table";
import AuditLogPagination from "./audit-log-pagination";
import AuditLogDetailModal from "./audit-log-detail-modal";
import AuditLogAccessDenied from "./audit-log-access-denied";

export default function AuditLogsDashboard() {
  const {
    logs,
    totalElements,
    totalPages,
    page,
    pageSize,
    loading,
    error,
    isForbidden,
    filters,
    setFilters,
    setPage,
    setPageSize,
    resetFilters,
    refetch,
    selectedLogUuid,
    selectedLogDetail,
    detailLoading,
    detailError,
    inspectLog,
    closeInspect,
    refreshDetail,
  } = useAuditLogs();

  // If the backend returns 403 Forbidden, render the Access Denied screen gracefully
  if (isForbidden) {
    return <AuditLogAccessDenied currentRole="ADMIN" message={error || undefined} />;
  }

  // Quick statistics calculated from current view
  const stats = useMemo(() => {
    const uniqueEntities = new Set(logs.map((l) => `${l.entityType}:${l.entityId}`)).size;
    const uniqueActors = new Set(logs.map((l) => l.actorUserUuid).filter(Boolean)).size;

    return {
      totalRecords: totalElements,
      pageCount: logs.length,
      uniqueEntities,
      uniqueActors,
    };
  }, [logs, totalElements]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100">
            <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <ClipboardList className="w-6 h-6" />
            </div>
            <span>Audit Logs & Mutation History</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time audit log of system mutations, admin actions, before/after data snapshots, and client IP addresses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            SUPER_ADMIN Verified
          </span>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Audit Records</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {totalElements.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-400">
            Across all system domains
          </p>
        </div>

        {/* Page Entities */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Target Entities</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {stats.uniqueEntities}
          </p>
          <p className="text-[11px] text-zinc-400">
            Unique entities on page
          </p>
        </div>

        {/* Active Admins */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Actors</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {stats.uniqueActors}
          </p>
          <p className="text-[11px] text-zinc-400">
            Distinct admin actors
          </p>
        </div>

        {/* Security Status */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Security Policy</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Enforced
          </p>
          <p className="text-[11px] text-zinc-400">
            Role-Based Access Control
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <AuditLogFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        onRefresh={refetch}
        loading={loading}
      />

      {/* 4. Table & Pagination */}
      <div className="space-y-0">
        <AuditLogTable
          logs={logs}
          loading={loading}
          error={error}
          onInspect={inspectLog}
          onRetry={refetch}
        />

        <AuditLogPagination
          page={page}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Detail Slide-over Inspector */}
      <AuditLogDetailModal
        logUuid={selectedLogUuid}
        logDetail={selectedLogDetail}
        loading={detailLoading}
        error={detailError}
        onClose={closeInspect}
        onRefresh={refreshDetail}
      />
    </div>
  );
}
