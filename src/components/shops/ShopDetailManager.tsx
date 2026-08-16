"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import {
  useGetShopByUuidQuery,
  useGetStoreHoursQuery,
  useUpdateShopMutation,
} from "@/src/app/store/shop/shopApi";

import type { StoreStatusAction, UpdateStorePayload } from "@/src/types/shop";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

import ShopEditModal from "./ShopEditModal";
import ShopStatusModal from "./ShopStatusModal";
import StoreHoursModal from "./StoreHoursModal";

import StoreContactLocationSection from "./detail/StoreContactLocationSection";
import StoreHoursSection from "./detail/StoreHoursSection";
import StoreMediaSection from "./detail/StoreMediaSection";
import StoreMenuItemsSection from "./detail/StoreMenuItemsSection";
import StoreOverviewSection from "./detail/StoreOverviewSection";
import StoreProfileHeader from "./detail/StoreProfileHeader";
import StoreRatingsSection from "./detail/StoreRatingsSection";
import StoreSocialLinksSection from "./detail/StoreSocialLinksSection";
import StoreSystemInfoSection from "./detail/StoreSystemInfoSection";
import MenuItemDetailModal from "../menu-management/MenuItemDetailModal";

interface ShopDetailManagerProps {
  storeUuid?: string;
}

function isValidUuid(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  const cleanValue = value.trim();

  /*
   * Supports standard UUID versions.
   */
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(cleanValue);
}

/* =========================================================
   SHOP DETAIL MANAGER
========================================================= */
export default function ShopDetailManager({
  storeUuid,
}: ShopDetailManagerProps) {
  const router = useRouter();

  /*
   * Get the UUID directly from the URL too.
   *
   * This supports:
   *
   * /shops/[uuid]
   *
   * AND:
   *
   * /shops/[id]
   */
  const params = useParams<{
    uuid?: string;
    id?: string;
  }>();

  const fromProp = typeof storeUuid === "string" ? storeUuid.trim() : "";
  const fromUuidParam =
    typeof params?.uuid === "string" ? params.uuid.trim() : "";
  const fromIdParam = typeof params?.id === "string" ? params.id.trim() : "";

  const resolvedStoreUuid = isValidUuid(fromProp)
    ? fromProp
    : isValidUuid(fromUuidParam)
      ? fromUuidParam
      : isValidUuid(fromIdParam)
        ? fromIdParam
        : "";

  const hasValidStoreUuid = Boolean(resolvedStoreUuid);

  /* =======================================================
     GET STORE DETAIL

     IMPORTANT:
     When there is no UUID, skip=true.

     Therefore it will NEVER request:
     /api/admin/stores/undefined
  ======================================================= */
  const {
    data: store,
    error: storeError,
    isLoading: storeLoading,
    isFetching: storeFetching,
    refetch: refetchStore,
  } = useGetShopByUuidQuery(resolvedStoreUuid, {
    skip: !hasValidStoreUuid,
  });

  /* =======================================================
     GET STORE HOURS
  ======================================================= */
  const {
    data: hours = [],
    error: hoursError,
    isLoading: hoursLoading,
    isFetching: hoursFetching,
    refetch: refetchHours,
  } = useGetStoreHoursQuery(resolvedStoreUuid, {
    skip: !hasValidStoreUuid,
  });

  const [updateStore, { isLoading: updatingStore }] = useUpdateShopMutation();

  const [editOpen, setEditOpen] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);

  const [hoursOpen, setHoursOpen] = useState(false);
  const [selectedMenuUuid, setSelectedMenuUuid] = useState<string | null>(null);

  const [statusAction, setStatusAction] = useState<StoreStatusAction>("REVIEW");

  const [notice, setNotice] = useState<{
    type: "success" | "error";

    text: string;
  } | null>(null);

  if (!hasValidStoreUuid) {
    return (
      <div className="p-4 sm:p-6 lg:p-7">
        <div className="flex min-h-[500px] items-center justify-center rounded-[30px] border border-red-100 bg-white px-6 shadow-sm">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-900">
              Invalid Store UUID
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              The Store UUID was not received correctly from the URL.
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-left font-mono text-xs text-gray-500">
              <p>prop: {String(storeUuid ?? "undefined")}</p>

              <p className="mt-1">
                params.uuid: {String(params?.uuid ?? "undefined")}
              </p>

              <p className="mt-1">
                params.id: {String(params?.id ?? "undefined")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/shops")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0f6833]"
            >
              <ArrowLeft size={17} />
              Back to Stores
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     STORE LOADING
  ======================================================= */
  if (storeLoading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#137A3D]" />

        <p className="mt-3 text-sm font-semibold text-gray-400">
          Loading Store...
        </p>
      </div>
    );
  }

  /* =======================================================
     STORE ERROR
  ======================================================= */
  if (storeError || !store) {
    return (
      <div className="p-4 sm:p-6 lg:p-7">
        <div className="flex min-h-[500px] items-center justify-center rounded-[30px] border border-red-100 bg-white px-6 shadow-sm">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-900">
              មិនអាចទាញយក Store detail
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {getShopApiErrorMessage(storeError)}
            </p>

            <p className="mt-3 break-all font-mono text-xs text-gray-400">
              UUID: {resolvedStoreUuid}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void refetchStore()}
                className="rounded-xl bg-[#137A3D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0f6833]"
              >
                សាកល្បងម្តងទៀត
              </button>

              <button
                type="button"
                onClick={() => router.push("/shops")}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft size={17} />
                Stores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     UPDATE STORE
  ======================================================= */
  const handleEdit = async (values: UpdateStorePayload) => {
    try {
      setNotice(null);

      await updateStore({
        storeUuid: resolvedStoreUuid,

        body: values,
      }).unwrap();

      setEditOpen(false);

      setNotice({
        type: "success",
        text: "បានកែប្រែ Store ដោយជោគជ័យ។",
      });

      await refetchStore();
    } catch (updateError) {
      setNotice({
        type: "error",

        text: getShopApiErrorMessage(updateError),
      });
    }
  };

  /* =======================================================
     OPEN STATUS MODAL
  ======================================================= */
  const openStatus = (action: StoreStatusAction) => {
    setStatusAction(action);

    setStatusOpen(true);
  };

  /* =======================================================
     REFRESH STORE
  ======================================================= */
  const refreshStore = async () => {
    await refetchStore();
  };

  /* =======================================================
     REFRESH STORE + HOURS
  ======================================================= */
  const refreshHours = async () => {
    await Promise.all([refetchStore(), refetchHours()]);
  };

  const busy = updatingStore || storeFetching;

  /* =======================================================
     UI
  ======================================================= */
  return (
    <div
      className="
        w-full
        min-w-0
        max-w-full
        space-y-5
        overflow-x-hidden
        p-4
        sm:p-5
        lg:p-6
      "
    >
      {/* =================================================
          STORE PROFILE HEADER
      ================================================== */}
      <div className="min-w-0 max-w-full">
        <StoreProfileHeader
          store={store}
          busy={busy}
          onEdit={() => {
            setNotice(null);
            setEditOpen(true);
          }}
          onStatus={openStatus}
          onHours={() => {
            setNotice(null);
            setHoursOpen(true);
          }}
        />
      </div>

      {/* =================================================
          MESSAGE
      ================================================== */}
      {notice && (
        <div
          className={`max-w-full rounded-2xl border px-5 py-4 text-lg leading-7 ${
            notice.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* =================================================
          HOURS ERROR
      ================================================== */}
      {hoursError && (
        <div className="max-w-full rounded-2xl border border-secondary-100 bg-secondary-50 px-5 py-4 text-lg leading-7 text-secondary-600">
          Store loaded successfully, but opening hours could not be loaded.
        </div>
      )}

      {/* =================================================
          RESPONSIVE MASONRY-LIKE CONTENT

          - One column inside normal dashboard widths.
          - Two columns only on very wide dashboard content.
          - Every section keeps its own natural height.
          - No shared grid-row height, so growing data does not
            create large blank spaces or break neighboring cards.
      ================================================== */}
      <div
        className="
          w-full
          min-w-0
          max-w-full
          columns-1
          [column-gap:1.25rem]
          2xl:columns-2
        "
      >
        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreOverviewSection store={store} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreMenuItemsSection
            storeUuid={resolvedStoreUuid}
            onViewItem={(item) => setSelectedMenuUuid(item.uuid)}
          />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreContactLocationSection store={store} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreRatingsSection store={store} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreMediaSection store={store} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreSocialLinksSection links={store.socialLinks ?? []} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreHoursSection
            hours={hours}
            loading={hoursLoading || hoursFetching}
          />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreSystemInfoSection store={store} />
        </div>
      </div>

      {/* =================================================
          EDIT STORE MODAL
      ================================================== */}
      <ShopEditModal
        store={editOpen ? store : null}
        saving={updatingStore}
        onClose={() => {
          if (!updatingStore) {
            setEditOpen(false);
          }
        }}
        onSubmit={handleEdit}
      />

      {/* =================================================
          STORE STATUS MODAL
      ================================================== */}
      <ShopStatusModal
        store={statusOpen ? store : null}
        initialAction={statusAction}
        onClose={() => {
          setStatusOpen(false);
        }}
        onChanged={refreshStore}
      />

      {/* =================================================
          OPENING HOURS MODAL
      ================================================== */}
      <StoreHoursModal
        storeUuid={resolvedStoreUuid}
        open={hoursOpen}
        onClose={() => {
          setHoursOpen(false);
        }}
        onChanged={refreshHours}
      />

      {/* =================================================
          MENU ITEM DETAIL MODAL
      ================================================== */}
      {selectedMenuUuid && (
        <MenuItemDetailModal
          uuid={selectedMenuUuid}
          onClose={() => setSelectedMenuUuid(null)}
        />
      )}
    </div>
  );
}
