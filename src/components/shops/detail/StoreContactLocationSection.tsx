import type { ReactNode } from "react";
import { ExternalLink, Mail, MapPin, Phone, Compass, Building, Navigation } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";

export default function StoreContactLocationSection({
  store,
}: {
  store: Store;
}) {
  return (
    <Section title="Contact & location" icon={<MapPin size={24} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="col-span-full rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <MapPin size={18} />
            Address line
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {store.addressLine || "—"}
          </p>
        </div>

        <ContactCard
          label="Commune"
          value={store.commune || "—"}
          icon={<Building size={18} />}
        />

        <ContactCard
          label="District"
          value={store.district || "—"}
          icon={<Building size={18} />}
        />

        <ContactCard
          label="City"
          value={store.city || "—"}
          icon={<Building size={18} />}
        />

        <ContactCard
          label="Province"
          value={store.province || "—"}
          icon={<Building size={18} />}
        />

        <ContactCard
          label="Postal code"
          value={store.postalCode || "—"}
          icon={<Navigation size={18} />}
        />

        <ContactCard
          label="Phone"
          value={store.phoneNumber || "—"}
          icon={<Phone size={18} />}
        />

        <ContactCard
          label="Email"
          value={store.email || "—"}
          icon={<Mail size={18} />}
        />

        <ContactCard
          label="Coordinates"
          value={`${store.latitude ?? "—"}, ${store.longitude ?? "—"}`}
          icon={<Compass size={18} />}
        />

        {/* Google Maps Button Full Width */}
        <div className="col-span-full pt-1">
          <a
            href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-secondary-200 bg-secondary-50 px-5 text-lg font-bold text-secondary-700 transition hover:bg-secondary-100 focus:outline-none focus:ring-4 focus:ring-secondary-100"
          >
            <ExternalLink size={19} />
            Open coordinates in Google Maps
          </a>
        </div>
      </div>
    </Section>
  );
}

function ContactCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
      <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
        {icon}
        {label}
      </p>
      <p className="mt-2 truncate text-xl font-bold text-gray-900" title={value}>
        {value}
      </p>
    </div>
  );
}
