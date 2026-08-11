import Link from "next/link";
import { Eye, MapPin, Pencil, Settings2, Star } from "lucide-react";

import type { Store, StoreStatusAction } from "@/src/types/shop";
import {
  displayStoreLocation,
  formatPriceLevel,
  imageUrlOrNull,
  storeInitials,
} from "@/src/lib/shopFormat";
import StoreMediaImage from "./detail/StoreMediaImage";

export default function ShopsTable({
  stores,
  disabled = false,
  onEdit,
  onStatus,
}: {
  stores: Store[];
  disabled?: boolean;
  onEdit: (store: Store) => void;
  onStatus: (store: Store, action: StoreStatusAction) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ហាង</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ទីតាំង</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Rating</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Review</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Account</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Operating</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Open now</th>
            <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody>
          {stores.map((store) => {
            const fallbackLogo = imageUrlOrNull(store.logoUrl);

            return (
              <tr
                key={store.uuid}
                className="border-b border-gray-100 bg-white transition last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-4">
                  <div className="flex min-w-[250px] items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-emerald-50 text-[#136C34]">
                      {store.logoMediaUuid ? (
                        <StoreMediaImage
                          mediaUuid={store.logoMediaUuid}
                          alt={`${store.storeName} logo`}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : fallbackLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fallbackLogo}
                          alt={store.storeName}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-bold">
                          {storeInitials(store.storeName)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg text-gray-800">{store.storeName}</p>
                      <p className="mt-0.5 text-sm text-gray-400">
                        {formatPriceLevel(store.priceLevel)} · {store.countryCode}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex max-w-[280px] items-start gap-2 text-base text-gray-500">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-[#136C34]" />
                    <span className="line-clamp-2">{displayStoreLocation(store) || "—"}</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-base text-gray-700">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    {Number(store.averageRating || 0).toFixed(1)}
                    <span className="text-gray-400">({store.totalReviews ?? 0})</span>
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button type="button" disabled={disabled} onClick={() => onStatus(store, "REVIEW")}>
                    <StatusBadge value={store.reviewStatus} kind="review" />
                  </button>
                </td>

                <td className="px-5 py-4">
                  <button type="button" disabled={disabled} onClick={() => onStatus(store, "ACCOUNT")}>
                    <StatusBadge value={store.accountStatus} kind="account" />
                  </button>
                </td>

                <td className="px-5 py-4">
                  <button type="button" disabled={disabled} onClick={() => onStatus(store, "OPERATING")}>
                    <StatusBadge value={store.operatingStatus} kind="operating" />
                  </button>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-base ${
                      store.isOpenNow === true
                        ? "bg-emerald-50 text-emerald-700"
                        : store.isOpenNow === false
                          ? "bg-gray-100 text-gray-500"
                          : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {store.isOpenNow === true
                      ? "OPEN"
                      : store.isOpenNow === false
                        ? "CLOSED"
                        : "—"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/shops/${store.uuid}`}
                      className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                      title="មើលលម្អិត"
                    >
                      <Eye size={18} />
                    </Link>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEdit(store)}
                      className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onStatus(store, "ACCOUNT")}
                      className="rounded-lg p-2 text-violet-500 transition hover:bg-violet-50 disabled:opacity-40"
                      title="ស្ថានភាព"
                    >
                      <Settings2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({
  value,
  kind,
}: {
  value: string;
  kind: "review" | "account" | "operating";
}) {
  const normalized = String(value || "UNKNOWN").toUpperCase();

  const className = ["APPROVED", "ACTIVE", "OPEN"].includes(normalized)
    ? "bg-emerald-50 text-emerald-700"
    : ["PENDING", "TEMPORARILY_CLOSED"].includes(normalized)
      ? "bg-amber-50 text-amber-700"
      : ["REJECTED", "SUSPENDED"].includes(normalized)
        ? "bg-red-50 text-red-700"
        : kind === "operating"
          ? "bg-slate-100 text-slate-600"
          : "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-base ${className}`}>
      {normalized}
    </span>
  );
}
