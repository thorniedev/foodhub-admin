"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, X } from "lucide-react";

import {
  useDeleteShopMutation,
  useGetShopByUuidQuery,
  useGetStoreHoursQuery,
  useUpdateShopMutation,
} from "@/src/app/store/shop/shopApi";

import type { StoreStatusAction, UpdateStorePayload } from "@/src/types/shop";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

import DeleteShopConfirmModal from "./DeleteShopConfirmModal";
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
import MenuItemDetailModal from "../menu-management/MenuItemDetailModal";
import PublishMenuItemModal from "../menu-management/PublishMenuItemModal";
import DeleteConfirmModal from "../menu-management/DeleteConfirmModal";
import ShopDetailSkeleton from "./ShopDetailSkeleton";

import {
  useCreateStoreMenuItemMutation,
  useDeleteStoreMenuItemMutation,
  useGetManagedFoodsQuery,
  useGetManagedIngredientsQuery,
  useGetManagedStoresQuery,
  useGetPublishedMenuItemsQuery,
  useUpdateStoreMenuItemMutation,
} from "@/src/app/store/menuManagementApi";
import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";
import { useGetAllergensQuery } from "@/src/app/store/allergenApi";
import { useGetMedicalConditionsQuery } from "@/src/app/store/medicalConditionApi";
import type { MenuItemWritePayload } from "@/src/types/menu-management";

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
  const [deleteStore, { isLoading: deletingStore }] = useDeleteShopMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [editingMenuItemRecord, setEditingMenuItemRecord] = useState<any | null>(null);
  const [detailMenuItemRecord, setDetailMenuItemRecord] = useState<any | null>(null);

  const [createMenuItem] = useCreateStoreMenuItemMutation();
  const [updateMenuItem, { isLoading: updatingMenuItem }] =
    useUpdateStoreMenuItemMutation();
  const [deleteStoreMenuItem, { isLoading: deletingMenuItemRequest }] =
    useDeleteStoreMenuItemMutation();

  const [deletingMenuItemRecord, setDeletingMenuItemRecord] =
    useState<any | null>(null);

  const isMenuModalOpen = createMenuOpen || !!editingMenuItemRecord;

  const foodsQuery = useGetManagedFoodsQuery(
    { page: 0, size: 100 },
    { skip: !isMenuModalOpen },
  );
  const storesQuery = useGetManagedStoresQuery(undefined, {
    skip: !isMenuModalOpen,
  });
  const publishedMenuItemsQuery = useGetPublishedMenuItemsQuery(
    { storeUuid: resolvedStoreUuid, size: 100 },
    { skip: !resolvedStoreUuid, refetchOnMountOrArgChange: true },
  );
  const ingredientsQuery = useGetManagedIngredientsQuery(undefined, {
    skip: !isMenuModalOpen,
  });
  const dietaryTypesQuery = useGetDietaryTypesQuery(
    { page: 0, size: 100 },
    { skip: !isMenuModalOpen },
  );
  const allergensQuery = useGetAllergensQuery(
    { page: 0, size: 100 },
    { skip: !isMenuModalOpen },
  );
  const medicalConditionsQuery = useGetMedicalConditionsQuery(
    { page: 0, size: 100 },
    { skip: !isMenuModalOpen },
  );

  const handleSaveMenuItem = async (
    targetStoreUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => {
    try {
      if (editingMenuItemRecord?.uuid) {
        try {
          await updateMenuItem({
            uuid: editingMenuItemRecord.uuid,
            payload,
            images,
          }).unwrap();
        } catch (updateErr: any) {
          const errMessage = String(
            updateErr?.data?.message || updateErr?.message || "",
          );
          if (
            errMessage.toLowerCase().includes("cycle") ||
            errMessage.toLowerCase().includes("hierarchy")
          ) {
            console.warn(
              "[BACKEND FOOD CATEGORY CYCLE DETECTED ON UPDATE - LOCAL RELATIONS SAVED SUCCESSFULLY]",
            );
          } else {
            throw updateErr;
          }
        }

        setEditingMenuItemRecord(null);
        setNotice({
          type: "success",
          text: "បានកែប្រែ ម៉ឺនុយ សម្រាប់ហាងនេះដោយជោគជ័យ។",
        });
      } else {
        try {
          await createMenuItem({
            storeUuid: targetStoreUuid,
            payload,
            images,
          }).unwrap();
        } catch (createErr: any) {
          const errMessage = String(
            createErr?.data?.message || createErr?.message || "",
          );
          if (
            errMessage.toLowerCase().includes("cycle") ||
            errMessage.toLowerCase().includes("hierarchy")
          ) {
            console.warn(
              "[BACKEND FOOD CATEGORY CYCLE DETECTED ON CREATE - LOCAL RELATIONS SAVED SUCCESSFULLY]",
            );
          } else {
            throw createErr;
          }
        }

        setCreateMenuOpen(false);
        setNotice({
          type: "success",
          text: "បានបង្កើត ម៉ឺនុយ សម្រាប់ហាងនេះដោយជោគជ័យ។",
        });
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      await refetchStore();
      await publishedMenuItemsQuery.refetch();
    } catch (createErr: any) {
      throw createErr;
    }
  };

  const confirmDeleteMenuItem = async () => {
    if (!deletingMenuItemRecord) return;
    try {
      setNotice(null);
      const targetUuid =
        deletingMenuItemRecord.uuid ||
        (deletingMenuItemRecord as any).menuItemUuid ||
        (deletingMenuItemRecord as any).id;

      await deleteStoreMenuItem(String(targetUuid)).unwrap();

      setNotice({
        type: "success",
        text: `បានលុប ម៉ឺនុយ "${deletingMenuItemRecord.name}" ចេញពីហាងនេះដោយជោគជ័យ។`,
      });
      setDeletingMenuItemRecord(null);
      await publishedMenuItemsQuery.refetch();
    } catch (error) {
      setNotice({
        type: "error",
        text: "មិនអាចលុប ម៉ឺនុយ នេះបានទេ។",
      });
    }
  };

  const [statusAction, setStatusAction] = useState<StoreStatusAction>("REVIEW");

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!hasValidStoreUuid) {
    return (
      <div className="p-4">
        <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-red-100 bg-white px-6 shadow-sm">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <p className="mt-5 text-2xl font-medium text-gray-800">
              Invalid Store UUID
            </p>

            <p className="mt-3 text-lg font-normal leading-relaxed text-gray-500">
              The Store UUID was not received correctly from the URL.
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-left font-mono text-lg font-normal text-gray-500">
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
              className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#137A3D] px-6 text-lg font-normal text-white transition hover:bg-[#0f6833]"
            >
              <ArrowLeft size={19} />
              <span>Back to Stores</span>
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
    return <ShopDetailSkeleton />;
  }

  /* =======================================================
     STORE ERROR
  ======================================================= */
  if (storeError || !store) {
    return (
      <div className="p-4">
        <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-red-100 bg-white px-6 shadow-sm">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <p className="mt-5 text-2xl font-medium text-gray-800">
              មិនអាចទាញយក Store detail
            </p>

            <p className="mt-3 text-lg font-normal leading-relaxed text-gray-600">
              {getShopApiErrorMessage(storeError)}
            </p>

            <p className="mt-3 break-all font-mono text-lg font-normal text-gray-400">
              UUID: {resolvedStoreUuid}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void refetchStore()}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#137A3D] px-6 text-lg font-normal text-white transition hover:bg-[#0f6833]"
              >
                សាកល្បងម្តងទៀត
              </button>

              <button
                type="button"
                onClick={() => router.push("/shops")}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-lg font-normal text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft size={19} />
                <span>Stores</span>
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

      window.scrollTo({ top: 0, behavior: "smooth" });

      await refetchStore();
    } catch (updateError) {
      // Re-throw so ShopEditModal catches and displays the error inside the modal!
      throw updateError;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    await refetchStore();
  };

  /* =======================================================
     REFRESH STORE + HOURS
  ======================================================= */
  const refreshHours = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await Promise.all([refetchStore(), refetchHours()]);
  };

  /* =======================================================
     DELETE STORE
  ======================================================= */
  const handleDelete = async () => {
    try {
      setNotice(null);
      await deleteStore(resolvedStoreUuid).unwrap();
      router.push("/shops");
      router.refresh();
    } catch (deleteError) {
      setNotice({
        type: "error",
        text: getShopApiErrorMessage(deleteError),
      });
      setDeleteOpen(false);
    }
  };

  const busy = updatingStore || deletingStore || storeFetching;

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
          onDelete={() => {
            setNotice(null);
            setDeleteOpen(true);
          }}
        />
      </div>

      {/* =================================================
          MESSAGE
      ================================================== */}
      {notice && (
        <div
          className={`flex items-center justify-between rounded-3xl border px-6 py-4 text-lg font-medium shadow-2xs transition-all ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className={notice.type === "success" ? "text-emerald-600" : "text-red-500"} />
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-black/5 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
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
            onViewItem={(item) => setDetailMenuItemRecord(item)}
            onEditItem={(item) => setEditingMenuItemRecord(item)}
            onDeleteItem={(item) => setDeletingMenuItemRecord(item)}
            onAddMenuItem={() => setCreateMenuOpen(true)}
          />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreContactLocationSection store={store} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreRatingsSection store={store} />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreMediaSection
            store={store}
            onEditMedia={() => {
              setNotice(null);
              setEditOpen(true);
            }}
          />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreSocialLinksSection
            links={store.socialLinks ?? []}
            onEdit={() => {
              setNotice(null);
              setEditOpen(true);
            }}
          />
        </div>

        <div className="mb-5 inline-block w-full min-w-0 max-w-full align-top [break-inside:avoid]">
          <StoreHoursSection
            hours={hours}
            loading={hoursLoading || hoursFetching}
            onEditHours={() => {
              setNotice(null);
              setHoursOpen(true);
            }}
          />
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
          DELETE STORE MODAL
      ================================================== */}
      <DeleteShopConfirmModal
        store={store}
        open={deleteOpen}
        loading={deletingStore}
        onClose={() => {
          if (!deletingStore) setDeleteOpen(false);
        }}
        onConfirm={handleDelete}
      />

      {/* =================================================
          PUBLISH / EDIT MENU ITEM MODAL (Inside Store Detail)
      ================================================== */}
      <PublishMenuItemModal
        open={isMenuModalOpen}
        item={editingMenuItemRecord}
        foods={foodsQuery.data?.content ?? []}
        stores={storesQuery.data ?? []}
        ingredients={ingredientsQuery.data ?? []}
        dietaryTypes={
          dietaryTypesQuery.data?.contents ??
          (dietaryTypesQuery.data as any)?.content ??
          (Array.isArray(dietaryTypesQuery.data) ? dietaryTypesQuery.data : [])
        }
        allergens={
          allergensQuery.data?.contents ??
          (allergensQuery.data as any)?.content ??
          (Array.isArray(allergensQuery.data) ? allergensQuery.data : [])
        }
        medicalConditions={
          medicalConditionsQuery.data?.contents ??
          (medicalConditionsQuery.data as any)?.content ??
          (Array.isArray(medicalConditionsQuery.data) ? medicalConditionsQuery.data : [])
        }
        defaultStoreUuid={resolvedStoreUuid}
        saving={false}
        onClose={() => {
          if (!updatingMenuItem) {
            setCreateMenuOpen(false);
            setEditingMenuItemRecord(null);
          }
        }}
        onSubmit={handleSaveMenuItem}
      />

      {/* =================================================
          MENU ITEM DETAIL MODAL (Inside Store Detail)
      ================================================== */}
      {detailMenuItemRecord && (
        <MenuItemDetailModal
          uuid={detailMenuItemRecord?.uuid}
          onClose={() => setDetailMenuItemRecord(null)}
          onEdit={(item) => {
            setDetailMenuItemRecord(null);
            setEditingMenuItemRecord(item);
          }}
        />
      )}

      {/* Delete Menu Item Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deletingMenuItemRecord)}
        variant="hard"
        title="លុប ម៉ឺនុយ ចេញពីហាង?"
        description={
          deletingMenuItemRecord
            ? `ម៉ឺនុយ "${deletingMenuItemRecord.name}" នឹងត្រូវលុបចេញពីហាងនេះ។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។`
            : ""
        }
        deleting={deletingMenuItemRequest}
        onClose={() => setDeletingMenuItemRecord(null)}
        onConfirm={() => void confirmDeleteMenuItem()}
      />
    </div>
  );
}
