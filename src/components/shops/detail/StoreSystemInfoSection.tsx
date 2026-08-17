import { Fingerprint, Key, Calendar, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";

export default function StoreSystemInfoSection({ store }: { store: Store }) {
  return (
    <Section title="System information" icon={<Fingerprint size={24} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* <div className="col-span-full rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <Key size={18} />
            Store UUID
          </p>
          <p className="mt-2 break-all font-mono text-lg font-bold text-gray-900">
            {store.uuid}
          </p>
        </div> */}

        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <ShieldAlert size={18} />
            Review status
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {store.reviewStatus || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <CheckCircle2 size={18} />
            Account status
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {store.accountStatus || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <CheckCircle2 size={18} />
            Operating status
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {store.operatingStatus || "—"}
          </p>
        </div>

        {store.createdAt && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
            <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
              <Calendar size={18} />
              Created at
            </p>
            <p className="mt-2 text-lg font-bold text-gray-800">
              {new Date(store.createdAt).toLocaleString("km-KH")}
            </p>
          </div>
        )}

        {store.updatedAt && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
            <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
              <Calendar size={18} />
              Updated at
            </p>
            <p className="mt-2 text-lg font-bold text-gray-800">
              {new Date(store.updatedAt).toLocaleString("km-KH")}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
