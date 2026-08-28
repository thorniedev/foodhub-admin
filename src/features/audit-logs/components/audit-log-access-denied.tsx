"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock, ShieldCheck } from "lucide-react";

interface AuditLogAccessDeniedProps {
  currentRole?: string;
  message?: string;
}

export default function AuditLogAccessDenied({
  currentRole = "ADMIN",
  message,
}: AuditLogAccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 text-center space-y-6">
        {/* Shield Icon Graphic */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-100 dark:bg-rose-950/60 rounded-full animate-ping opacity-25" />
          <div className="relative w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Access Denied
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-full uppercase tracking-wider">
            <span>Super Admin Privileges Required</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 pt-2 leading-relaxed">
            {message ||
              "The system Audit Logs contains sensitive historical mutation snapshots, IP addresses, and user activity records. Only accounts with the Super Admin role can access this module."}
          </p>
        </div>

        {/* Current Account Details */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Your Current Role:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono">
              {currentRole}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Required Role:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SUPER_ADMIN
            </span>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
