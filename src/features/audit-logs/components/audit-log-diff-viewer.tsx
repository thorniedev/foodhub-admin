"use client";

import React, { useMemo, useState } from "react";
import {
  Copy,
  Check,
  PlusCircle,
  MinusCircle,
  Edit3,
  CheckCircle2,
  Code,
  Layers,
  FileJson,
  Sparkles,
} from "lucide-react";
import {
  computeDataDiff,
  formatJsonPretty,
  DiffType,
  PropertyDiff,
} from "../utils/audit-log-diff";

interface AuditLogDiffViewerProps {
  beforeData: string | null | undefined;
  afterData: string | null | undefined;
}

export default function AuditLogDiffViewer({
  beforeData,
  afterData,
}: AuditLogDiffViewerProps) {
  const [viewMode, setViewMode] = useState<"VISUAL" | "SIDE_BY_SIDE">("VISUAL");
  const [filterType, setFilterType] = useState<"ALL" | "CHANGES" | "ADDED" | "MODIFIED" | "REMOVED">("CHANGES");

  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

  const diffResult = useMemo(() => {
    return computeDataDiff(beforeData, afterData);
  }, [beforeData, afterData]);

  const prettyBefore = useMemo(() => formatJsonPretty(diffResult.parsedBefore), [diffResult.parsedBefore]);
  const prettyAfter = useMemo(() => formatJsonPretty(diffResult.parsedAfter), [diffResult.parsedAfter]);

  const handleCopyBefore = () => {
    navigator.clipboard.writeText(prettyBefore);
    setCopiedBefore(true);
    setTimeout(() => setCopiedBefore(false), 2000);
  };

  const handleCopyAfter = () => {
    navigator.clipboard.writeText(prettyAfter);
    setCopiedAfter(true);
    setTimeout(() => setCopiedAfter(false), 2000);
  };

  const filteredDiffs = useMemo(() => {
    if (filterType === "CHANGES") {
      return diffResult.diffs.filter((d) => d.type !== "UNCHANGED");
    }
    if (filterType === "ALL") {
      return diffResult.diffs;
    }
    return diffResult.diffs.filter((d) => d.type === filterType);
  }, [diffResult.diffs, filterType]);

  const isCreation = beforeData === null || beforeData === undefined || beforeData.trim() === "";
  const isDeletion = afterData === null || afterData === undefined || afterData.trim() === "";

  return (
    <div className="space-y-4">
      {/* Top Header with Stats & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
        {/* Diff Metric Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {isCreation ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              New Entity Creation (All properties added)
            </span>
          ) : isDeletion ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
              <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
              Entity Deletion (Record removed)
            </span>
          ) : (
            <>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                Mutations:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                +{diffResult.addedCount} Added
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                ~{diffResult.modifiedCount} Modified
              </span>
              {diffResult.removedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                  -{diffResult.removedCount} Removed
                </span>
              )}
              {diffResult.unchangedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  ={diffResult.unchangedCount} Unchanged
                </span>
              )}
            </>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-700/60 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("VISUAL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              viewMode === "VISUAL"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visual Diff</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("SIDE_BY_SIDE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              viewMode === "SIDE_BY_SIDE"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Side-by-Side JSON</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL DIFF VIEW */}
      {viewMode === "VISUAL" && (
        <div className="space-y-3">
          {/* Sub-filter chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType("CHANGES")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === "CHANGES"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              Changes Only ({diffResult.addedCount + diffResult.modifiedCount + diffResult.removedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === "ALL"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              All Properties ({diffResult.diffs.length})
            </button>
            {diffResult.addedCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType("ADDED")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === "ADDED"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                Added ({diffResult.addedCount})
              </button>
            )}
            {diffResult.modifiedCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType("MODIFIED")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === "MODIFIED"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
              >
                Modified ({diffResult.modifiedCount})
              </button>
            )}
            {diffResult.removedCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType("REMOVED")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === "REMOVED"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                Removed ({diffResult.removedCount})
              </button>
            )}
          </div>

          {/* Diffs List */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-200/80 dark:divide-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            {filteredDiffs.length > 0 ? (
              filteredDiffs.map((diff) => (
                <DiffItemRow key={diff.path} diff={diff} />
              ))
            ) : (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                  No matching property mutations
                </p>
                <p>All snapshot properties are unchanged or match selected filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SIDE BY SIDE RAW JSON VIEW */}
      {viewMode === "SIDE_BY_SIDE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Snapshot */}
          <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50/60 dark:bg-rose-950/30 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="font-bold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  Before Snapshot
                </span>
                {isCreation && (
                  <span className="text-[10px] bg-rose-200/70 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-1.5 py-0.5 rounded font-mono">
                    null (Initial)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyBefore}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
              >
                {copiedBefore ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-[380px] [scrollbar-width:thin]">
              <pre className="leading-relaxed">
                <code>{prettyBefore}</code>
              </pre>
            </div>
          </div>

          {/* After Snapshot */}
          <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  After Snapshot
                </span>
                {isDeletion && (
                  <span className="text-[10px] bg-rose-200/70 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-1.5 py-0.5 rounded font-mono">
                    null (Deleted)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyAfter}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
              >
                {copiedAfter ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-[380px] [scrollbar-width:thin]">
              <pre className="leading-relaxed">
                <code>{prettyAfter}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiffItemRow({ diff }: { diff: PropertyDiff }) {
  const isAdded = diff.type === "ADDED";
  const isRemoved = diff.type === "REMOVED";
  const isModified = diff.type === "MODIFIED";
  const isUnchanged = diff.type === "UNCHANGED";

  const renderValue = (val: any) => {
    if (val === null) return <span className="text-zinc-400 italic">null</span>;
    if (val === undefined) return <span className="text-zinc-400 italic">undefined</span>;
    if (typeof val === "boolean") {
      return (
        <span className={`font-mono font-semibold ${val ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {String(val)}
        </span>
      );
    }
    if (typeof val === "number") {
      return <span className="text-indigo-600 dark:text-indigo-400 font-mono">{val}</span>;
    }
    if (typeof val === "object") {
      return (
        <span className="font-mono text-zinc-800 dark:text-zinc-200">
          {JSON.stringify(val)}
        </span>
      );
    }
    return <span className="text-zinc-800 dark:text-zinc-200 font-mono">"{String(val)}"</span>;
  };

  return (
    <div
      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
        isAdded
          ? "bg-emerald-50/40 dark:bg-emerald-950/20"
          : isRemoved
          ? "bg-rose-50/40 dark:bg-rose-950/20"
          : isModified
          ? "bg-amber-50/30 dark:bg-amber-950/15"
          : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
      }`}
    >
      {/* Property Name & Type Badge */}
      <div className="flex items-center gap-2 min-w-[200px]">
        {isAdded && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[10px]">
            <PlusCircle className="w-3 h-3" /> ADD
          </span>
        )}
        {isRemoved && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold font-mono text-[10px]">
            <MinusCircle className="w-3 h-3" /> REMOVE
          </span>
        )}
        {isModified && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold font-mono text-[10px]">
            <Edit3 className="w-3 h-3" /> MOD
          </span>
        )}
        {isUnchanged && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono text-[10px]">
            SAME
          </span>
        )}

        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
          {diff.path}
        </span>
      </div>

      {/* Values Display */}
      <div className="flex-1 flex flex-wrap items-center gap-2 justify-start sm:justify-end">
        {isModified && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="line-through bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-2 py-0.5 rounded text-rose-700 dark:text-rose-300">
              {renderValue(diff.beforeValue)}
            </span>
            <span className="text-zinc-400 font-bold">→</span>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded font-semibold text-emerald-700 dark:text-emerald-300">
              {renderValue(diff.afterValue)}
            </span>
          </div>
        )}

        {isAdded && (
          <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
            {renderValue(diff.afterValue)}
          </span>
        )}

        {isRemoved && (
          <span className="line-through bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-2 py-0.5 rounded text-rose-700 dark:text-rose-300">
            {renderValue(diff.beforeValue)}
          </span>
        )}

        {isUnchanged && (
          <span className="text-zinc-500 dark:text-zinc-400">
            {renderValue(diff.afterValue)}
          </span>
        )}
      </div>
    </div>
  );
}
