"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Layers,
  X,
  RefreshCw,
  Copy,
  Check,
  User,
  Users,
  AlertCircle,
} from "lucide-react";
import { AdminSessionDetail } from "@/src/types/adminRecommendation";
import RecommendedItemsTab from "./RecommendedItemsTab";
import SafetyAuditLogTab from "./SafetyAuditLogTab";
import RequestContextTab from "./RequestContextTab";

interface SessionInspectorDrawerProps {
  sessionUuid: string | null;
  sessionDetail: AdminSessionDetail | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function SessionInspectorDrawer({
  sessionUuid,
  sessionDetail,
  loading,
  error,
  onClose,
  onRefresh,
}: SessionInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"ITEMS" | "SAFETY" | "CONTEXT">("ITEMS");
  const [copied, setCopied] = useState(false);

  if (!sessionUuid) return null;

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(sessionUuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGroup = sessionDetail?.mode === "GROUP";
  const itemsCount = sessionDetail?.items?.length || 0;
  const safetyCount = sessionDetail?.safetyChecks?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      {/* Slide-over panel */}
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col overflow-hidden border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900">
          <div className="space-y-1 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Session Audit Inspector
              </h3>
              {sessionDetail?.mode && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isGroup
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  }`}
                >
                  {isGroup ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {sessionDetail.mode}
                </span>
              )}
              {sessionDetail?.status && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    sessionDetail.status === "READY" || sessionDetail.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : sessionDetail.status === "FAILED"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  {sessionDetail.status}
                </span>
              )}
            </div>

            {/* Session UUID with Copy button */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-md">
                {sessionUuid}
              </span>
              <button
                type="button"
                onClick={handleCopyUuid}
                title="Copy Session UUID"
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                title="Reload Session Audit Details"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-5 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("ITEMS")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "ITEMS"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Recommended Dishes
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {itemsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SAFETY")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "SAFETY"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Safety Audit Log
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {safetyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CONTEXT")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "CONTEXT"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            Request Context
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:thin]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-sm font-medium">Loading session audit details & safety checks...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                Failed to Load Session Audit
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                {error}
              </p>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="px-4 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-xl hover:bg-rose-700 transition"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : sessionDetail ? (
            <>
              {activeTab === "ITEMS" && (
                <RecommendedItemsTab items={sessionDetail.items} />
              )}
              {activeTab === "SAFETY" && (
                <SafetyAuditLogTab safetyChecks={sessionDetail.safetyChecks} />
              )}
              {activeTab === "CONTEXT" && (
                <RequestContextTab sessionDetail={sessionDetail} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
