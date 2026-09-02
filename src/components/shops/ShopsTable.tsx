"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, MapPin, MinusCircle, MoreVertical, Pencil, Store as StoreIcon, Trash2 } from "lucide-react";
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
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[140px]">
              ហាង
            </th>

            <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[130px]">
              ទីតាំង
            </th>

            <th className="whitespace-nowrap px-2 py-4 text-center font-medium min-w-[95px]">
              ការពិនិត្យ
            </th>

            <th className="whitespace-nowrap px-2 py-4 text-center font-medium min-w-[85px]">
              គណនី
            </th>

            <th className="whitespace-nowrap px-2 py-4 text-center font-medium min-w-[80px]">
              បើកឥឡូវ
            </th>

            <th className="whitespace-nowrap px-3 py-4 text-center font-medium min-w-[110px]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {stores.map((store, index) => (
            <ShopTableRow
              key={store.uuid}
              store={store}
              index={index}
              totalRows={stores.length}
              disabled={disabled}
              onEdit={onEdit}
              onStatus={onStatus}
              onDelete={onDelete}
            />
          ))}

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

const ShopTableRow = memo(function ShopTableRow({
  store,
  index,
  totalRows,
  disabled,
  onEdit,
  onStatus,
  onDelete,
}: {
  store: Store;
  index: number;
  totalRows: number;
  disabled: boolean;
  onEdit: (store: Store) => void;
  onStatus: (store: Store, action: StoreStatusAction) => void;
  onDelete?: (store: Store) => void;
}) {
  const logoCandidate = storeLogoCandidate(store);
  const detailHref = `/shops/${store.uuid}`;

  return (
    <tr className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70">
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
            <p className="max-w-[180px] truncate text-lg font-normal text-gray-800 transition group-hover:text-primary-800">
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
          totalRows={totalRows}
          onEdit={onEdit}
          onStatus={onStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
});

const ShopRowActions = memo(function ShopRowActions({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const isActive = store.accountStatus === "ACTIVE";

  return (
    <div className="relative flex items-center justify-center gap-2">
      {/* 1. View Detail (Green Eye) */}
      <Link
        href={detailHref}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        title="មើលលម្អិត"
      >
        <Eye size={20} />
      </Link>

      {/* 2. Edit (Blue Pencil) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit(store)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
        title="កែប្រែ"
      >
        <Pencil size={20} />
      </button>

      {/* 3. Three-Dots Menu containing Status & Delete */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMenuOpen((prev) => !prev)}
          title="ជម្រើសបន្ថែម"
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-40 ${
            menuOpen
              ? "bg-gray-200 text-gray-900 shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          <MoreVertical size={20} />
        </button>

        {/* Dropdown Menu Popup */}
        {menuOpen && (
          <div
            className={`absolute right-0 z-[120] min-w-[200px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
              totalRows > 3 && rowIndex >= totalRows - 2
                ? "bottom-12 origin-bottom-right"
                : "top-12 origin-top-right"
            }`}
          >
            {/* Option 1: Manage Status */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setMenuOpen(false);
                onStatus(store, "ACCOUNT");
              }}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? "text-amber-700 hover:bg-amber-50"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <MinusCircle
                size={18}
                className={`shrink-0 ${isActive ? "text-amber-600" : "text-emerald-600"}`}
              />
              <span>{isActive ? "ផ្អាក / បិទគណនី" : "បើកគណនីឡើងវិញ"}</span>
            </button>

            <div className="my-1 border-t border-gray-100" />

            {/* Option 2: Hard Delete */}
            {onDelete && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(store);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-lg font-normal text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} className="text-red-500 shrink-0" />
                <span>លុបចេញពីប្រព័ន្ធ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export const ReviewStatusBadge = memo(function ReviewStatusBadge({ status }: { status?: string | null }) {
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${className}`}
      title={info.note}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {info.label}
    </span>
  );
});

export const AccountStatusBadge = memo(function AccountStatusBadge({ status }: { status?: string | null }) {
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${className}`}
      title={info.note}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {info.label}
    </span>
  );
});

export const LiveStatusBadge = memo(function LiveStatusBadge({ store }: { store: Store }) {
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${className}`}
      title={info.note}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {info.label}
    </span>
  );
});

export const StatusBadge = memo(function StatusBadge({
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
});

