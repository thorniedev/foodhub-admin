"use client";

import { useState } from "react";
import {
  Building,
  Check,
  Compass,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Item, Section } from "./StoreOverviewSection";

export default function StoreContactLocationSection({
  store,
}: {
  store: Store;
}) {
  const [copiedCoords, setCopiedCoords] = useState(false);

  const hasCoords =
    store.latitude !== null &&
    store.latitude !== undefined &&
    store.longitude !== null &&
    store.longitude !== undefined &&
    !isNaN(Number(store.latitude)) &&
    !isNaN(Number(store.longitude)) &&
    (Number(store.latitude) !== 0 || Number(store.longitude) !== 0);

  const lat = Number(store.latitude);
  const lng = Number(store.longitude);

  const handleCopyCoordinates = async () => {
    if (!hasCoords) return;
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    } catch {
      // ignore
    }
  };

  const mapEmbedUrl = hasCoords
    ? `https://maps.google.com/maps?q=${lat},${lng}&hl=km&z=15&output=embed`
    : null;

  return (
    <Section title="ទីតាំង & ទំនាក់ទំនង" icon={<MapPin size={22} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Full Address Banner */}
        <div className="col-span-full rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50">
          <p className="text-lg font-medium text-gray-500">អាសយដ្ឋានពេញលេញ</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span className="text-primary-700">
              <MapPin size={19} />
            </span>
            {store.addressLine || "មិនមានអាសយដ្ឋានឡើយ"}
          </p>
        </div>

        {/* Embedded Interactive Map Preview */}
        {hasCoords && mapEmbedUrl && (
          <div className="col-span-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
            <div className="relative">
              <iframe
                title="Store Map"
                src={mapEmbedUrl}
                className="h-56 w-full border-0 sm:h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/90 px-4 py-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                  <Compass size={18} className="text-primary-700" />
                  <span>
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyCoordinates}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-base font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50"
                  >
                    {copiedCoords ? (
                      <>
                        <Check size={16} className="text-emerald-600" />
                        <span className="text-emerald-700">បានចម្លង</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>ចម្លងកូអរដោនេ</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(store.storeName)}/@${lat},${lng},17z`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#136C34] px-4 py-2 text-base font-bold text-white shadow-xs transition hover:bg-[#0F5F2E]"
                  >
                    <ExternalLink size={16} />
                    <span>បើកក្នុង Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <Item
          label="សង្កាត់/ឃុំ"
          value={store.commune}
          icon={<Building size={19} />}
        />

        <Item
          label="ខណ្ឌ/ស្រុក"
          value={store.district}
          icon={<Building size={19} />}
        />

        <Item
          label="ក្រុង/ទីក្រុង"
          value={store.city}
          icon={<Building size={19} />}
        />

        <Item
          label="រាជធានី/ខេត្ត"
          value={store.province}
          icon={<Building size={19} />}
        />

        <Item
          label="លេខកូដប្រៃសណីយ៍"
          value={store.postalCode}
          icon={<Navigation size={19} />}
        />

        <Item
          label="លេខទូរស័ព្ទ"
          value={store.phoneNumber}
          icon={<Phone size={19} />}
        />

        <Item
          label="អ៊ីមែល"
          value={store.email}
          icon={<Mail size={19} />}
        />

        <Item
          label="កូអរដោនេផែនទី"
          value={hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : undefined}
          icon={<Compass size={19} />}
        />
      </div>
    </Section>
  );
}
