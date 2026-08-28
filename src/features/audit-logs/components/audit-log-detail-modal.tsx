"use client";

import React, { useState } from "react";
import {
  X,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  User,
  Shield,
  Clock,
  ExternalLink,
  Layers,
  AlertCircle,
  Network,
  Cpu,
} from "lucide-react";
import { AuditLogDto } from "../types/audit-log.types";
import {
  BADGE_COLOR_STYLES,
  ENTITY_TYPE_CONFIGS,
  getActionMetadata,
} from "../constants/audit-log-dictionary";
import {
  formatAuditTimestamp,
  formatIpAddress,
  formatRelativeTime,
  parseUserAgent,
} from "../utils/audit-log-format";
import AuditLogDiffViewer from "./audit-log-diff-viewer";

interface AuditLogDetailModalProps {
  logUuid: string | null;
  logDetail: AuditLogDto | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function AuditLogDetailModal({
  logUuid,
  logDetail,
  loading,
  error,
  onClose,
  onRefresh,
}: AuditLogDetailModalProps) {
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedActor, setCopiedActor] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedUa, setCopiedUa] = useState(false);

  if (!logUuid) return null;

  const metadata = logDetail ? getActionMetadata(logDetail.actionCode, logDetail.entityType) : null;
  const colorStyle = metadata ? BADGE_COLOR_STYLES[metadata.color] : BADGE_COLOR_STYLES.blue;
  const entityConfig = logDetail?.entityType ? ENTITY_TYPE_CONFIGS[logDetail.entityType as keyof typeof ENTITY_TYPE_CONFIGS] : null;

  const parsedUa = parseUserAgent(logDetail?.userAgent);
  const ipInfo = formatIpAddress(logDetail?.ipAddress);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const getDeviceIcon = () => {
    switch (parsedUa.device) {
      case "Mobile":
        return <Smartphone className="w-4 h-4 text-purple-500" />;
      case "Tablet":
        return <Tablet className="w-4 h-4 text-indigo-500" />;
      case "Bot":
        return <Bot className="w-4 h-4 text-rose-500" />;
      default:
        return <Monitor className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      {/* Slide-over Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col overflow-hidden border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/90 shrink-0">
          <div className="space-y-1.5 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Audit Record Inspector
              </h3>

              {metadata && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.dot}`} />
                  {metadata.label}
                </span>
              )}

              {entityConfig && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${entityConfig.badgeClass}`}
                >
                  {entityConfig.label} {logDetail?.entityId ? `#${logDetail.entityId}` : ""}
                </span>
              )}
            </div>

            {/* Log UUID with copy */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-mono">UUID:</span>
              <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 truncate max-w-sm">
                {logUuid}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(logUuid, setCopiedUuid)}
                title="Copy Log UUID"
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                {copiedUuid ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                title="Reload Audit Record"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 [scrollbar-width:thin]">
          {loading && !logDetail ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">Loading full audit snapshot details...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                Failed to Load Audit Details
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                {error}
              </p>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="px-4 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-xl hover:bg-rose-700 transition cursor-pointer"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : logDetail ? (
            <>
              {/* 1. KEY METADATA CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Timestamp Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Occurred At
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatRelativeTime(logDetail.occurredAt)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatAuditTimestamp(logDetail.occurredAt)}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {logDetail.occurredAt}
                  </p>
                </div>

                {/* Actor Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      Actor (Admin User)
                    </span>
                    {logDetail.actorUserUuid && (
                      <button
                        type="button"
                        onClick={() => handleCopy(logDetail.actorUserUuid!, setCopiedActor)}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedActor ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedActor ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 truncate">
                    {logDetail.actorUserUuid || "System Internal"}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {logDetail.actorUserUuid ? "Authenticated Admin Account" : "Triggered by Automated Job / System"}
                  </p>
                </div>

                {/* Target Entity Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      Target Entity
                    </span>
                    <span className="font-mono text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-800 dark:text-zinc-200">
                      ID: {logDetail.entityId ?? "N/A"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {entityConfig?.label || logDetail.entityType}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {metadata?.description || `Action ${logDetail.actionCode} applied to ${logDetail.entityType}`}
                  </p>
                </div>

                {/* Client IP Card */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Network className="w-3.5 h-3.5 text-zinc-400" />
                      Client IP Address
                    </span>
                    {logDetail.ipAddress && (
                      <button
                        type="button"
                        onClick={() => handleCopy(logDetail.ipAddress!, setCopiedIp)}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIp ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIp ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {ipInfo.display}
                    </span>
                    {ipInfo.isLocal && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                        Local / Private
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {ipInfo.isV6 ? "IPv6 Address" : "IPv4 Client Address"}
                  </p>
                </div>
              </div>

              {/* User Agent Card */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    {getDeviceIcon()}
                    User-Agent Client Environment
                  </span>
                  {logDetail.userAgent && (
                    <button
                      type="button"
                      onClick={() => handleCopy(logDetail.userAgent!, setCopiedUa)}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUa ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUa ? "Copied Full String" : "Copy Raw UA"}</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    {parsedUa.browser}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-500" />
                    {parsedUa.os}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Device: {parsedUa.device}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 break-all leading-relaxed">
                  {logDetail.userAgent || "No user-agent string provided"}
                </p>
              </div>

              {/* 2. BEFORE vs AFTER DATA DIFF SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    State Mutation Snapshot (Before vs After)
                  </h4>
                </div>

                <AuditLogDiffViewer
                  beforeData={logDetail.beforeData}
                  afterData={logDetail.afterData}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
