"use client";

import {
  AlertTriangle,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Store,
  Utensils,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  useCreateManagedFoodMutation,
  useCreateStoreMenuItemMutation,
  useDeleteManagedFoodMutation,
  useDeleteStoreMenuItemMutation,
  useGetManagedCuisinesQuery,
  useGetManagedFoodCategoriesQuery,
  useGetManagedFoodsQuery,
  useGetManagedIngredientsQuery,
  useGetManagedStoresQuery,
  useGetPublishedMenuItemsQuery,
  useUpdateManagedFoodMutation,
  useUpdateStoreMenuItemMutation,
} from "@/src/app/store/menuManagementApi";

import { getMenuManagementApiError } from "@/src/lib/menuManagementApiError";

import type {
  FoodRecord,
  FoodWritePayload,
  MenuItemRecord,
  MenuItemWritePayload,
} from "@/src/types/menu-management";

import DeleteConfirmModal from "./DeleteConfirmModal";
import FoodCatalogTable from "./FoodCatalogTable";
import FoodFormModal from "./FoodFormModal";
import MenuItemDetailModal from "./MenuItemDetailModal";
import PublishMenuItemModal from "./PublishMenuItemModal";
import PublishedMenuItemsTable from "./PublishedMenuItemsTable";

type Tab = "FOODS" | "WEBSITE";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function matchesFood(item: FoodRecord, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return [
    item.canonicalName,
    item.localName,
    item.description,
    item.category?.name,
    item.categoryName,
    item.cuisine?.name,
    item.cuisineName,
  ].some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
}

function matchesMenuItem(item: MenuItemRecord, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return [
    item.name,
    item.description,
    item.store?.storeName,
    item.store?.name,
    item.food?.canonicalName,
    item.food?.localName,
    item.availabilityStatus,
  ].some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
}

export default function MenuItemsManager() {
  const [tab, setTab] = useState<Tab>("FOODS");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemRecord | null>(null);

  const [deletingFood, setDeletingFood] = useState<FoodRecord | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<MenuItemRecord | null>(null);

  const [detailUuid, setDetailUuid] = useState<string | null>(null);

  const foodsQuery = useGetManagedFoodsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });

  const menuItemsQuery = useGetPublishedMenuItemsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();
  const ingredientsQuery = useGetManagedIngredientsQuery();
  const storesQuery = useGetManagedStoresQuery();

  const [createFood, { isLoading: creatingFood }] =
    useCreateManagedFoodMutation();

  const [updateFood, { isLoading: updatingFood }] =
    useUpdateManagedFoodMutation();

  const [deleteFood, { isLoading: deletingFoodRequest }] =
    useDeleteManagedFoodMutation();

  const [createMenuItem, { isLoading: creatingMenuItem }] =
    useCreateStoreMenuItemMutation();

  const [updateMenuItem, { isLoading: updatingMenuItem }] =
    useUpdateStoreMenuItemMutation();

  const [deleteMenuItem, { isLoading: deletingMenuItemRequest }] =
    useDeleteStoreMenuItemMutation();

  const foods = foodsQuery.data?.content ?? [];
  const menuItems = menuItemsQuery.data?.content ?? [];

  const filteredFoods = useMemo(
    () => foods.filter((item) => matchesFood(item, search)),
    [foods, search],
  );

  const filteredMenuItems = useMemo(
    () => menuItems.filter((item) => matchesMenuItem(item, search)),
    [menuItems, search],
  );

  const busy =
    creatingFood ||
    updatingFood ||
    deletingFoodRequest ||
    creatingMenuItem ||
    updatingMenuItem ||
    deletingMenuItemRequest;

  const currentLoading =
    tab === "FOODS" ? foodsQuery.isLoading : menuItemsQuery.isLoading;

  const currentError =
    tab === "FOODS" ? foodsQuery.error : menuItemsQuery.error;

  const refreshAll = async () => {
    await Promise.all([foodsQuery.refetch(), menuItemsQuery.refetch()]);
  };

  const saveFood = async (payload: FoodWritePayload, images: File[]) => {
    try {
      setNotice(null);

      if (editingFood) {
        await updateFood({
          uuid: editingFood.uuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានកែប្រែ Food Catalog ដោយជោគជ័យ។",
        });
      } else {
        await createFood({
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានបង្កើត Food Catalog។ Store អាចជ្រើស Food នេះបាន។",
        });
      }

      setFoodModalOpen(false);
      setEditingFood(null);

      await refreshAll();
    } catch (error) {
      const message = getMenuManagementApiError(error);

      setNotice({
        type: "error",
        text: message,
      });

      throw new Error(message);
    }
  };

  const saveMenuItem = async (
    storeUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => {
    try {
      setNotice(null);

      if (editingMenu) {
        await updateMenuItem({
          uuid: editingMenu.uuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានកែប្រែ Menu Item ដោយជោគជ័យ។",
        });
      } else {
        await createMenuItem({
          storeUuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បាន Publish Menu Item។ វានឹងចូល Public Menu Item API របស់ Website។",
        });
      }

      setMenuModalOpen(false);
      setEditingMenu(null);
      setTab("WEBSITE");

      await refreshAll();
    } catch (error) {
      const message = getMenuManagementApiError(error);

      setNotice({
        type: "error",
        text: message,
      });

      throw new Error(message);
    }
  };

  const confirmDeleteFood = async () => {
    if (!deletingFood) return;

    try {
      await deleteFood(deletingFood.uuid).unwrap();

      setDeletingFood(null);

      setNotice({
        type: "success",
        text: "បាន deactivate/delete Food Catalog។",
      });

      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  const confirmDeleteMenu = async () => {
    if (!deletingMenu) return;

    try {
      await deleteMenuItem(deletingMenu.uuid).unwrap();

      setDeletingMenu(null);

      setNotice({
        type: "success",
        text: "បានលុប Menu Item។",
      });

      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] bg-gradient-to-br from-[#137A3D] to-[#0f8e48] p-6 text-white shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Utensils size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-black sm:text-4xl">ប្រភេទអាហារ</h1>
              <p className="mt-1 text-sm text-white/75">
                Food Catalog សម្រាប់ Store និង Menu Items សម្រាប់ Website
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingFood(null);
                setFoodModalOpen(true);
              }}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#137A3D] shadow-sm"
            >
              <Plus size={18} />
              បន្ថែម Food Catalog
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingMenu(null);
                setMenuModalOpen(true);
              }}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 text-sm font-black text-white"
            >
              <Globe2 size={18} />
              Publish ទៅ Website
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Stat
            icon={<Store size={20} />}
            label="Food Catalog សម្រាប់ Store"
            value={foods.length}
          />

          <Stat
            icon={<Globe2 size={20} />}
            label="Menu Items លើ Website"
            value={menuItems.length}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex w-fit rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          <TabButton active={tab === "FOODS"} onClick={() => setTab("FOODS")}>
            <Store size={16} />
            សម្រាប់ Store
            <Count>{foods.length}</Count>
          </TabButton>

          <TabButton
            active={tab === "WEBSITE"}
            onClick={() => setTab("WEBSITE")}
          >
            <Globe2 size={16} />
            Website
            <Count>{menuItems.length}</Count>
          </TabButton>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ស្វែងរក..."
              className="h-12 w-full min-w-[280px] rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#137A3D] focus:ring-4 focus:ring-emerald-50 sm:w-[360px]"
            />
          </div>

          <button
            type="button"
            disabled={foodsQuery.isFetching || menuItemsQuery.isFetching}
            onClick={() => void refreshAll()}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                foodsQuery.isFetching || menuItemsQuery.isFetching
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
        {currentLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#137A3D]" />
          </div>
        ) : currentError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={38} className="text-red-400" />
            <h3 className="mt-3 text-xl font-black text-gray-900">
              មិនអាចទាញយកទិន្នន័យបានទេ
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              {getMenuManagementApiError(currentError)}
            </p>
          </div>
        ) : tab === "FOODS" ? (
          <FoodCatalogTable
            items={filteredFoods}
            busy={busy}
            onEdit={(item) => {
              setEditingFood(item);
              setFoodModalOpen(true);
            }}
            onDelete={setDeletingFood}
          />
        ) : (
          <PublishedMenuItemsTable
            items={filteredMenuItems}
            busy={busy}
            onView={(item) => setDetailUuid(item.uuid)}
            onEdit={(item) => {
              setEditingMenu(item);
              setMenuModalOpen(true);
            }}
            onDelete={setDeletingMenu}
          />
        )}
      </section>

      <FoodFormModal
        open={foodModalOpen}
        item={editingFood}
        categories={categoriesQuery.data ?? []}
        cuisines={cuisinesQuery.data ?? []}
        saving={creatingFood || updatingFood}
        onClose={() => {
          if (creatingFood || updatingFood) return;
          setFoodModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={saveFood}
      />

      <PublishMenuItemModal
        open={menuModalOpen}
        item={editingMenu}
        foods={foods}
        stores={storesQuery.data ?? []}
        ingredients={ingredientsQuery.data ?? []}
        saving={creatingMenuItem || updatingMenuItem}
        onClose={() => {
          if (creatingMenuItem || updatingMenuItem) {
            return;
          }
          setMenuModalOpen(false);
          setEditingMenu(null);
        }}
        onSubmit={saveMenuItem}
      />

      <DeleteConfirmModal
        open={Boolean(deletingFood)}
        title="លុប Food Catalog?"
        description={
          deletingFood
            ? `Food: ${
                deletingFood.localName || deletingFood.canonicalName
              }. Backend Food DELETE គឺសម្រាប់ deactivate/cleanup។`
            : ""
        }
        deleting={deletingFoodRequest}
        onClose={() => setDeletingFood(null)}
        onConfirm={() => void confirmDeleteFood()}
      />

      <DeleteConfirmModal
        open={Boolean(deletingMenu)}
        title="លុប Menu Item?"
        description={deletingMenu ? `Menu Item: ${deletingMenu.name}.` : ""}
        deleting={deletingMenuItemRequest}
        onClose={() => setDeletingMenu(null)}
        onConfirm={() => void confirmDeleteMenu()}
      />

      <MenuItemDetailModal
        uuid={detailUuid}
        onClose={() => setDetailUuid(null)}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
        active ? "bg-[#137A3D] text-white" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}
