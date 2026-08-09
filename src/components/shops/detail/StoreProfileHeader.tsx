import type { ReactNode } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Clock3,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings2,
  Star,
} from "lucide-react";

import type {
  Store,
  StoreStatusAction,
} from "@/src/types/shop";

import {
  displayStoreLocation,
  imageUrlOrNull,
  storeInitials,
} from "@/src/lib/shopFormat";

import { StatusBadge } from "../ShopsTable";
import StoreMediaImage from "./StoreMediaImage";

export default function StoreProfileHeader({
  store,
  busy = false,
  onEdit,
  onStatus,
  onHours,
}: {
  store: Store;
  busy?: boolean;
  onEdit: () => void;
  onStatus: (
    action: StoreStatusAction,
  ) => void;
  onHours: () => void;
}) {

  const fallbackCover =
    imageUrlOrNull(
      store.coverImageUrl,
    );

  const fallbackLogo =
    imageUrlOrNull(
      store.logoUrl,
    );

  return (
    <section className="overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      {/* =========================================
          COVER AREA
      ========================================== */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#137A3D] via-emerald-700 to-emerald-900 sm:h-64">
        {/* NEW UPLOADED COVER */}
        {store.coverMediaUuid ? (
          <div className="absolute inset-0">
            <StoreMediaImage
              mediaUuid={
                store.coverMediaUuid
              }
              alt={`${store.storeName} cover`}
              className="h-full w-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          </div>
        ) : fallbackCover ? (
          <>
            {/* OLD URL COVER */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fallbackCover}
              alt={`${store.storeName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          </>
        ) : (
          /* No cover image */
          <>
            <div className="absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-white/5" />

            <div className="absolute right-40 top-10 h-56 w-56 rounded-full bg-emerald-300/5" />
          </>
        )}

        {/* =========================================
            BACK BUTTON
        ========================================== */}
        <Link
          href="/shops"
          className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm font-black text-white backdrop-blur-md transition hover:bg-black/40"
        >
          <ArrowLeft size={17} />

          Stores
        </Link>

        {/* =========================================
            STORE IDENTITY
        ========================================== */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7">
          <div className="flex items-end gap-4">
            {/* LOGO */}
            <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24">
              {store.logoMediaUuid ? (
                <StoreMediaImage
                  mediaUuid={
                    store.logoMediaUuid
                  }
                  alt={`${store.storeName} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : fallbackLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fallbackLogo}
                  alt={`${store.storeName} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white text-xl font-black text-[#137A3D]">
                  {storeInitials(
                    store.storeName,
                  )}
                </div>
              )}
            </div>

            {/* NAME + ADDRESS */}
            <div className="min-w-0 flex-1 pb-1 text-white">
              <p className="truncate text-2xl font-black sm:text-3xl lg:text-4xl">
                {store.storeName}
              </p>

              <div className="mt-2 flex items-start gap-2 text-sm text-white/85">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span className="line-clamp-2">
                  {displayStoreLocation(
                    store,
                  ) || "No address"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          STATUS + ACTIONS
      ========================================== */}
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          {/* STATUS */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              value={
                store.reviewStatus
              }
              kind="review"
            />

            <StatusBadge
              value={
                store.accountStatus
              }
              kind="account"
            />

            <StatusBadge
              value={
                store.operatingStatus
              }
              kind="operating"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2">
            {/* EDIT */}
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={16} />

              Edit
            </button>

            {/* STATUS */}
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onStatus("REVIEW")
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Settings2
                size={16}
              />

              Status
            </button>

            {/* HOURS */}
            <button
              type="button"
              disabled={busy}
              onClick={onHours}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#137A3D] px-4 text-sm font-black text-white transition hover:bg-[#0f6833] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clock3 size={16} />

              Hours
            </button>
          </div>
        </div>

        {/* =========================================
            QUICK INFORMATION
        ========================================== */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info
            icon={
              <Star size={17} />
            }
            label="Rating"
            value={`${Number(
              store.averageRating ||
                0,
            ).toFixed(1)} (${
              store.totalReviews ?? 0
            })`}
          />

          <Info
            icon={
              <Phone size={17} />
            }
            label="Phone"
            value={
              store.phoneNumber ??
              "—"
            }
          />

          <Info
            icon={
              <Mail size={17} />
            }
            label="Email"
            value={
              store.email ?? "—"
            }
          />

          <Info
            icon={
              <Clock3 size={17} />
            }
            label="Open now"
            value={
              store.isOpenNow === true
                ? "Yes"
                : store.isOpenNow ===
                    false
                  ? "No"
                  : "Unknown"
            }
          />
        </div>
      </div>
    </section>
  );
}

/* =============================================
   SMALL INFO CARD
============================================= */
function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-400">
        <span className="text-[#137A3D]">
          {icon}
        </span>

        {label}
      </div>

      <p className="mt-1 truncate text-sm font-black text-gray-700">
        {value}
      </p>
    </div>
  );
}