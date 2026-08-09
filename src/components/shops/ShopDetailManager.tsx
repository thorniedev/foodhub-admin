"use client";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  useGetShopByUuidQuery,
  useGetStoreExternalSourcesQuery,
  useGetStoreHoursQuery,
  useUpdateShopMutation,
} from "@/src/app/store/shop/shopApi";
import type { StoreStatusAction, UpdateStorePayload } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import ShopEditModal from "./ShopEditModal";
import ShopStatusModal from "./ShopStatusModal";
import StoreHoursModal from "./StoreHoursModal";
import StoreContactLocationSection from "./detail/StoreContactLocationSection";
import StoreExternalSourcesSection from "./detail/StoreExternalSourcesSection";
import StoreHoursSection from "./detail/StoreHoursSection";
import StoreMediaSection from "./detail/StoreMediaSection";
import StoreOverviewSection from "./detail/StoreOverviewSection";
import StoreProfileHeader from "./detail/StoreProfileHeader";
import StoreRatingsSection from "./detail/StoreRatingsSection";
import StoreSocialLinksSection from "./detail/StoreSocialLinksSection";
import StoreSystemInfoSection from "./detail/StoreSystemInfoSection";

export default function ShopDetailManager({
  storeUuid,
}: {
  storeUuid: string;
}) {
  const {
    data: store,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetShopByUuidQuery(storeUuid);
  const {
    data: hours = [],
    isLoading: hoursLoading,
    refetch: refetchHours,
  } = useGetStoreHoursQuery(storeUuid);
  const {
    data: external = [],
    isLoading: externalLoading,
    refetch: refetchExternal,
  } = useGetStoreExternalSourcesQuery(storeUuid);
  const [update, { isLoading: updating }] = useUpdateShopMutation();
  const [editOpen, setEditOpen] = useState(false),
    [statusOpen, setStatusOpen] = useState(false),
    [hoursOpen, setHoursOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<StoreStatusAction>("REVIEW");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (isLoading)
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 size={34} className="animate-spin text-[#137A3D]" />
      </div>
    );
  if (error || !store)
    return (
      <div className="p-6">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border bg-white text-center">
          <AlertTriangle size={42} className="text-red-400" />
          <h1 className="mt-4 text-xl font-black">មិនអាចទាញយក Store detail</h1>
          <p className="mt-2 text-sm text-gray-500">
            {getShopApiErrorMessage(error)}
          </p>
        </div>
      </div>
    );

  const edit = async (values: UpdateStorePayload) => {
    try {
      await update({ storeUuid, body: values }).unwrap();
      setEditOpen(false);
      setNotice({ type: "success", text: "បានកែប្រែ Store ដោយជោគជ័យ។" });
      await refetch();
    } catch (e) {
      setNotice({ type: "error", text: getShopApiErrorMessage(e) });
    }
  };
  const openStatus = (a: StoreStatusAction) => {
    setStatusAction(a);
    setStatusOpen(true);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <StoreProfileHeader
        store={store}
        busy={updating || isFetching}
        onEdit={() => setEditOpen(true)}
        onStatus={openStatus}
        onHours={() => setHoursOpen(true)}
      />
      {notice && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
        >
          {notice.text}
        </div>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <StoreOverviewSection store={store} />
        <StoreContactLocationSection store={store} />
        <StoreRatingsSection store={store} />
        <StoreMediaSection store={store} />
        <StoreSocialLinksSection links={store.socialLinks ?? []} />
        <StoreHoursSection hours={hours} loading={hoursLoading} />
        <StoreExternalSourcesSection
          items={external}
          loading={externalLoading}
        />
        <StoreSystemInfoSection store={store} />
      </div>
      <ShopEditModal
        store={editOpen ? store : null}
        saving={updating}
        onClose={() => !updating && setEditOpen(false)}
        onSubmit={edit}
      />
      <ShopStatusModal
        store={statusOpen ? store : null}
        initialAction={statusAction}
        onClose={() => setStatusOpen(false)}
        onChanged={async () => {
          await refetch();
        }}
      />
      <StoreHoursModal
        storeUuid={storeUuid}
        open={hoursOpen}
        onClose={() => setHoursOpen(false)}
        onChanged={async () => {
          await Promise.all([refetch(), refetchHours(), refetchExternal()]);
        }}
      />
    </div>
  );
}
