import type { ReactNode } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";

export default function StoreContactLocationSection({ store }: { store: Store }) {
  return (
    <Section title="Contact & location" icon={<MapPin size={20} />}>
      <div className="space-y-3">
        <Row label="Address" value={store.addressLine} icon={<MapPin size={17} />} />
        <Row label="Commune" value={store.commune ?? "—"} />
        <Row label="District" value={store.district ?? "—"} />
        <Row label="City" value={store.city ?? "—"} />
        <Row label="Province" value={store.province ?? "—"} />
        <Row label="Postal code" value={store.postalCode ?? "—"} />
        <Row label="Phone" value={store.phoneNumber ?? "—"} icon={<Phone size={17} />} />
        <Row label="Email" value={store.email ?? "—"} icon={<Mail size={17} />} />
        <Row
          label="Coordinates"
          value={`${store.latitude}, ${store.longitude}`}
          mono
        />

        <a
          href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 text-base font-semibold text-[#136C34] transition hover:bg-emerald-100"
        >
          <ExternalLink size={17} />
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
    <div className="grid gap-1 rounded-2xl bg-gray-50 px-4 py-3 sm:grid-cols-[150px_1fr]">
      <span className="flex items-center gap-1.5 text-lg font-semibold text-[#F97316]">
        {icon}
        {label}
      </span>
      <span
        className={`break-words text-base text-gray-700 ${mono ? "font-mono text-sm" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
