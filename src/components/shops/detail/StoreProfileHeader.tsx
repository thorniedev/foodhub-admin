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
import type { Store, StoreStatusAction } from "@/src/types/shop";
import {
  displayStoreLocation,
  imageUrlOrNull,
  storeInitials,
} from "@/src/lib/shopFormat";
import { StatusBadge } from "../ShopsTable";

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
  onStatus: (a: StoreStatusAction) => void;
  onHours: () => void;
}) {
  const cover = imageUrlOrNull(store.coverImageUrl),
    logo = imageUrlOrNull(store.logoUrl);
  return (
    <section className="overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#137A3D] via-emerald-700 to-emerald-900 sm:h-64">
        {cover && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={`${store.storeName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          </>
        )}
        <Link
          href="/shops"
          className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm font-black text-white backdrop-blur"
        >
          <ArrowLeft size={17} />
          Stores
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-white shadow-lg sm:h-24 sm:w-24">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt={store.storeName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-black text-[#137A3D]">
                  {storeInitials(store.storeName)}
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1 text-white">
              <p className="truncate text-2xl font-black sm:text-3xl">
                {store.storeName}
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-white/80">
                <MapPin size={15} className="mt-0.5" />
                <span className="line-clamp-1">
                  {displayStoreLocation(store)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={store.reviewStatus} kind="review" />
            <StatusBadge value={store.accountStatus} kind="account" />
            <StatusBadge value={store.operatingStatus} kind="operating" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={onEdit}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-black"
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              disabled={busy}
              onClick={() => onStatus("REVIEW")}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-black"
            >
              <Settings2 size={16} />
              Status
            </button>
            <button
              disabled={busy}
              onClick={onHours}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#137A3D] px-3 text-sm font-black text-white"
            >
              <Clock3 size={16} />
              Hours
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info
            icon={<Star size={17} />}
            label="Rating"
            value={`${Number(store.averageRating || 0).toFixed(1)} (${store.totalReviews ?? 0})`}
          />
          <Info
            icon={<Phone size={17} />}
            label="Phone"
            value={store.phoneNumber ?? "—"}
          />
          <Info
            icon={<Mail size={17} />}
            label="Email"
            value={store.email ?? "—"}
          />
          <Info
            icon={<Clock3 size={17} />}
            label="Open now"
            value={
              store.isOpenNow === true
                ? "Yes"
                : store.isOpenNow === false
                  ? "No"
                  : "Unknown"
            }
          />
        </div>
      </div>
    </section>
  );
}
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
      <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
        <span className="text-[#137A3D]">{icon}</span>
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-black text-gray-700">{value}</p>
    </div>
  );
}
