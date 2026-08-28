"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, MapPin, MoreVertical, Pencil, Settings2, Store as StoreIcon, Trash2 } from "lucide-react";
import type { Store, StoreStatusAction } from "@/src/types/shop";
import {
  displayStoreLocation,
  getStoreAccountStatus,
  getStoreLiveStatus,
  getStoreReviewStatus,
  storeLogoCandidate,
} from "@/src/lib/shopFormat";
import StoreMediaImage from "./detail/StoreMediaImage";

export default function ShopsTable({
  stores,
  disabled = false,
  onEdit,
  onStatus,
  onDelete,
}: {
  stores: Store[];
  disabled?: boolean;
  onEdit: (store: Store) => void;
  onStatus: (store: Store, action: StoreStatusAction) => void;
  onDelete?: (store: Store) => void;
}) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full table-auto border-collapse text-left">
        {/* ================= HEADER ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="whitespace-nowrap px-3 py-3.5 text-lg font-semibold text-primary-800 min-w-[140px]">
              ហាង
            </th>

            <th className="whitespace-nowrap px-3 py-3.5 text-lg font-semibold text-primary-800 min-w-[130px]">
              ទីតាំង
            </th>

            <th className="whitespace-nowrap px-2 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[95px]">
              ការពិនិត្យ
            </th>

            <th className="whitespace-nowrap px-2 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[85px]">
              គណនី
            </th>

            <th className="whitespace-nowrap px-2 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[80px]">
              បើកឥឡូវ
            </th>

            <th className="whitespace-nowrap px-3 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[110px]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {stores.map((store, index) => {
            const logoCandidate = storeLogoCandidate(store);
            const detailHref = `/shops/${store.uuid}`;

            return (
              <tr
                key={store.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Store Profile */}
                <td className="px-4 py-3">
                  <Link
                    href={detailHref}
                    title={`មើលព័ត៌មាន ${store.storeName}`}
                    className="group flex items-center gap-3 rounded-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100">
                      {logoCandidate ? (
                        <StoreMediaImage
                          mediaUuid={logoCandidate}
                          alt={`${store.storeName} logo`}
                          className="h-full w-full object-cover"
                          fallbackIcon={
                            <StoreIcon
                              size={22}
                              className="text-primary-800 shrink-0"
                            />
                          }
                        />
                      ) : (
                        <StoreIcon size={22} className="text-primary-800 shrink-0" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[180px] truncate text-lg font-semibold text-gray-800 transition group-hover:text-primary-800">
                        {store.storeName}
                      </p>
                    </div>
                  </Link>
                </td>

                {/* Location */}
                <td className="px-3 py-3">
                  <div className="flex max-w-[180px] items-center gap-1.5">
                    <MapPin size={18} strokeWidth={2} className="shrink-0 text-primary-700" />
                    <span className="line-clamp-1 text-lg font-normal text-gray-500">
                      {displayStoreLocation(store) || "—"}
                    </span>
                  </div>
                </td>

                {/* Review Status */}
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onStatus(store, "REVIEW")}
                    className="rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ReviewStatusBadge status={store.reviewStatus} />
                  </button>
                </td>

                {/* Account Status */}
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onStatus(store, "ACCOUNT")}
                    className="rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <AccountStatusBadge status={store.accountStatus} />
                  </button>
                </td>

                {/* Open Now / Operating Status */}
                <td className="px-2 py-3 text-center">
                  <LiveStatusBadge store={store} />
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <ShopRowActions
                    store={store}
                    detailHref={detailHref}
                    disabled={disabled}
                    rowIndex={index}
                    totalRows={stores.length}
                    onEdit={onEdit}
                    onStatus={onStatus}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            );
          })}

          {/* Empty State */}
          {stores.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center">
                <p className="text-xl font-medium text-gray-500">
                  មិនមានទិន្នន័យហាង
                </p>
                <p className="mt-1 text-lg text-gray-400">
                  ទិន្នន័យហាងនឹងបង្ហាញនៅទីនេះ
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ShopRowActions({
  store,
  detailHref,
  disabled,
  rowIndex = 0,
  totalRows = 1,
  onEdit,
  onStatus,
  onDelete,
}: {
  store: Store;
  detailHref: string;
  disabled: boolean;
  rowIndex?: number;
  totalRows?: number;
  onEdit: (store: Store) => void;
  onStatus: (store: Store, action: StoreStatusAction) => void;
  onDelete?: (store: Store) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const openUpward = totalRows > 2 && rowIndex >= totalRows - 2;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative flex items-center justify-center gap-2">
      {/* 1. View Detail (Green Eye) */}
      <Link
        href={detailHref}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        title="មើលលម្អិត"
      >
        <Eye size={18} />
      </Link>

      {/* 2. Primary Action: Edit (Blue Pencil) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit(store)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="កែប្រែ"
      >
        <Pencil size={18} />
      </button>

      {/* 3. More (3-dots) for extra actions */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none ${
            open ? "bg-gray-200 text-gray-900 ring-2 ring-gray-300/60" : ""
          }`}
          title="ផ្សេងទៀត"
          aria-label="More actions"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div
            className={`absolute right-0 z-[100] min-w-max whitespace-nowrap overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
              openUpward ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onStatus(store, "ACCOUNT");
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-lg font-semibold text-amber-700 transition hover:bg-amber-50 whitespace-nowrap"
            >
              <Settings2 size={18} className="shrink-0" />
              <span>គ្រប់គ្រងស្ថានភាព</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDelete(store);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-lg font-semibold text-red-600 transition hover:bg-red-50 whitespace-nowrap"
              >
                <Trash2 size={18} className="shrink-0" />
                <span>លុបចេញពីប្រព័ន្ធ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReviewStatusBadge({ status }: { status?: string | null }) {
  const info = getStoreReviewStatus(status);
  const className = info.isPositive
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : info.isDanger
      ? "bg-red-50 text-red-600 border-red-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  const dotClassName = info.isPositive
    ? "bg-emerald-500"
    : info.isDanger
      ? "bg-red-500"
      : "bg-amber-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-semibold border ${className}`}
      title={info.note}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {info.label}
    </span>
  );
}

export function AccountStatusBadge({ status }: { status?: string | null }) {
  const info = getStoreAccountStatus(status);
  const className = info.isPositive
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : info.isDanger
      ? "bg-red-50 text-red-600 border-red-100"
      : "bg-gray-50 text-gray-600 border-gray-150";

  const dotClassName = info.isPositive
    ? "bg-emerald-500"
    : info.isDanger
      ? "bg-red-500"
      : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-semibold border ${className}`}
      title={info.note}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {info.label}
    </span>
  );
}

export function LiveStatusBadge({ store }: { store: Store }) {
  const info = getStoreLiveStatus(store);
  const className = info.isPositive
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : info.isDanger
      ? "bg-red-50 text-red-600 border-red-100"
      : info.isWarning
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-gray-50 text-gray-500 border-gray-150";

  const dotClassName = info.isPositive
    ? "bg-emerald-500"
    : info.isDanger
      ? "bg-red-500"
      : info.isWarning
        ? "bg-amber-500"
        : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-semibold border ${className}`}
      title={info.note}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {info.label}
    </span>
  );
}

export function StatusBadge({
  value,
  kind,
}: {
  value: string;
  kind: "review" | "account" | "operating";
}) {
  if (kind === "review") return <ReviewStatusBadge status={value} />;
  if (kind === "account") return <AccountStatusBadge status={value} />;
  return (
    <LiveStatusBadge
      store={
        {
          operatingStatus: value,
          isOpenNow: value === "OPEN",
        } as Store
      }
    />
  );
}
