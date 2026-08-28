"use client";

import React, { useState } from "react";
import {
  Eye,
  Copy,
  Check,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  Layers,
  Clock,
  User,
  Shield,
  Activity,
  AlertCircle,
  Hash,
  HelpCircle,
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
  formatShortUuid,
  parseUserAgent,
} from "../utils/audit-log-format";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/src/components/ui/table";

interface AuditLogTableProps {
  logs: AuditLogDto[];
  loading: boolean;
  error?: string | null;
  onInspect: (uuid: string, preloaded?: AuditLogDto) => void;
  onRetry?: () => void;
}

export default function AuditLogTable({
  logs,
  loading,
  error,
  onInspect,
  onRetry,
}: AuditLogTableProps) {
  const [copiedActorUuid, setCopiedActorUuid] = useState<string | null>(null);
  const [copiedLogUuid, setCopiedLogUuid] = useState<string | null>(null);

  const handleCopyActor = (actorUuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(actorUuid);
    setCopiedActorUuid(actorUuid);
    setTimeout(() => setCopiedActorUuid(null), 2000);
  };

  const handleCopyLogUuid = (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
    setCopiedLogUuid(uuid);
    setTimeout(() => setCopiedLogUuid(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800">
          <TableRow className="hover:bg-transparent">
            <TableHead className="py-4 px-5 font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Timestamp
            </TableHead>
            <TableHead className="py-4 px-5 font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Action & Event
            </TableHead>
            <TableHead className="py-4 px-5 font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Target Entity
            </TableHead>
            <TableHead className="py-4 px-5 font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Actor (User)
            </TableHead>
            <TableHead className="py-4 px-5 font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Client IP & Environment
            </TableHead>
            <TableHead className="py-4 px-5 text-right font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className="animate-pulse">
                <TableCell className="px-5 py-4">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="h-56 text-center">
                <div className="flex flex-col items-center justify-center p-6 space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Failed to Load Audit Logs
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                    {error}
                  </p>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl hover:opacity-90 transition cursor-pointer"
                    >
                      Retry Connection
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : logs.length > 0 ? (
            logs.map((log) => {
              const metadata = getActionMetadata(log.actionCode, log.entityType);
              const colorStyle = BADGE_COLOR_STYLES[metadata.color] || BADGE_COLOR_STYLES.blue;
              const entityConfig =
                ENTITY_TYPE_CONFIGS[log.entityType as keyof typeof ENTITY_TYPE_CONFIGS] ||
                null;
              const parsedUa = parseUserAgent(log.userAgent);
              const ipInfo = formatIpAddress(log.ipAddress);
              const shortActor = formatShortUuid(log.actorUserUuid);
              const shortLogUuid = formatShortUuid(log.uuid);

              return (
                <TableRow
                  key={log.uuid}
                  onClick={() => onInspect(log.uuid, log)}
                  className="cursor-pointer group hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition duration-150"
                >
                  {/* 1. Timestamp */}
                  <TableCell className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {formatAuditTimestamp(log.occurredAt)}
                      </p>
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(log.occurredAt)}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono pt-0.5">
                        <span>ID: {shortLogUuid}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLogUuid(log.uuid, e)}
                          title="Copy Log Record UUID"
                          className="opacity-0 group-hover:opacity-100 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                        >
                          {copiedLogUuid === log.uuid ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Action Code with Color Badge */}
                  <TableCell className="px-5 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.dot}`} />
                        {metadata.label}
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[200px]">
                        {metadata.description}
                      </p>
                    </div>
                  </TableCell>

                  {/* 3. Target Entity */}
                  <TableCell className="px-5 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                          entityConfig?.badgeClass ||
                          "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200"
                        }`}
                      >
                        {entityConfig?.label || log.entityType}
                        {log.entityId !== null && log.entityId !== undefined && (
                          <span className="font-mono font-bold">#{log.entityId}</span>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* 4. Actor User UUID */}
                  <TableCell className="px-5 py-4">
                    {log.actorUserUuid ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          <User className="w-3 h-3" />
                        </div>
                        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
                          {shortActor}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyActor(log.actorUserUuid!, e)}
                          title="Copy Full Actor UUID"
                          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition opacity-0 group-hover:opacity-100"
                        >
                          {copiedActorUuid === log.actorUserUuid ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 italic">
                        System Internal
                      </span>
                    )}
                  </TableCell>

                  {/* 5. Client IP & User Agent */}
                  <TableCell className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {ipInfo.display}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]"
                        title={log.userAgent || "No UA"}
                      >
                        {parsedUa.device === "Mobile" ? (
                          <Smartphone className="w-3 h-3 text-purple-500 shrink-0" />
                        ) : parsedUa.device === "Bot" ? (
                          <Bot className="w-3 h-3 text-rose-500 shrink-0" />
                        ) : (
                          <Monitor className="w-3 h-3 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate">{parsedUa.browser} on {parsedUa.os}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 6. Action Button */}
                  <TableCell className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspect(log.uuid, log);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition shadow-2xs cursor-pointer group-hover:border-emerald-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-2">
                  <Layers className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    No audit log records found
                  </p>
                  <p className="text-xs">
                    Try adjusting your filter criteria or date range.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
