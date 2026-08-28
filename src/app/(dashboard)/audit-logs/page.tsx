"use client";

import React from "react";
import { useCurrentAdmin } from "@/src/hooks/useCurrentAdmin";
import { getAdminRole } from "@/src/lib/currentAdminDisplay";
import AuditLogsDashboard from "@/src/features/audit-logs/components/AuditLogsDashboard";
import AuditLogAccessDenied from "@/src/features/audit-logs/components/audit-log-access-denied";
import { Shield, RefreshCw } from "lucide-react";

export default function AuditLogsPage() {
  const { admin, isLoading } = useCurrentAdmin();
  const currentRole = getAdminRole(admin);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Verifying Super Admin Authorization...
          </h3>
          <p className="text-xs text-zinc-500">
            Checking Keycloak security credentials and role assignments.
          </p>
        </div>
      </div>
    );
  }

  // Strictly enforce SUPER_ADMIN role
  if (currentRole !== "SUPER_ADMIN") {
    return (
      <AuditLogAccessDenied
        currentRole={currentRole}
        message="This module requires the Keycloak ROLE_SUPER_ADMIN privilege. Your current credentials do not have permission to inspect system audit mutation logs."
      />
    );
  }

  return <AuditLogsDashboard />;
}
