import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Mail,
  MapPin,
  MinusCircle,
  Pencil,
  Phone,
  Settings2,
  ShieldCheck,
  Store as StoreIcon,
  Trash2,
  UserCheck,
} from "lucide-react";

import type { Store, StoreStatusAction } from "@/src/types/shop";
import {
  displayStoreLocation,
  getStoreAccountStatus,
  getStoreLiveStatus,
  getStoreReviewStatus,
  storeCoverCandidate,
  storeLogoCandidate,
} from "@/src/lib/shopFormat";
import StoreMediaImage from "./StoreMediaImage";

export default function StoreProfileHeader({
  store,
  busy = false,
  onEdit,
  onStatus,
  onHours,
  onDelete,
}: {
  store: Store;
  busy?: boolean;
  onEdit: () => void;
  onStatus: (action: StoreStatusAction) => void;
  onHours: () => void;
  onDelete?: () => void;
}) {
  const coverCandidate = storeCoverCandidate(store);
  const logoCandidate = storeLogoCandidate(store);

  const reviewStatus = getStoreReviewStatus(store.reviewStatus);
  const liveStatus = getStoreLiveStatus(store);
  const accountStatus = getStoreAccountStatus(store.accountStatus);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* =================================================
          TOP COVER BANNER
      ================================================== */}
      <div className="relative h-60 overflow-hidden bg-gradient-to-br from-[#0e6f34] via-[#14833E] to-[#1cb053] sm:h-72">
        {coverCandidate ? (
          <>
            <StoreMediaImage
              mediaUuid={coverCandidate}
              alt={`${store.storeName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute right-40 top-10 h-56 w-56 rounded-full bg-emerald-300/15 blur-2xl" />
          </>
        )}

        {/* Top Control: Back Button */}
        <Link
          href="/shops"
          className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-black/40 px-5 py-2.5 text-lg font-normal text-white backdrop-blur-md transition hover:bg-black/60"
        >
          <ArrowLeft size={20} />
          <span>ហាង</span>
        </Link>

        {/* Store Logo & Title in Cover */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24">
              {logoCandidate ? (
                <StoreMediaImage
                  mediaUuid={logoCandidate}
                  alt={`${store.storeName} logo`}
                  className="h-full w-full object-cover"
                  fallbackIcon={
                    <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-[#137A3D]">
                      <StoreIcon size={36} />
                    </div>
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-[#137A3D]">
                  <StoreIcon size={36} />
                </div>
              )}
            </div>

            {/* Name + Address */}
            <div className="min-w-0 flex-1 pb-1 text-white">
              <h1 className="truncate text-3xl font-medium sm:text-4xl drop-shadow-xs">
                {store.storeName}
              </h1>
              <div className="mt-1.5 flex items-start gap-2 text-lg font-normal text-white/90">
                <MapPin size={20} className="mt-0.5 shrink-0 text-emerald-300" />
                <span className="line-clamp-1">
                  {displayStoreLocation(store) || "មិនមានអាសយដ្ឋាន"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTTOM SECTION (Green Gradient Theme)
      ================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f6b32] via-[#14833E] to-[#1aad54] p-6 sm:p-7 text-white shadow-xl shadow-primary-900/20">
        {/* Decorative background blur blobs */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        {/* Top Row: Quick Contacts (Left) & Actions Bar (Right) */}
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Quick Contact Links */}
          <div className="flex flex-wrap items-center gap-3">
            {store.phoneNumber ? (
              <a
                href={`tel:${store.phoneNumber}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2.5 text-lg font-normal text-white shadow-xs backdrop-blur-sm transition hover:border-white/40 hover:bg-white/25"
                title="ចុចដើម្បីហៅ"
              >
                <Phone size={19} className="text-emerald-200" />
                <span>{store.phoneNumber}</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-lg font-normal text-white/60">
                <Phone size={19} className="text-white/40" />
                <span>មិនមានលេខទូរស័ព្ទ</span>
              </div>
            )}

            {store.email ? (
              <a
                href={`mailto:${store.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2.5 text-lg font-normal text-white shadow-xs backdrop-blur-sm transition hover:border-white/40 hover:bg-white/25"
                title="ចុចដើម្បីផ្ញើអ៊ីមែល"
              >
                <Mail size={19} className="text-emerald-200" />
                <span className="max-w-[240px] truncate">{store.email}</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-lg font-normal text-white/60">
                <Mail size={19} className="text-white/40" />
                <span>មិនមានអ៊ីមែល</span>
              </div>
            )}
          </div>

          {/* Actions Bar Capsule */}
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-md shadow-lg shadow-black/5 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              title="កែប្រែ"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 active:scale-95 disabled:opacity-50"
            >
              <Pencil size={20} />
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onStatus("REVIEW")}
              title="គ្រប់គ្រងស្ថានភាព"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-amber-200 transition hover:bg-amber-400/30 hover:text-amber-100 active:scale-95 disabled:opacity-50"
            >
              <MinusCircle size={20} />
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onHours}
              title="កំណត់ម៉ោងដំណើរការ"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-emerald-200 transition hover:bg-emerald-400/30 hover:text-emerald-100 active:scale-95 disabled:opacity-50"
            >
              <Clock3 size={20} />
            </button>

            {onDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                title="លុបហាង"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-rose-200 transition hover:bg-rose-500/30 hover:text-rose-100 active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* 3 Status Cards */}
        <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-3">
          {/* 1. Review Status */}
          <StatusKpiCard
            icon={<ShieldCheck size={24} />}
            label="ស្ថានភាពពិនិត្យ (Review)"
            value={reviewStatus.label}
            note={reviewStatus.note}
            tone={
              reviewStatus.isPositive
                ? "positive"
                : reviewStatus.isDanger
                  ? "danger"
                  : "warning"
            }
          />

          {/* 2. Operating Status */}
          <StatusKpiCard
            icon={<Clock3 size={24} />}
            label="ស្ថានភាពដំណើរការ (Operating)"
            value={liveStatus.label}
            note={liveStatus.note}
            tone={
              liveStatus.isPositive
                ? "positive"
                : liveStatus.isDanger
                  ? "danger"
                  : "warning"
            }
          />

          {/* 3. Account Status */}
          <StatusKpiCard
            icon={<UserCheck size={24} />}
            label="ស្ថានភាពគណនី (Account)"
            value={accountStatus.label}
            note={accountStatus.note}
            tone={
              accountStatus.isPositive
                ? "positive"
                : accountStatus.isDanger
                  ? "danger"
                  : "warning"
            }
          />
        </div>
      </div>
    </section>
  );
}

function StatusKpiCard({
  icon,
  label,
  value,
  note,
  tone = "positive",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  tone?: "positive" | "warning" | "danger";
}) {
  const toneStyles = {
    positive: {
      text: "text-emerald-200 font-medium",
      iconBox: "bg-emerald-400/20 text-emerald-200 ring-emerald-300/30",
      dot: "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]",
      ring: "ring-emerald-400/20 hover:ring-emerald-400/40 bg-emerald-950/10",
    },
    warning: {
      text: "text-amber-200 font-medium",
      iconBox: "bg-amber-400/20 text-amber-200 ring-amber-300/30",
      dot: "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]",
      ring: "ring-amber-400/20 hover:ring-amber-400/40 bg-amber-950/10",
    },
    danger: {
      text: "text-rose-200 font-medium",
      iconBox: "bg-rose-400/20 text-rose-200 ring-rose-300/30",
      dot: "bg-rose-300 shadow-[0_0_8px_rgba(253,164,175,0.8)]",
      ring: "ring-rose-400/20 hover:ring-rose-400/40 bg-rose-950/10",
    },
  }[tone];

  return (
    <div className={`group relative overflow-hidden rounded-3xl p-5 backdrop-blur-sm ring-1 transition-all duration-200 hover:bg-white/15 ${toneStyles.ring}`}>
      {/* Subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent" />

      <div className="relative flex items-center gap-3.5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full backdrop-blur-sm ring-1 shadow-xs ${toneStyles.iconBox}`}>
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-lg font-normal text-white/90">{label}</p>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles.dot} animate-pulse`} />
          </div>
          <p className={`mt-0.5 truncate text-2xl drop-shadow-xs ${toneStyles.text}`} title={value}>
            {value}
          </p>
          <p className="mt-0.5 text-lg font-normal text-white/80 truncate" title={note}>
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}
