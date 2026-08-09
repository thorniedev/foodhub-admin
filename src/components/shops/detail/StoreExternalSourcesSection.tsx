"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  useGetShopByUuidQuery,
  useGetStoreHoursQuery,
  useUpdateShopMutation,
} from "@/src/app/store/shop/shopApi";

import type {
  StoreStatusAction,
  UpdateStorePayload,
} from "@/src/types/shop";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import StoreProfileHeader from "./StoreProfileHeader";
import StoreOverviewSection from "./StoreOverviewSection";
import StoreContactLocationSection from "./StoreContactLocationSection";
import StoreRatingsSection from "./StoreRatingsSection";
import StoreMediaSection from "./StoreMediaSection";
import StoreSocialLinksSection from "./StoreSocialLinksSection";
import StoreHoursSection from "./StoreHoursSection";
import StoreSystemInfoSection from "./StoreSystemInfoSection";
import ShopEditModal from "../ShopEditModal";
import ShopStatusModal from "../ShopStatusModal";
import StoreHoursModal from "../StoreHoursModal";

export default function ShopDetailManager({
  storeUuid,
}: {
  storeUuid: string;
}) {
  /* =========================================
     STORE DETAIL
  ========================================== */
  const {
    data: store,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetShopByUuidQuery(
    storeUuid,
  );

  /* =========================================
     STORE HOURS
  ========================================== */
  const {
    data: hours = [],
    isLoading: hoursLoading,
    refetch: refetchHours,
  } = useGetStoreHoursQuery(
    storeUuid,
  );

  /* =========================================
     UPDATE STORE
  ========================================== */
  const [
    updateStore,
    {
      isLoading: updating,
    },
  ] = useUpdateShopMutation();

  /* =========================================
     MODALS
  ========================================== */
  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] = useState(false);

  const [
    hoursOpen,
    setHoursOpen,
  ] = useState(false);

  const [
    statusAction,
    setStatusAction,
  ] =
    useState<StoreStatusAction>(
      "REVIEW",
    );

  /* =========================================
     MESSAGE
  ========================================== */
  const [
    notice,
    setNotice,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* =========================================
     LOADING
  ========================================== */
  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2
          size={34}
          className="animate-spin text-[#137A3D]"
        />
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================== */
  if (
    error ||
    !store
  ) {
    return (
      <div className="p-6">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-gray-100 bg-white px-6 text-center shadow-sm">
          <AlertTriangle
            size={42}
            className="text-red-400"
          />

          <h1 className="mt-4 text-xl font-black text-gray-900">
            មិនអាចទាញយក Store detail
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {getShopApiErrorMessage(
              error,
            )}
          </p>

          <button
            type="button"
            onClick={() =>
              void refetch()
            }
            className="mt-5 rounded-xl bg-[#137A3D] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#0f6833]"
          >
            សាកល្បងម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     EDIT STORE
  ========================================== */
  const handleEdit =
    async (
      values: UpdateStorePayload,
    ) => {
      try {
        await updateStore({
          storeUuid,
          body: values,
        }).unwrap();

        setEditOpen(false);

        setNotice({
          type: "success",
          text: "បានកែប្រែ Store ដោយជោគជ័យ។",
        });

        await refetch();
      } catch (updateError) {
        setNotice({
          type: "error",
          text:
            getShopApiErrorMessage(
              updateError,
            ),
        });
      }
    };

  /* =========================================
     OPEN STATUS
  ========================================== */
  const openStatus = (
    action: StoreStatusAction,
  ) => {
    setStatusAction(action);

    setStatusOpen(true);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      {/* =====================================
          STORE HEADER
      ====================================== */}
      <StoreProfileHeader
        store={store}
        busy={
          updating ||
          isFetching
        }
        onEdit={() =>
          setEditOpen(true)
        }
        onStatus={
          openStatus
        }
        onHours={() =>
          setHoursOpen(true)
        }
      />

      {/* =====================================
          MESSAGE
      ====================================== */}
      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.type ===
            "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* =====================================
          STORE INFORMATION
      ====================================== */}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        {/* Overview */}
        <StoreOverviewSection
          store={store}
        />

        {/* Contact & Location */}
        <StoreContactLocationSection
          store={store}
        />

        {/* Ratings */}
        <StoreRatingsSection
          store={store}
        />

        {/* Store images */}
        <StoreMediaSection
          store={store}
        />

        {/* Social links */}
        <StoreSocialLinksSection
          links={
            store.socialLinks ??
            []
          }
        />

        {/* Opening hours */}
        <StoreHoursSection
          hours={hours}
          loading={
            hoursLoading
          }
        />

        {/* System information */}
        <StoreSystemInfoSection
          store={store}
        />
      </div>

      {/* =====================================
          EDIT MODAL
      ====================================== */}
      <ShopEditModal
        store={
          editOpen
            ? store
            : null
        }
        saving={
          updating
        }
        onClose={() => {
          if (!updating) {
            setEditOpen(false);
          }
        }}
        onSubmit={
          handleEdit
        }
      />

      {/* =====================================
          STATUS MODAL
      ====================================== */}
      <ShopStatusModal
        store={
          statusOpen
            ? store
            : null
        }
        initialAction={
          statusAction
        }
        onClose={() =>
          setStatusOpen(false)
        }
        onChanged={
          async () => {
            await refetch();
          }
        }
      />

      {/* =====================================
          HOURS MODAL
      ====================================== */}
      <StoreHoursModal
        storeUuid={
          storeUuid
        }
        open={
          hoursOpen
        }
        onClose={() =>
          setHoursOpen(false)
        }
        onChanged={
          async () => {
            await Promise.all([
              refetch(),
              refetchHours(),
            ]);
          }
        }
      />
    </div>
  );
}