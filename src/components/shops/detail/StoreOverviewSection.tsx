import type { ReactNode } from "react";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Store as StoreIcon,
  Tag,
  UserCheck,
} from "lucide-react";
import type { Store } from "@/src/types/shop";
import {
  formatPriceLevel,
  formatRating,
  getStoreAccountStatus,
  getStoreLiveStatus,
  getStoreReviewStatus,
} from "@/src/lib/shopFormat";

export function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
            {icon}
          </div>

          <p className="text-2xl font-medium text-primary-800">{title}</p>
        </div>

        {action && <div>{action}</div>}
      </div>

      {children}
    </section>
  );
}

export function Item({
  label,
  value,
  customValue,
  icon,
}: {
  label: string;
  value?: string;
  customValue?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4 transition hover:border-gray-200 hover:bg-gray-50">
      <p className="text-lg font-normal text-gray-500">{label}</p>

      {customValue ? (
        <div className="mt-2">{customValue}</div>
      ) : (
        <p className="mt-1 flex items-center gap-2 break-words text-lg font-medium text-gray-800">
          {icon && <span className="text-primary-700">{icon}</span>}
          {value || "—"}
        </p>
      )}
    </div>
  );
}

export default function StoreOverviewSection({ store }: { store: Store }) {
  const reviewStatus = getStoreReviewStatus(store.reviewStatus);
  const liveStatus = getStoreLiveStatus(store);
  const accountStatus = getStoreAccountStatus(store.accountStatus);

  return (
    <Section title="ព័ត៌មានទូទៅ" icon={<StoreIcon size={22} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Item
          label="ឈ្មោះហាង"
          value={store.storeName}
          icon={<Tag size={19} />}
        />

        <Item
          label="ប្រទេស"
          value={store.countryCode || "KH"}
          icon={<Globe size={19} />}
        />

        <Item
          label="កម្រិតតម្លៃ"
          value={formatPriceLevel(store.priceLevel)}
          icon={<DollarSign size={19} />}
        />

        <Item
          label="ពិន្ទុអនាម័យ"
          value={formatRating(store.hygieneRating)}
          icon={<ShieldCheck size={19} />}
        />

        <Item
          label="តំបន់ម៉ោង"
          value={store.timezone || "Asia/Phnom_Penh"}
          icon={<Clock size={19} />}
        />

        {/* 1. Review Status */}
        <Item
          label="ស្ថានភាពពិនិត្យ"
          customValue={
            <div className="flex flex-col gap-1.5">
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-lg font-normal border ${
                reviewStatus.isPositive
                  ? "bg-emerald-50 text-[#137A3D] border-emerald-200"
                  : reviewStatus.isDanger
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {reviewStatus.isPositive ? (
                  <CheckCircle size={18} className="text-emerald-600" />
                ) : (
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${reviewStatus.isDanger ? "bg-red-500" : "bg-amber-500"}`} />
                )}
                <span>{reviewStatus.label}</span>
              </span>
              <p className="text-lg font-normal text-gray-500">{reviewStatus.note}</p>
            </div>
          }
        />

        {/* 2. Operating Status */}
        <Item
          label="ស្ថានភាពដំណើរការ"
          customValue={
            <div className="flex flex-col gap-1.5">
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-lg font-normal border ${
                liveStatus.isPositive
                  ? "bg-emerald-50 text-[#137A3D] border-emerald-200"
                  : liveStatus.isDanger
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {liveStatus.isPositive ? (
                  <CheckCircle size={18} className="text-emerald-600" />
                ) : (
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${liveStatus.isDanger ? "bg-red-500" : "bg-amber-500"}`} />
                )}
                <span>{liveStatus.label}</span>
              </span>
              <p className="text-lg font-normal text-gray-500">{liveStatus.note}</p>
            </div>
          }
        />

        {/* 3. Account Status */}
        <Item
          label="ស្ថានភាពគណនី"
          customValue={
            <div className="flex flex-col gap-1.5">
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-lg font-normal border ${
                accountStatus.isPositive
                  ? "bg-emerald-50 text-[#137A3D] border-emerald-200"
                  : accountStatus.isDanger
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-gray-100 text-gray-700 border-gray-200"
              }`}>
                {accountStatus.isPositive ? (
                  <CheckCircle size={18} className="text-emerald-600" />
                ) : (
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accountStatus.isDanger ? "bg-red-500" : "bg-gray-400"}`} />
                )}
                <span>{accountStatus.label}</span>
              </span>
              <p className="text-lg font-normal text-gray-500">{accountStatus.note}</p>
            </div>
          }
        />

        {/* Description Full Width */}
        <div className="col-span-full rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4 transition hover:border-gray-200 hover:bg-gray-50">
          <p className="text-lg font-normal text-gray-500">ការពិពណ៌នាអំពីហាង</p>
          <p className="mt-2 whitespace-pre-wrap text-lg font-normal leading-relaxed text-gray-800">
            {store.description || "មិនមានការពិពណ៌នាឡើយ"}
          </p>
        </div>
      </div>
    </Section>
  );
}
