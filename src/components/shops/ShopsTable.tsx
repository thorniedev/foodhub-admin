import Link from "next/link";

import { Eye, MapPin, Pencil, Settings2, Trash2 } from "lucide-react";

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
  onDelete,
}: {
  stores: Store[];
  disabled?: boolean;
  onEdit: (store: Store) => void;
  onStatus: (store: Store, action: StoreStatusAction) => void;
  onDelete?: (store: Store) => void;
}) {
  return (
    <div
      className="
        w-full
        min-w-0
        max-w-full
        overflow-x-auto
      "
    >
      <table
        className="
          w-full
          min-w-[1100px]
          border-collapse
          text-left
        "
      >
        {/* ================= HEADER ================= */}
        <thead>
          <tr
            className="
              border-b
              border-gray-100
              bg-gray-50/70
            "
          >
            <th
              className="
                px-6
                py-4
                text-xl
                font-semibold
                text-primary-800
              "
            >
              ហាង
            </th>

            <th
              className="
                px-6
                py-4
                text-xl
                font-semibold
                text-primary-800
              "
            >
              ទីតាំង
            </th>

            <th
              className="
                px-6
                py-4
                text-xl min-w-[160px]
                font-semibold
                text-primary-800
              "
            >
              ស្ថានភាពហាង
            </th>

            <th
              className="
                px-6
                py-4
                text-xl
                font-semibold
                text-primary-800
              "
            >
              បើកឥឡូវ
            </th>

            <th
              className="
                px-6
                py-4
                text-start
                text-xl
                font-semibold
                text-primary-800
              "
            >
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {stores.map((store) => {
            const fallbackLogo = imageUrlOrNull(store.logoUrl);

            const priceLevel = formatPriceLevel(store.priceLevel);

            const detailHref = `/shops/${store.uuid}`;

            return (
              <tr
                key={store.uuid}
                className="
                  border-b
                  border-gray-100
                  bg-white
                  transition-colors
                  duration-150
                  last:border-b-0
                  hover:bg-gray-50/70
                "
              >
                {/* ================= STORE PROFILE ================= */}
                <td className="px-6 py-2">
                  <Link
                    href={detailHref}
                    title={`មើលព័ត៌មាន ${store.storeName}`}
                    className="
                      group
                      flex
                      min-w-[280px]
                      items-center
                      gap-4
                      rounded-2xl
                      outline-none
                      transition
                      focus-visible:ring-4
                      focus-visible:ring-primary-100
                    "
                  >
                    {/* Logo */}
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-primary-100
                        bg-primary-50
                        text-primary-800
                        transition
                        group-hover:border-primary-200
                        group-hover:bg-primary-100
                      "
                    >
                      {store.logoMediaUuid ? (
                        <StoreMediaImage
                          mediaUuid={store.logoMediaUuid}
                          alt={`${store.storeName} logo`}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : fallbackLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fallbackLogo}
                          alt={store.storeName}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <span
                          className="
                            text-lg
                            font-semibold
                          "
                        >
                          {storeInitials(store.storeName)}
                        </span>
                      )}
                    </div>

                    {/* Store information */}
                    <div className="min-w-0">
                      <p
                        className="
                          max-w-[260px]
                          truncate
                          text-lg
                          font-medium
                          text-gray-800
                          transition
                          group-hover:text-primary-800
                        "
                      >
                        {store.storeName}
                      </p>
                    </div>
                  </Link>
                </td>

                {/* ================= LOCATION ================= */}
                <td className="px-6 py-2">
                  <div
                    className="
                      flex
                      max-w-[320px]
                      items-start
                      gap-2.5
                    "
                  >
                    <MapPin
                      size={20}
                      strokeWidth={2}
                      className="
                        mt-1
                        shrink-0
                        text-primary-700
                      "
                    />

                    <span
                      className="
                        line-clamp-2
                        text-lg
                        leading-7
                        text-gray-500
                      "
                    >
                      {displayStoreLocation(store) || "—"}
                    </span>
                  </div>
                </td>

                {/* ================= OPERATING STATUS ================= */}
                <td className="px-6 py-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onStatus(store, "OPERATING")}
                    className="
                      rounded-full
                      transition
                      focus:outline-none
                      focus:ring-4
                      focus:ring-primary-100
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <StatusBadge
                      value={store.operatingStatus}
                      kind="operating"
                    />
                  </button>
                </td>

                {/* ================= OPEN NOW ================= */}
                <td className="px-6 py-2">
                  <OpenStatusBadge isOpen={store.isOpenNow} />
                </td>

                {/* ================= ACTIONS ================= */}
                <td className="px-6 py-2">
                  <div
                    className="
                      flex
                      items-center
                      justify-start
                      gap-2
                    "
                  >
                    {/* Detail */}
                    <Link
                      href={detailHref}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        text-primary-700
                        transition
                        hover:bg-primary-50
                        hover:text-primary-800
                        focus:outline-none
                        focus:ring-4
                        focus:ring-primary-100
                      "
                      title="មើលលម្អិត"
                    >
                      <Eye size={20} />
                    </Link>

                    {/* Edit */}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEdit(store)}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        text-blue-500
                        transition
                        hover:bg-blue-50
                        focus:outline-none
                        focus:ring-4
                        focus:ring-blue-100
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      title="កែប្រែ"
                    >
                      <Pencil size={20} />
                    </button>

                    {/* Status */}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onStatus(store, "ACCOUNT")}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        text-secondary-500
                        transition
                        hover:bg-secondary-50
                        hover:text-secondary-600
                        focus:outline-none
                        focus:ring-4
                        focus:ring-secondary-100
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      title="គ្រប់គ្រងស្ថានភាព"
                    >
                      <Settings2 size={20} />
                    </button>

                    {/* Delete */}
                    {onDelete && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onDelete(store)}
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          text-red-500
                          transition
                          hover:bg-red-50
                          hover:text-red-600
                          focus:outline-none
                          focus:ring-4
                          focus:ring-red-100
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                        title="លុបហាង"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {/* ================= EMPTY STATE ================= */}
          {stores.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="
                  px-6
                  py-16
                  text-center
                "
              >
                <p
                  className="
                    text-lg
                    font-medium
                    text-gray-500
                  "
                >
                  មិនមានទិន្នន័យហាង
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    text-gray-400
                  "
                >
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

/* =========================================================
   STATUS BADGE
========================================================= */

export function StatusBadge({
  value,
  kind,
}: {
  value: string;
  kind: "review" | "account" | "operating";
}) {
  const normalized = String(value || "UNKNOWN").toUpperCase();

  const positive = ["APPROVED", "ACTIVE", "OPEN"].includes(normalized);

  const warning = ["PENDING", "TEMPORARILY_CLOSED"].includes(normalized);

  const danger = ["REJECTED", "SUSPENDED", "CLOSED"].includes(normalized);

  const className = positive
    ? "bg-primary-50 text-primary-700 ring-primary-100"
    : warning
      ? "bg-secondary-50 text-secondary-600 ring-secondary-100"
      : danger
        ? "bg-red-50 text-red-600 ring-red-100"
        : kind === "operating"
          ? "bg-slate-100 text-slate-600 ring-slate-200"
          : "bg-gray-100 text-gray-600 ring-gray-200";

  const dotClassName = positive
    ? "bg-primary-600"
    : warning
      ? "bg-secondary-500"
      : danger
        ? "bg-red-500"
        : "bg-gray-400";

  const label =
    normalized === "OPEN"
      ? "បើក"
      : normalized === "CLOSED"
        ? "បិទ"
        : normalized === "TEMPORARILY_CLOSED"
          ? "បិទបណ្តោះអាសន្ន"
          : normalized;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        whitespace-nowrap
        rounded-full
        px-3.5
        py-1.5
        text-lg
        font-medium
        ring-1
        ring-inset
        ${className}
      `}
    >
      <span
        className={`
          h-2
          w-2
          shrink-0
          rounded-full
          ${dotClassName}
        `}
      />

      {label}
    </span>
  );
}

/* =========================================================
   OPEN STATUS BADGE
========================================================= */

function OpenStatusBadge({ isOpen }: { isOpen: boolean | null | undefined }) {
  if (isOpen === true) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-primary-50
          px-3.5
          py-1.5
          text-lg
          font-medium
          text-primary-700
          ring-1
          ring-inset
          ring-primary-100
        "
      >
        <span
          className="
            h-2
            w-2
            rounded-full
            bg-primary-600
          "
        />
        បើក
      </span>
    );
  }

  if (isOpen === false) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-red-50
          px-3.5
          py-1.5
          text-lg
          font-medium
          text-red-600
          ring-1
          ring-inset
          ring-red-100
        "
      >
        <span
          className="
            h-2
            w-2
            rounded-full
            bg-red-500
          "
        />
        បិទ
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-gray-100
        px-3.5
        py-1.5
        text-lg
        font-medium
        text-gray-500
      "
    >
      <span
        className="
          h-2
          w-2
          rounded-full
          bg-gray-400
        "
      />
      —
    </span>
  );
}
