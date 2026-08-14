// // import Link from "next/link";
// // import { Eye, MapPin, Pencil, Settings2, Star } from "lucide-react";

// // import type { Store, StoreStatusAction } from "@/src/types/shop";
// // import {
// //   displayStoreLocation,
// //   formatPriceLevel,
// //   imageUrlOrNull,
// //   storeInitials,
// // } from "@/src/lib/shopFormat";
// // import StoreMediaImage from "./detail/StoreMediaImage";

// // export default function ShopsTable({
// //   stores,
// //   disabled = false,
// //   onEdit,
// //   onStatus,
// // }: {
// //   stores: Store[];
// //   disabled?: boolean;
// //   onEdit: (store: Store) => void;
// //   onStatus: (store: Store, action: StoreStatusAction) => void;
// // }) {
// //   return (
// //     <div className="overflow-x-auto">
// //       <table className="w-full min-w-[1180px] border-collapse text-left">
// //         <thead>
// //           <tr className="border-b border-gray-100 bg-gray-50/50">
// //             <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ហាង</th>
// //             <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
// //               ទីតាំង
// //             </th>
// //             {/* <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Rating</th>
// //             <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Review</th>
// //             <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Account</th> */}
// //             <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
// //               Operating
// //             </th>
// //             <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
// //               Open now
// //             </th>
// //             <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">
// //               សកម្មភាព
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>
// //           {stores.map((store) => {
// //             const fallbackLogo = imageUrlOrNull(store.logoUrl);

// //             return (
// //               <tr
// //                 key={store.uuid}
// //                 className="border-b border-gray-100 bg-white transition last:border-0 hover:bg-gray-50/60"
// //               >
// //                 <td className="px-5 py-4">
// //                   <div className="flex min-w-[250px] items-center gap-3">
// //                     <div className="flex h-12  w-12 object-cover shrink-0 overflow-hidden rounded-xl bg-emerald-50  text-[#136C34]">
// //                       {store.logoMediaUuid ? (
// //                         <StoreMediaImage
// //                           mediaUuid={store.logoMediaUuid}
// //                           alt={`${store.storeName} logo`}
// //                           className="h-full w-full object-contain p-1.5"
// //                         />
// //                       ) : fallbackLogo ? (
// //                         // eslint-disable-next-line @next/next/no-img-element
// //                         <img
// //                           src={fallbackLogo}
// //                           alt={store.storeName}
// //                           className="h-full w-full object-cover p-1.5"
// //                         />
// //                       ) : (
// //                         <div className="flex h-full w-full items-center justify-center text-base font-bold">
// //                           {storeInitials(store.storeName)}
// //                         </div>
// //                       )}
// //                     </div>

// //                     <div className="min-w-0">
// //                       <p className="truncate text-lg text-gray-800">
// //                         {store.storeName}
// //                       </p>
// //                       <p className="mt-0.5 text-sm text-gray-400">
// //                         {formatPriceLevel(store.priceLevel)} ·{" "}
// //                         {store.countryCode}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </td>

// //                 <td className="px-5 py-4">
// //                   <div className="flex max-w-[280px] items-start gap-2 text-base text-gray-500">
// //                     <MapPin
// //                       size={17}
// //                       className="mt-0.5 shrink-0 text-[#136C34]"
// //                     />
// //                     <span className="line-clamp-2">
// //                       {displayStoreLocation(store) || "—"}
// //                     </span>
// //                   </div>
// //                 </td>

// //                 {/* <td className="px-5 py-4">
// //                   <span className="inline-flex items-center gap-1.5 text-base text-gray-700">
// //                     <Star size={16} className="fill-amber-400 text-amber-400" />
// //                     {Number(store.averageRating || 0).toFixed(1)}
// //                     <span className="text-gray-400">({store.totalReviews ?? 0})</span>
// //                   </span>
// //                 </td>

// //                 <td className="px-5 py-4">
// //                   <button type="button" disabled={disabled} onClick={() => onStatus(store, "REVIEW")}>
// //                     <StatusBadge value={store.reviewStatus} kind="review" />
// //                   </button>
// //                 </td>

// //                 <td className="px-5 py-4">
// //                   <button type="button" disabled={disabled} onClick={() => onStatus(store, "ACCOUNT")}>
// //                     <StatusBadge value={store.accountStatus} kind="account" />
// //                   </button>
// //                 </td> */}

// //                 <td className="px-5 py-4">
// //                   <button
// //                     type="button"
// //                     disabled={disabled}
// //                     onClick={() => onStatus(store, "OPERATING")}
// //                   >
// //                     <StatusBadge
// //                       value={store.operatingStatus}
// //                       kind="operating"
// //                     />
// //                   </button>
// //                 </td>

// //                 <td className="px-5 py-4">
// //                   <span
// //                     className={`inline-flex rounded-full px-3 py-1 text-base ${
// //                       store.isOpenNow === true
// //                         ? "bg-emerald-50 text-emerald-700"
// //                         : store.isOpenNow === false
// //                           ? "bg-gray-100 text-gray-500"
// //                           : "bg-slate-50 text-slate-400"
// //                     }`}
// //                   >
// //                     {store.isOpenNow === true
// //                       ? "OPEN"
// //                       : store.isOpenNow === false
// //                         ? "CLOSED"
// //                         : "—"}
// //                   </span>
// //                 </td>

// //                 <td className="px-5 py-4">
// //                   <div className="flex items-center justify-end gap-1">
// //                     <Link
// //                       href={`/shops/${store.uuid}`}
// //                       className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
// //                       title="មើលលម្អិត"
// //                     >
// //                       <Eye size={18} />
// //                     </Link>

// //                     <button
// //                       type="button"
// //                       disabled={disabled}
// //                       onClick={() => onEdit(store)}
// //                       className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
// //                       title="កែប្រែ"
// //                     >
// //                       <Pencil size={18} />
// //                     </button>

// //                     <button
// //                       type="button"
// //                       disabled={disabled}
// //                       onClick={() => onStatus(store, "ACCOUNT")}
// //                       className="rounded-lg p-2 text-violet-500 transition hover:bg-violet-50 disabled:opacity-40"
// //                       title="ស្ថានភាព"
// //                     >
// //                       <Settings2 size={18} />
// //                     </button>
// //                   </div>
// //                 </td>
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }

// // export function StatusBadge({
// //   value,
// //   kind,
// // }: {
// //   value: string;
// //   kind: "review" | "account" | "operating";
// // }) {
// //   const normalized = String(value || "UNKNOWN").toUpperCase();

// //   const className = ["APPROVED", "ACTIVE", "OPEN"].includes(normalized)
// //     ? "bg-emerald-50 text-emerald-700"
// //     : ["PENDING", "TEMPORARILY_CLOSED"].includes(normalized)
// //       ? "bg-amber-50 text-amber-700"
// //       : ["REJECTED", "SUSPENDED"].includes(normalized)
// //         ? "bg-red-50 text-red-700"
// //         : kind === "operating"
// //           ? "bg-slate-100 text-slate-600"
// //           : "bg-gray-100 text-gray-600";

// //   return (
// //     <span
// //       className={`inline-flex rounded-full px-3 py-1 text-base ${className}`}
// //     >
// //       {normalized}
// //     </span>
// //   );
// // }
// import Link from "next/link";

// import {
//   Eye,
//   MapPin,
//   Pencil,
//   Settings2,
// } from "lucide-react";

// import type {
//   Store,
//   StoreStatusAction,
// } from "@/src/types/shop";

// import {
//   displayStoreLocation,
//   formatPriceLevel,
//   imageUrlOrNull,
//   storeInitials,
// } from "@/src/lib/shopFormat";

// import StoreMediaImage from "./detail/StoreMediaImage";

// export default function ShopsTable({
//   stores,
//   disabled = false,
//   onEdit,
//   onStatus,
// }: {
//   stores: Store[];
//   disabled?: boolean;
//   onEdit: (store: Store) => void;
//   onStatus: (
//     store: Store,
//     action: StoreStatusAction,
//   ) => void;
// }) {
//   return (
//     <div
//       className="
//         w-full
//         min-w-0
//         max-w-full
//         overflow-x-auto
//       "
//     >
//       <table
//         className="
//           w-full
//           min-w-[1100px]
//           border-collapse
//           text-left
//         "
//       >
//         {/* ================= HEADER ================= */}
//         <thead>
//           <tr
//             className="
//               border-b
//               border-gray-100
//               bg-gray-50/70
//             "
//           >
//             <th
//               className="
//                 px-6
//                 py-4
//                 text-xl
//                 font-semibold
//                 text-primary-800
//               "
//             >
//               ហាង
//             </th>

//             <th
//               className="
//                 px-6
//                 py-4
//                 text-xl
//                 font-semibold
//                 text-primary-800
//               "
//             >
//               ទីតាំង
//             </th>

//             <th
//               className="
//                 px-6
//                 py-4
//                 text-xl
//                 font-semibold
//                 text-primary-800
//               "
//             >
//               ស្ថានភាពហាង
//             </th>

//             <th
//               className="
//                 px-6
//                 py-4
//                 text-xl
//                 font-semibold
//                 text-primary-800
//               "
//             >
//               បើកឥឡូវ
//             </th>

//             <th
//               className="
//                 px-6
//                 py-4
//                 text-right
//                 text-xl
//                 font-semibold
//                 text-primary-800
//               "
//             >
//               សកម្មភាព
//             </th>
//           </tr>
//         </thead>

//         {/* ================= BODY ================= */}
//         <tbody>
//           {stores.map((store) => {
//             const fallbackLogo =
//               imageUrlOrNull(
//                 store.logoUrl,
//               );

//             const priceLevel =
//               formatPriceLevel(
//                 store.priceLevel,
//               );

//             const detailHref =
//               `/shops/${store.uuid}`;

//             return (
//               <tr
//                 key={store.uuid}
//                 className="
//                   border-b
//                   border-gray-100
//                   bg-white
//                   transition-colors
//                   duration-150
//                   last:border-b-0
//                   hover:bg-gray-50/70
//                 "
//               >
//                 {/* ================= STORE PROFILE ================= */}
//                 <td className="px-6 py-2">
//                   <Link
//                     href={detailHref}
//                     title={`មើលព័ត៌មាន ${store.storeName}`}
//                     className="
//                       group
//                       flex
//                       min-w-[280px]
//                       items-center
//                       gap-4
//                       rounded-2xl
//                       outline-none
//                       transition
//                       focus-visible:ring-4
//                       focus-visible:ring-primary-100
//                     "
//                   >
//                     {/* Logo */}
//                     <div
//                       className="
//                         flex
//                         h-14
//                         w-14
//                         shrink-0
//                         items-center
//                         justify-center
//                         overflow-hidden
//                         rounded-xl
//                         border
//                         border-primary-100
//                         bg-primary-50
//                         text-primary-800
//                         transition
//                         group-hover:border-primary-200
//                         group-hover:bg-primary-100
//                       "
//                     >
//                       {store.logoMediaUuid ? (
//                         <StoreMediaImage
//                           mediaUuid={
//                             store.logoMediaUuid
//                           }
//                           alt={`${store.storeName} logo`}
//                           className="
//                             h-full
//                             w-full
//                             object-cover
//                           "
//                         />
//                       ) : fallbackLogo ? (
//                         // eslint-disable-next-line @next/next/no-img-element
//                         <img
//                           src={fallbackLogo}
//                           alt={store.storeName}
//                           className="
//                             h-full
//                             w-full
//                             object-cover
//                           "
//                         />
//                       ) : (
//                         <span
//                           className="
//                             text-lg
//                             font-semibold
//                           "
//                         >
//                           {storeInitials(
//                             store.storeName,
//                           )}
//                         </span>
//                       )}
//                     </div>

//                     {/* Store information */}
//                     <div className="min-w-0">
//                       <p
//                         className="
//                           max-w-[260px]
//                           truncate
//                           text-lg
//                           font-medium
//                           text-gray-800
//                           transition
//                           group-hover:text-primary-800
//                         "
//                       >
//                         {store.storeName}
//                       </p>

//                       <div
//                         className="
//                           mt-1
//                           flex
//                           items-center
//                           gap-2
//                           text-lg
//                           text-gray-400
//                         "
//                       >
//                         {priceLevel && (
//                           <>
//                             <span>
//                               {priceLevel}
//                             </span>

//                             <span
//                               className="
//                                 h-1
//                                 w-1
//                                 rounded-full
//                                 bg-gray-300
//                               "
//                             />
//                           </>
//                         )}

//                         <span>
//                           {store.countryCode ||
//                             "—"}
//                         </span>
//                       </div>

//                       <p
//                         className="
//                           mt-1
//                           text-base
//                           font-medium
//                           text-primary-700
//                           opacity-0
//                           transition
//                           group-hover:opacity-100
//                           group-focus-visible:opacity-100
//                         "
//                       >
//                         មើលព័ត៌មានលម្អិត
//                       </p>
//                     </div>
//                   </Link>
//                 </td>

//                 {/* ================= LOCATION ================= */}
//                 <td className="px-6 py-2">
//                   <div
//                     className="
//                       flex
//                       max-w-[320px]
//                       items-start
//                       gap-2.5
//                     "
//                   >
//                     <MapPin
//                       size={20}
//                       strokeWidth={2}
//                       className="
//                         mt-1
//                         shrink-0
//                         text-primary-700
//                       "
//                     />

//                     <span
//                       className="
//                         line-clamp-2
//                         text-lg
//                         leading-7
//                         text-gray-500
//                       "
//                     >
//                       {displayStoreLocation(
//                         store,
//                       ) || "—"}
//                     </span>
//                   </div>
//                 </td>

//                 {/* ================= OPERATING STATUS ================= */}
//                 <td className="px-6 py-2">
//                   <button
//                     type="button"
//                     disabled={disabled}
//                     onClick={() =>
//                       onStatus(
//                         store,
//                         "OPERATING",
//                       )
//                     }
//                     className="
//                       rounded-full
//                       transition
//                       focus:outline-none
//                       focus:ring-4
//                       focus:ring-primary-100
//                       disabled:cursor-not-allowed
//                       disabled:opacity-50
//                     "
//                   >
//                     <StatusBadge
//                       value={
//                         store.operatingStatus
//                       }
//                       kind="operating"
//                     />
//                   </button>
//                 </td>

//                 {/* ================= OPEN NOW ================= */}
//                 <td className="px-6 py-2">
//                   <OpenStatusBadge
//                     isOpen={
//                       store.isOpenNow
//                     }
//                   />
//                 </td>

//                 {/* ================= ACTIONS ================= */}
//                 <td className="px-6 py-2">
//                   <div
//                     className="
//                       flex
//                       items-center
//                       justify-end
//                       gap-2
//                     "
//                   >
//                     {/* Detail */}
//                     <Link
//                       href={detailHref}
//                       className="
//                         flex
//                         h-10
//                         w-10
//                         items-center
//                         justify-center
//                         rounded-xl
//                         text-primary-700
//                         transition
//                         hover:bg-primary-50
//                         hover:text-primary-800
//                         focus:outline-none
//                         focus:ring-4
//                         focus:ring-primary-100
//                       "
//                       title="មើលលម្អិត"
//                     >
//                       <Eye size={20} />
//                     </Link>

//                     {/* Edit */}
//                     <button
//                       type="button"
//                       disabled={disabled}
//                       onClick={() =>
//                         onEdit(store)
//                       }
//                       className="
//                         flex
//                         h-10
//                         w-10
//                         items-center
//                         justify-center
//                         rounded-xl
//                         text-blue-500
//                         transition
//                         hover:bg-blue-50
//                         focus:outline-none
//                         focus:ring-4
//                         focus:ring-blue-100
//                         disabled:cursor-not-allowed
//                         disabled:opacity-40
//                       "
//                       title="កែប្រែ"
//                     >
//                       <Pencil size={20} />
//                     </button>

//                     {/* Status */}
//                     <button
//                       type="button"
//                       disabled={disabled}
//                       onClick={() =>
//                         onStatus(
//                           store,
//                           "ACCOUNT",
//                         )
//                       }
//                       className="
//                         flex
//                         h-10
//                         w-10
//                         items-center
//                         justify-center
//                         rounded-xl
//                         text-secondary-500
//                         transition
//                         hover:bg-secondary-50
//                         hover:text-secondary-600
//                         focus:outline-none
//                         focus:ring-4
//                         focus:ring-secondary-100
//                         disabled:cursor-not-allowed
//                         disabled:opacity-40
//                       "
//                       title="គ្រប់គ្រងស្ថានភាព"
//                     >
//                       <Settings2 size={20} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}

//           {/* ================= EMPTY STATE ================= */}
//           {stores.length === 0 && (
//             <tr>
//               <td
//                 colSpan={5}
//                 className="
//                   px-6
//                   py-16
//                   text-center
//                 "
//               >
//                 <p
//                   className="
//                     text-lg
//                     font-medium
//                     text-gray-500
//                   "
//                 >
//                   មិនមានទិន្នន័យហាង
//                 </p>

//                 <p
//                   className="
//                     mt-1
//                     text-lg
//                     text-gray-400
//                   "
//                 >
//                   ទិន្នន័យហាងនឹងបង្ហាញនៅទីនេះ
//                 </p>
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// /* =========================================================
//    STATUS BADGE
// ========================================================= */

// export function StatusBadge({
//   value,
//   kind,
// }: {
//   value: string;
//   kind:
//     | "review"
//     | "account"
//     | "operating";
// }) {
//   const normalized = String(
//     value || "UNKNOWN",
//   ).toUpperCase();

//   const positive = [
//     "APPROVED",
//     "ACTIVE",
//     "OPEN",
//   ].includes(normalized);

//   const warning = [
//     "PENDING",
//     "TEMPORARILY_CLOSED",
//   ].includes(normalized);

//   const danger = [
//     "REJECTED",
//     "SUSPENDED",
//     "CLOSED",
//   ].includes(normalized);

//   const className = positive
//     ? "bg-primary-50 text-primary-700 ring-primary-100"
//     : warning
//       ? "bg-secondary-50 text-secondary-600 ring-secondary-100"
//       : danger
//         ? "bg-red-50 text-red-600 ring-red-100"
//         : kind === "operating"
//           ? "bg-slate-100 text-slate-600 ring-slate-200"
//           : "bg-gray-100 text-gray-600 ring-gray-200";

//   const dotClassName = positive
//     ? "bg-primary-600"
//     : warning
//       ? "bg-secondary-500"
//       : danger
//         ? "bg-red-500"
//         : "bg-gray-400";

//   return (
//     <span
//       className={`
//         inline-flex
//         items-center
//         gap-2
//         whitespace-nowrap
//         rounded-full
//         px-3.5
//         py-1.5
//         text-lg
//         font-medium
//         ring-1
//         ring-inset
//         ${className}
//       `}
//     >
//       <span
//         className={`
//           h-2
//           w-2
//           shrink-0
//           rounded-full
//           ${dotClassName}
//         `}
//       />

//       {normalized}
//     </span>
//   );
// }

// /* =========================================================
//    OPEN STATUS BADGE
// ========================================================= */

// function OpenStatusBadge({
//   isOpen,
// }: {
//   isOpen:
//     | boolean
//     | null
//     | undefined;
// }) {
//   if (isOpen === true) {
//     return (
//       <span
//         className="
//           inline-flex
//           items-center
//           gap-2
//           rounded-full
//           bg-primary-50
//           px-3.5
//           py-1.5
//           text-lg
//           font-medium
//           text-primary-700
//           ring-1
//           ring-inset
//           ring-primary-100
//         "
//       >
//         <span
//           className="
//             h-2
//             w-2
//             rounded-full
//             bg-primary-600
//           "
//         />

//         OPEN
//       </span>
//     );
//   }

//   if (isOpen === false) {
//     return (
//       <span
//         className="
//           inline-flex
//           items-center
//           gap-2
//           rounded-full
//           bg-red-50
//           px-3.5
//           py-1.5
//           text-lg
//           font-medium
//           text-red-600
//           ring-1
//           ring-inset
//           ring-red-100
//         "
//       >
//         <span
//           className="
//             h-2
//             w-2
//             rounded-full
//             bg-red-500
//           "
//         />

//         CLOSED
//       </span>
//     );
//   }

//   return (
//     <span
//       className="
//         inline-flex
//         items-center
//         gap-2
//         rounded-full
//         bg-gray-100
//         px-3.5
//         py-1.5
//         text-lg
//         font-medium
//         text-gray-500
//       "
//     >
//       <span
//         className="
//           h-2
//           w-2
//           rounded-full
//           bg-gray-400
//         "
//       />

//       —
//     </span>
//   );
// }

import Link from "next/link";

import { Eye, MapPin, Pencil, Settings2 } from "lucide-react";

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
                text-xl
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
                text-right
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

                      <div
                        className="
                       
                          flex
                          items-center
                          gap-2
                          text-lg
                          text-gray-400
                        "
                      >
                        {priceLevel && (
                          <>
                            <span>{priceLevel}</span>

                            <span
                              className="
                                h-1
                                w-1
                                rounded-full
                                bg-gray-300
                              "
                            />
                          </>
                        )}

                        <span>{store.countryCode || "—"}</span>
                      </div>

                      {/* <p
                        className="
                     
                          text-base
                          font-medium
                          text-primary-700
                          opacity-0
                          transition
                          group-hover:opacity-100
                          group-focus-visible:opacity-100
                        "
                      >
                        មើលព័ត៌មានលម្អិត
                      </p> */}
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
                      justify-end
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

      {normalized}
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
        OPEN
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
        CLOSED
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
