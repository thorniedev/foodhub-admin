// import type { ReactNode } from "react";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Clock3,
//   Mail,
//   MapPin,
//   Pencil,
//   Phone,
//   Settings2,
//   Star,
// } from "lucide-react";

// import type { Store, StoreStatusAction } from "@/src/types/shop";
// import {
//   displayStoreLocation,
//   imageUrlOrNull,
//   storeInitials,
// } from "@/src/lib/shopFormat";
// import { StatusBadge } from "../ShopsTable";
// import StoreMediaImage from "./StoreMediaImage";

// export default function StoreProfileHeader({
//   store,
//   busy = false,
//   onEdit,
//   onStatus,
//   onHours,
// }: {
//   store: Store;
//   busy?: boolean;
//   onEdit: () => void;
//   onStatus: (action: StoreStatusAction) => void;
//   onHours: () => void;
// }) {
//   const fallbackCover = imageUrlOrNull(store.coverImageUrl);
//   const fallbackLogo = imageUrlOrNull(store.logoUrl);

//   return (
//     <section className="overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-sm">
//       <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#14833E] via-emerald-700 to-emerald-900 sm:h-72">
//         {store.coverMediaUuid ? (
//           <>
//             <StoreMediaImage
//               mediaUuid={store.coverMediaUuid}
//               alt={`${store.storeName} cover`}
//               className="absolute inset-0 h-full w-full object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
//           </>
//         ) : fallbackCover ? (
//           <>
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={fallbackCover}
//               alt={`${store.storeName} cover`}
//               className="absolute inset-0 h-full w-full object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
//           </>
//         ) : (
//           <>
//             <div className="absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-white/5" />
//             <div className="absolute right-40 top-10 h-56 w-56 rounded-full bg-emerald-300/5" />
//           </>
//         )}

//         <Link
//           href="/shops"
//           className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-lg text-white backdrop-blur-md transition hover:bg-black/40"
//         >
//           <ArrowLeft size={18} />
//           ហាង
//         </Link>

//         <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7">
//           <div className="flex items-end gap-4">
//             <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24">
//               {store.logoMediaUuid ? (
//                 <StoreMediaImage
//                   mediaUuid={store.logoMediaUuid}
//                   alt={`${store.storeName} logo`}
//                   className="h-full w-full object-contain p-2"
//                 />
//               ) : fallbackLogo ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={fallbackLogo}
//                   alt={`${store.storeName} logo`}
//                   className="h-full w-full object-contain p-2"
//                 />
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center bg-white text-xl font-bold text-[#137A3D]">
//                   {storeInitials(store.storeName)}
//                 </div>
//               )}
//             </div>

//             <div className="min-w-0 flex-1 pb-1 text-white">
//               <p className="truncate text-4xl font-bold sm:text-5xl">
//                 {store.storeName}
//               </p>
//               <div className="mt-2 flex items-start gap-2 text-lg text-white/85">
//                 <MapPin size={18} className="mt-0.5 shrink-0" />
//                 <span className="line-clamp-2">
//                   {displayStoreLocation(store) || "No address"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="p-5 sm:p-7">
//         <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
//           <div className="flex flex-wrap gap-2">
//             <StatusBadge value={store.reviewStatus} kind="review" />
//             <StatusBadge value={store.accountStatus} kind="account" />
//             <StatusBadge value={store.operatingStatus} kind="operating" />
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <button
//               type="button"
//               disabled={busy}
//               onClick={onEdit}
//               className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D] disabled:opacity-50"
//             >
//               <Pencil size={18} />
//               កែប្រែ
//             </button>

//             <button
//               type="button"
//               disabled={busy}
//               onClick={() => onStatus("REVIEW")}
//               className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D] disabled:opacity-50"
//             >
//               <Settings2 size={18} />
//               ស្ថានភាព
//             </button>

//             <button
//               type="button"
//               disabled={busy}
//               onClick={onHours}
//               className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#137A3D] px-4 text-lg text-white transition hover:bg-[#0f6833] disabled:opacity-50"
//             >
//               <Clock3 size={18} />
//               ម៉ោង
//             </button>
//           </div>
//         </div>

//         <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
//           <Info
//             icon={<Star size={18} />}
//             label="Rating"
//             value={`${Number(store.averageRating || 0).toFixed(1)} (${store.totalReviews ?? 0})`}
//           />
//           <Info
//             icon={<Phone size={18} />}
//             label="Phone"
//             value={store.phoneNumber ?? "—"}
//           />
//           <Info
//             icon={<Mail size={18} />}
//             label="Email"
//             value={store.email ?? "—"}
//           />
//           <Info
//             icon={<Clock3 size={18} />}
//             label="Open now"
//             value={
//               store.isOpenNow === true
//                 ? "Yes"
//                 : store.isOpenNow === false
//                   ? "No"
//                   : "Unknown"
//             }
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

// function Info({
//   icon,
//   label,
//   value,
// }: {
//   icon: ReactNode;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-2xl bg-gray-50 px-4 py-3">
//       <div className="flex items-center gap-2 text-lg font-semibold text-[#F97316]">
//         {icon}
//         {label}
//       </div>
//       <p className="mt-1 truncate text-base text-gray-700">{value}</p>
//     </div>
//   );
// }

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
  Trash2,
} from "lucide-react";

import type { Store, StoreStatusAction } from "@/src/types/shop";
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
  onDelete,
}: {
  store: Store;
  busy?: boolean;
  onEdit: () => void;
  onStatus: (action: StoreStatusAction) => void;
  onHours: () => void;
  onDelete?: () => void;
}) {
  const fallbackCover = imageUrlOrNull(store.coverImageUrl);
  const fallbackLogo = imageUrlOrNull(store.logoUrl);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* Cover */}
      <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-primary-700  to-primary-900 sm:h-[320px]">
        {store.coverMediaUuid ? (
          <>
            <StoreMediaImage
              mediaUuid={store.coverMediaUuid}
              alt={`${store.storeName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </>
        ) : fallbackCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fallbackCover}
              alt={`${store.storeName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </>
        ) : (
          <>
            <div className="absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-white/5" />
            <div className="absolute right-40 top-10 h-56 w-56 rounded-full bg-emerald-300/5" />
          </>
        )}

        {/* Back */}
        <Link
          href="/shops"
          className="
            absolute left-6 top-6 z-20
            inline-flex items-center gap-2
            rounded-xl bg-black/25
            px-4 py-2.5
            text-lg font-medium text-white
            backdrop-blur-md
            transition
            hover:bg-black/40
          "
        >
          <ArrowLeft size={20} />
          ហាង
        </Link>

        {/* Store information */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8">
          <div className="flex items-end gap-5">
            {/* Logo */}
            <div
              className="
                flex h-24 w-24 shrink-0
                overflow-hidden
                rounded-2xl
                border-4 border-white
                bg-white
                shadow-xl
                sm:h-28 sm:w-28
              "
            >
              {store.logoMediaUuid ? (
                <StoreMediaImage
                  mediaUuid={store.logoMediaUuid}
                  alt={`${store.storeName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : fallbackLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fallbackLogo}
                  alt={`${store.storeName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-2xl font-bold text-[#136C34]">
                  {storeInitials(store.storeName)}
                </div>
              )}
            </div>

            {/* Name + location */}
            <div className="min-w-0 flex-1 pb-1 text-white">
              <p className="truncate text-3xl font-bold sm:text-4xl lg:text-5xl">
                {store.storeName}
              </p>

              <div className="mt-3 flex max-w-3xl items-start gap-2 text-lg leading-7 text-white/90">
                <MapPin size={20} className="mt-1 shrink-0" />

                <span className="line-clamp-2">
                  {displayStoreLocation(store) || "មិនមានអាសយដ្ឋាន"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        {/* Status + actions */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge value={store.reviewStatus} kind="review" />

            <StatusBadge value={store.accountStatus} kind="account" />

            <StatusBadge value={store.operatingStatus} kind="operating" />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              className="
                inline-flex min-h-12 items-center gap-2
                rounded-xl border border-gray-200
                bg-white px-5
                text-lg font-medium text-gray-700
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-[#136C34]
                focus:outline-none
                focus:ring-4
                focus:ring-emerald-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Pencil size={20} />
              កែប្រែ
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => onStatus("REVIEW")}
              className="
                inline-flex min-h-12 items-center gap-2
                rounded-xl border border-gray-200
                bg-white px-5
                text-lg font-medium text-gray-700
                transition
                hover:border-violet-200
                hover:bg-violet-50
                hover:text-violet-600
                focus:outline-none
                focus:ring-4
                focus:ring-violet-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Settings2 size={20} />
              ស្ថានភាព
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onHours}
              className="
                inline-flex min-h-12 items-center gap-2
                rounded-xl bg-[#136C34]
                px-5
                text-lg font-medium text-white
                transition
                hover:bg-[#0F5F2E]
                focus:outline-none
                focus:ring-4
                focus:ring-[#136C34]/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Clock3 size={20} />
              ម៉ោងដំណើរការ
            </button>

            {onDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                className="
                  inline-flex min-h-12 items-center gap-2
                  rounded-xl border border-red-200
                  bg-white px-5
                  text-lg font-medium text-red-600
                  transition
                  hover:bg-red-50
                  hover:border-red-300
                  focus:outline-none
                  focus:ring-4
                  focus:ring-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Trash2 size={20} />
                លុប Store
              </button>
            )}
          </div>
        </div>

        {/* Store details */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info
            icon={<Star size={21} />}
            label="ការវាយតម្លៃ"
            value={`${Number(store.averageRating || 0).toFixed(1)} (${store.totalReviews ?? 0})`}
            variant="rating"
          />

          <Info
            icon={<Phone size={21} />}
            label="លេខទូរស័ព្ទ"
            value={store.phoneNumber ?? "—"}
          />

          <Info
            icon={<Mail size={21} />}
            label="អ៊ីមែល"
            value={store.email ?? "—"}
          />

          <Info
            icon={<Clock3 size={21} />}
            label="ស្ថានភាពបច្ចុប្បន្ន"
            value={
              store.isOpenNow === true
                ? "កំពុងបើក"
                : store.isOpenNow === false
                  ? "បានបិទ"
                  : "មិនមានទិន្នន័យ"
            }
            variant={
              store.isOpenNow === true
                ? "open"
                : store.isOpenNow === false
                  ? "closed"
                  : "default"
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
  variant = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  variant?: "default" | "rating" | "open" | "closed";
}) {
  const iconStyle =
    variant === "rating"
      ? "bg-amber-50 text-amber-500"
      : variant === "open"
        ? "bg-emerald-50 text-emerald-600"
        : variant === "closed"
          ? "bg-red-50 text-red-500"
          : "bg-emerald-50 text-[#136C34]";

  const valueStyle =
    variant === "open"
      ? "text-emerald-700"
      : variant === "closed"
        ? "text-red-600"
        : "text-gray-700";

  return (
    <div
      className="
        flex min-w-0 items-center gap-4
        rounded-2xl border border-gray-100
        bg-gray-50/60
        p-4
        transition
        hover:border-gray-200
        hover:bg-gray-50
      "
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-lg font-medium text-gray-500">{label}</p>

        <p
          className={`mt-1 truncate text-lg font-semibold ${valueStyle}`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
