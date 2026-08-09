import Link from "next/link";
import { Eye, MapPin, Pencil, Settings2, Star } from "lucide-react";
import type { Store, StoreStatusAction } from "@/src/types/shop";
import { displayStoreLocation, formatPriceLevel, imageUrlOrNull, storeInitials } from "@/src/lib/shopFormat";

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
          <tr className="border-b border-gray-100 bg-gray-50/70 text-[12px] font-black uppercase tracking-wide text-gray-500">
            <th className="px-5 py-4">Store</th><th className="px-5 py-4">Location</th>
            {/* <th className="px-5 py-4">Rating</th><th className="px-5 py-4">Review</th> */}
            <th className="px-5 py-4">Account</th><th className="px-5 py-4">Operating</th>
            <th className="px-5 py-4">Open now</th><th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stores.map((store) => {
            const logo = imageUrlOrNull(store.logoUrl);
            return (
              <tr key={store.uuid} className="bg-white text-sm text-gray-600 transition hover:bg-emerald-50/30">
                <td className="px-5 py-4">
                  <div className="flex min-w-[250px] items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-emerald-100">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={store.storeName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-black text-[#137A3D]">{storeInitials(store.storeName)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-gray-900">{store.storeName}</p>
                      {/* <p className="mt-1 text-xs text-gray-400">{formatPriceLevel(store.priceLevel)} · {store.countryCode}</p> */}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex max-w-[270px] items-start gap-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span className="line-clamp-2">{displayStoreLocation(store) || "—"}</span>
                  </div>
                </td>
                {/* <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 font-bold text-gray-700">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    {Number(store.averageRating || 0).toFixed(1)}
                    <span className="font-medium text-gray-400">({store.totalReviews ?? 0})</span>
                  </span>
                </td> */}
                <td className="px-5 py-4"><button disabled={disabled} onClick={() => onStatus(store, "REVIEW")}><StatusBadge value={store.reviewStatus} kind="review" /></button></td>
                <td className="px-5 py-4"><button disabled={disabled} onClick={() => onStatus(store, "ACCOUNT")}><StatusBadge value={store.accountStatus} kind="account" /></button></td>
                <td className="px-5 py-4"><button disabled={disabled} onClick={() => onStatus(store, "OPERATING")}><StatusBadge value={store.operatingStatus} kind="operating" /></button></td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${
                    store.isOpenNow === true ? "bg-emerald-50 text-emerald-700" :
                    store.isOpenNow === false ? "bg-gray-100 text-gray-600" : "bg-slate-50 text-slate-400"
                  }`}>
                    {store.isOpenNow === true ? "OPEN" : store.isOpenNow === false ? "CLOSED" : "—"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/shops/${store.uuid}`} className="flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 hover:bg-emerald-50"><Eye size={18} /></Link>
                    <button disabled={disabled} onClick={() => onEdit(store)} className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 disabled:opacity-40"><Pencil size={17} /></button>
                    <button disabled={disabled} onClick={() => onStatus(store, "ACCOUNT")} className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-500 hover:bg-violet-50 disabled:opacity-40"><Settings2 size={17} /></button>
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

export function StatusBadge({ value, kind }: { value: string; kind: "review" | "account" | "operating" }) {
  const v = String(value || "UNKNOWN").toUpperCase();
  const cls =
    ["APPROVED", "ACTIVE", "OPEN"].includes(v) ? "bg-emerald-50 text-emerald-700" :
    ["PENDING", "TEMPORARILY_CLOSED"].includes(v) ? "bg-amber-50 text-amber-700" :
    ["REJECTED", "SUSPENDED"].includes(v) ? "bg-red-50 text-red-700" :
    kind === "operating" ? "bg-slate-100 text-slate-600" : "bg-gray-100 text-gray-600";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${cls}`}>{v}</span>;
}
