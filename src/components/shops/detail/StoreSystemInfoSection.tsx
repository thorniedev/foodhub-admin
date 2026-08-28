"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Fingerprint,
  Key,
  ShieldAlert,
} from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Item, Section } from "./StoreOverviewSection";

function formatStatusKhmer(status?: string | null) {
  if (!status) return "—";
  const s = status.toUpperCase();
  if (s === "APPROVED") return "បានអនុម័ត";
  if (s === "REJECTED") return "បានបដិសេធ";
  if (s === "PENDING" || s === "IN_REVIEW") return "រង់ចាំពិនិត្យ";
  if (s === "ACTIVE") return "សកម្ម";
  if (s === "SUSPENDED") return "ត្រូវបានផ្អាក";
  if (s === "ARCHIVED" || s === "INACTIVE") return "ទុកក្នុងប័ណ្ណសារ";
  if (s === "OPEN") return "កំពុងបើកដំណើរការ";
  if (s === "CLOSED") return "បានបិទ";
  if (s === "TEMPORARILY_CLOSED") return "បិទបណ្តោះអាសន្ន";
  if (s === "PERMANENTLY_CLOSED") return "បិទជាអចិន្ត្រៃយ៍";
  return status;
}

export default function StoreSystemInfoSection({ store }: { store: Store }) {
  const [copiedUuid, setCopiedUuid] = useState(false);

  const handleCopyUuid = async () => {
    if (!store.uuid) return;
    try {
      await navigator.clipboard.writeText(store.uuid);
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Section title="ព័ត៌មានប្រព័ន្ធ" icon={<Fingerprint size={22} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Copyable Store UUID */}
        <div className="col-span-full rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-gray-500">
              លេខសម្គាល់ហាង
            </p>

            <button
              type="button"
              onClick={handleCopyUuid}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-lg font-bold text-gray-700 shadow-2xs transition hover:bg-gray-100"
            >
              {copiedUuid ? (
                <>
                  <Check size={18} className="text-emerald-600" />
                  <span className="text-emerald-700">បានចម្លង</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>ចម្លង</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-1 break-all font-mono text-lg font-semibold text-gray-800">
            {store.uuid || "—"}
          </p>
        </div>

        <Item
          label="ស្ថានភាពពិនិត្យ"
          value={formatStatusKhmer(store.reviewStatus)}
          icon={<ShieldAlert size={19} />}
        />

        <Item
          label="ស្ថានភាពគណនី"
          value={formatStatusKhmer(store.accountStatus)}
          icon={<CheckCircle2 size={19} />}
        />

        <Item
          label="ស្ថានភាពដំណើរការ"
          value={formatStatusKhmer(store.operatingStatus)}
          icon={<CheckCircle2 size={19} />}
        />

  

        <Item
          label="កែប្រែចុងក្រោយ"
          value={store.updatedAt ? new Date(store.updatedAt).toLocaleString("km-KH") : undefined}
          icon={<Calendar size={19} />}
        />
      </div>
    </Section>
  );
}
