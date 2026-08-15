import type { ReactNode } from "react";

import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import type { Store } from "@/src/types/shop";

import { Section } from "./StoreOverviewSection";

/* =========================================================
   STORE CONTACT & LOCATION
========================================================= */

export default function StoreContactLocationSection({
  store,
}: {
  store: Store;
}) {
  return (
    <Section title="Contact & location" icon={<MapPin size={22} />}>
      <div className="space-y-3">
        <Row
          label="Address"
          value={store.addressLine}
          icon={<MapPin size={19} />}
        />

        <Row label="Commune" value={store.commune ?? "—"} />

        <Row label="District" value={store.district ?? "—"} />

        <Row label="City" value={store.city ?? "—"} />

        <Row label="Province" value={store.province ?? "—"} />

        <Row label="Postal code" value={store.postalCode ?? "—"} />

        <Row
          label="Phone"
          value={store.phoneNumber ?? "—"}
          icon={<Phone size={19} />}
        />

        <Row
          label="Email"
          value={store.email ?? "—"}
          icon={<Mail size={19} />}
        />

        <Row
          label="Coordinates"
          value={`${store.latitude}, ${store.longitude}`}
          mono
        />

        {/* Google Maps */}
        <div className="pt-2">
          <a
            href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-secondary-200
              bg-secondary-50
              px-5
              text-lg
              font-medium
              text-secondary-700
              transition
              hover:bg-secondary-100
              focus:outline-none
              focus:ring-4
              focus:ring-secondary-100
            "
          >
            <ExternalLink size={19} />
            Open coordinates in Google Maps
          </a>
        </div>
      </div>
    </Section>
  );
}

/* =========================================================
   ROW
========================================================= */

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
    <div
      className="
        grid
        min-w-0
        gap-2
        rounded-2xl
        border
        border-gray-100
        bg-gray-50/60
        px-4
        py-3.5
        transition
        hover:border-gray-200
        hover:bg-gray-50
        sm:grid-cols-[170px_1fr]
        sm:items-center
      "
    >
      {/* Label */}
      <div
        className="
          flex
          items-center
          gap-2
          text-lg
          font-medium
          text-gray-500
        "
      >
        {icon && (
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary-50
              text-primary-800
            "
          >
            {icon}
          </span>
        )}

        <span>{label}</span>
      </div>

      {/* Value */}
      <p
        className={`
          min-w-0
          break-words
          text-lg
          font-medium
          text-gray-800
          ${mono ? "font-mono text-base" : ""}
        `}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
