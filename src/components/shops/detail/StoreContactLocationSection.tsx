import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
export default function StoreContactLocationSection({
  store,
}: {
  store: Store;
}) {
  return (
    <Section title="Contact & location" icon={<MapPin size={18} />}>
      <div className="space-y-3">
        <Row
          label="Address"
          value={store.addressLine}
          icon={<MapPin size={15} />}
        />
        <Row label="Commune" value={store.commune ?? "—"} />
        <Row label="District" value={store.district ?? "—"} />
        <Row label="City" value={store.city ?? "—"} />
        <Row label="Province" value={store.province ?? "—"} />
        <Row label="Postal code" value={store.postalCode ?? "—"} />
        <Row
          label="Phone"
          value={store.phoneNumber ?? "—"}
          icon={<Phone size={15} />}
        />
        <Row
          label="Email"
          value={store.email ?? "—"}
          icon={<Mail size={15} />}
        />
        <Row
          label="Coordinates"
          value={`${store.latitude}, ${store.longitude}`}
          mono
        />
        <a
          href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-[#137A3D]"
        >
          Open coordinates in Google Maps
        </a>
      </div>
    </Section>
  );
}
function Row({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-2xl bg-gray-50 px-4 py-3 sm:grid-cols-[130px_1fr]">
      <span className="flex items-center gap-1.5 text-xs font-black uppercase text-gray-400">
        {icon}
        {label}
      </span>
      <span
        className={`break-words text-sm font-bold text-gray-700 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
