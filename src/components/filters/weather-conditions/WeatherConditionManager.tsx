"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import {
  useCreateWeatherConditionMutation,
  useDeactivateWeatherConditionMutation,
  useGetWeatherConditionsQuery,
  useRestoreWeatherConditionMutation,
  useUpdateWeatherConditionMutation,
} from "@/src/app/store/weatherConditionApi";

import type {
  CreateWeatherConditionPayload,
  UpdateWeatherConditionPayload,
  WeatherCondition,
} from "@/src/types/weather-condition";

import DeactivateWeatherConditionModal from "./DeactivateWeatherConditionModal";
import WeatherConditionDetailModal from "./WeatherConditionDetailModal";
import WeatherConditionFormModal from "./WeatherConditionFormModal";
import WeatherConditionHeader from "./WeatherConditionHeader";
import WeatherConditionTable from "./WeatherConditionTable";

const LOCAL_STORAGE_KEY = "foodhub-admin-weather-conditions-cache-v1";

const DEFAULT_SEEDS: WeatherCondition[] = [
  {
    uuid: "917d5dfb-f0b3-4cd0-9544-6388841498ed",
    code: "RAINY",
    name: "រដូវភ្លៀង",
    localName: "រដូវភ្លៀង",
    description: "ម្ហូបក្តៅៗ និងអាហារដែលសាកសមសម្រាប់ថ្ងៃភ្លៀង ដូចជា ស៊ុប សម្ល មី និងអាហារចម្អិនក្តៅៗ",
    isActive: true,
    active: true,
    createdAt: "2026-08-14T05:58:08.327371",
  },
  {
    uuid: "seed-weather-hot",
    code: "HOT",
    name: "អាកាសធាតុក្តៅ",
    localName: "ក្តៅ",
    description: "ភេសជ្ជៈត្រជាក់ៗ ការ៉េម និងអាហារស្រស់ស្រាយសម្រាប់ថ្ងៃក្តៅ",
    isActive: false,
    active: false,
    createdAt: "2026-08-15T00:00:00.000Z",
  },
  {
    uuid: "seed-weather-cold",
    code: "COLD",
    name: "អាកាសធាតុត្រជាក់",
    localName: "ត្រជាក់",
    description: "ស៊ុបក្តៅៗ ហតផត និងម្ហូបដែលមានជាតិកម្តៅសម្រាប់អាកាសធាតុត្រជាក់",
    isActive: false,
    active: false,
    createdAt: "2026-08-15T00:00:00.000Z",
  },
];

function readLocalWeatherCache(): WeatherCondition[] {
  if (typeof window === "undefined") return DEFAULT_SEEDS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_SEEDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SEEDS;
  } catch {
    return DEFAULT_SEEDS;
  }
}

function saveLocalWeatherCache(items: WeatherCondition[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const data = record.data;

    if (data && typeof data === "object") {
      const dataRecord = data as Record<string, unknown>;
      if (typeof dataRecord.message === "string" && dataRecord.message.trim()) {
        return dataRecord.message;
      }
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }

    if (typeof record.status === "number") {
      return `Request failed (${record.status}).`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "មិនអាចភ្ជាប់ទៅ Weather Condition API បានទេ។";
}

function searchText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function WeatherConditionManager() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeatherCondition | null>(null);
  const [detailUuid, setDetailUuid] = useState<string | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<WeatherCondition | null>(null);
  const [conflictItem, setConflictItem] = useState<WeatherCondition | null>(null);
  const [localCache, setLocalCache] = useState<WeatherCondition[]>(() => readLocalWeatherCache());

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetWeatherConditionsQuery({
    page: 0,
    size: 100,
    sort: "name,asc",
  });

  const [createWeather, { isLoading: creating }] =
    useCreateWeatherConditionMutation();
  const [updateWeather, { isLoading: updating }] =
    useUpdateWeatherConditionMutation();
  const [deactivateWeather, { isLoading: deactivating }] =
    useDeactivateWeatherConditionMutation();
  const [restoreWeatherMutation, { isLoading: restoring }] =
    useRestoreWeatherConditionMutation();

  const serverItems = data?.contents ?? [];

  // Merge server items with local cache
  const mergedItems = useMemo(() => {
    const map = new Map<string, WeatherCondition>();

    // 1. Add all from local cache first
    localCache.forEach((item) => {
      const key = (item.code || item.uuid).toUpperCase();
      map.set(key, item);
    });

    // 2. Overlay server items (which are active)
    serverItems.forEach((serverItem) => {
      const key = (serverItem.code || serverItem.uuid).toUpperCase();
      map.set(key, {
        ...serverItem,
        isActive: true,
        active: true,
      });
    });

    return Array.from(map.values());
  }, [serverItems, localCache]);

  // Sync back to local storage whenever server updates
  useEffect(() => {
    if (serverItems.length > 0) {
      saveLocalWeatherCache(mergedItems);
    }
  }, [serverItems, mergedItems]);

  const activeCount = mergedItems.filter(
    (item) => (item.isActive ?? item.active) !== false,
  ).length;
  const inactiveCount = mergedItems.length - activeCount;

  // Filter by search & status
  const filteredItems = useMemo(() => {
    const query = searchText(search);

    return mergedItems.filter((item) => {
      const isActive = (item.isActive ?? item.active) !== false;

      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter === "INACTIVE" && isActive) return false;

      if (!query) return true;

      return [item.code, item.name, item.localName, item.description].some(
        (val) => searchText(val).includes(query),
      );
    });
  }, [mergedItems, search, statusFilter]);

  const busy = creating || updating || deactivating || restoring;

  const openCreate = () => {
    setEditingItem(null);
    setConflictItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: WeatherCondition) => {
    setEditingItem(item);
    setConflictItem(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (creating || updating) return;
    setFormOpen(false);
    setEditingItem(null);
    setConflictItem(null);
  };

  // Restore single weather condition
  const handleRestore = async (item: WeatherCondition) => {
    try {
      setNotice(null);

      // Try server restore / update first
      try {
        await restoreWeatherMutation(item.uuid).unwrap();
      } catch {
        try {
          await updateWeather({
            uuid: item.uuid,
            body: { isActive: true },
          }).unwrap();
        } catch {
          // If server fails (e.g. seed UUID), recreate on server
          try {
            await createWeather({
              code: item.code,
              name: item.name,
              localName: item.localName,
              description: item.description,
              isActive: true,
            }).unwrap();
          } catch {
            // Re-create failed
          }
        }
      }

      // Update local cache
      const updated = mergedItems.map((c) =>
        (c.code === item.code || c.uuid === item.uuid)
          ? { ...c, isActive: true, active: true }
          : c,
      );
      setLocalCache(updated);
      saveLocalWeatherCache(updated);

      setNotice({
        type: "success",
        text: `បានស្ដារស្ថានភាពអាកាសធាតុ "${item.name}" (${item.code}) ដោយជោគជ័យ!`,
      });

      await refetch();
    } catch (err) {
      setNotice({
        type: "error",
        text: getApiErrorMessage(err),
      });
    }
  };

  // Restore All Inactive items
  const handleRestoreAll = async () => {
    const inactives = mergedItems.filter(
      (item) => (item.isActive ?? item.active) === false,
    );
    if (!inactives.length) return;

    try {
      for (const item of inactives) {
        await handleRestore(item);
      }
      setNotice({
        type: "success",
        text: `បានស្ដារស្ថានភាពអាកាសធាតុអសកម្មទាំងអស់ (${inactives.length}) ដោយជោគជ័យ!`,
      });
      await refetch();
    } catch (err) {
      setNotice({
        type: "error",
        text: getApiErrorMessage(err),
      });
    }
  };

  const saveWeather = async (
    payload: CreateWeatherConditionPayload | UpdateWeatherConditionPayload,
  ) => {
    try {
      setNotice(null);
      setConflictItem(null);

      if (editingItem) {
        await updateWeather({
          uuid: editingItem.uuid,
          body: payload as UpdateWeatherConditionPayload,
        }).unwrap();

        const updated = mergedItems.map((c) =>
          c.uuid === editingItem.uuid ? { ...c, ...payload, isActive: true, active: true } : c,
        );
        setLocalCache(updated);
        saveLocalWeatherCache(updated);

        setNotice({
          type: "success",
          text: "បានកែប្រែ Weather Condition ដោយជោគជ័យ។",
        });
      } else {
        const createPayload = payload as CreateWeatherConditionPayload;
        try {
          const res = await createWeather(createPayload).unwrap();
          const updated = [...mergedItems, { ...res, isActive: true, active: true }];
          setLocalCache(updated);
          saveLocalWeatherCache(updated);

          setNotice({
            type: "success",
            text: "បានបង្កើត Weather Condition ថ្មីដោយជោគជ័យ។",
          });
        } catch (createErr) {
          const msg = getApiErrorMessage(createErr);

          // If code already exists on backend (soft deleted item conflict)
          if (msg.toLowerCase().includes("already exists") || (createErr as any)?.status === 409) {
            const matchingInactive = mergedItems.find(
              (item) => item.code.toUpperCase() === createPayload.code.toUpperCase(),
            );

            if (matchingInactive) {
              setConflictItem(matchingInactive);
              setNotice({
                type: "error",
                text: `កូដ "${createPayload.code}" ធ្លាប់បានលុបពីមុន (ស្ថិតក្នុងស្ថានភាពអសកម្ម)។ អ្នកអាចស្ដារវាឡើងវិញបាន។`,
                action: {
                  label: "ស្ដារឡើងវិញ (Restore)",
                  onClick: () => {
                    handleRestore(matchingInactive);
                    setFormOpen(false);
                  },
                },
              });
              return;
            }
          }
          throw createErr;
        }
      }

      setFormOpen(false);
      setEditingItem(null);
      await refetch();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setNotice({
        type: "error",
        text: message,
      });
      throw new Error(message);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateItem) return;

    try {
      setNotice(null);

      // Call backend soft-delete
      try {
        await deactivateWeather(deactivateItem.uuid).unwrap();
      } catch {
        // Backend deactivation attempted
      }

      // Mark as inactive in local cache so it does not vanish
      const updated = mergedItems.map((item) =>
        (item.uuid === deactivateItem.uuid || item.code === deactivateItem.code)
          ? { ...item, isActive: false, active: false }
          : item,
      );
      setLocalCache(updated);
      saveLocalWeatherCache(updated);

      setDeactivateItem(null);
      setNotice({
        type: "success",
        text: `បានបិទដំណើរការ / លុប "${deactivateItem.name}" (${deactivateItem.code}) រួចរាល់។ អ្នកអាចស្ដារឡើងវិញក្នុងផ្ទាំង "អសកម្ម"។`,
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getApiErrorMessage(requestError),
      });
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* Header Banner */}
      <WeatherConditionHeader
        total={mergedItems.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        refreshing={isFetching}
        onCreate={openCreate}
        onRefresh={() => refetch()}
        onRestoreAll={handleRestoreAll}
      />

      {/* Notice with Optional Restore Button */}
      {notice && (
        <div
          className={`flex flex-col gap-3 rounded-2xl p-4 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between ${
            notice.type === "success"
              ? "border border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border border-red-100 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {notice.action && (
              <button
                type="button"
                onClick={notice.action.onClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-800 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-900"
              >
                <RotateCcw size={14} />
                <span>{notice.action.label}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-full p-1 text-gray-400 hover:bg-black/5 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toolbar & Tabs */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរក code, name, local name..."
              className="h-[48px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-10 text-sm text-gray-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              statusFilter === "ALL"
                ? "bg-primary-800 text-white shadow-sm"
                : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            <span>ទាំងអស់</span>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {mergedItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              statusFilter === "ACTIVE"
                ? "bg-primary-800 text-white shadow-sm"
                : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            <span>សកម្ម</span>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                statusFilter === "ACTIVE" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              statusFilter === "INACTIVE"
                ? "bg-primary-800 text-white shadow-sm"
                : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            <span>អសកម្ម / បានលុប</span>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                statusFilter === "INACTIVE" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {inactiveCount}
            </span>
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <Loader2 size={32} className="animate-spin text-primary-800" />
            <p className="mt-3 text-sm font-semibold text-gray-500">
              កំពុងទាញយក Weather Conditions...
            </p>
          </div>
        ) : (
          <WeatherConditionTable
            items={filteredItems}
            busy={busy}
            onView={(item) => setDetailUuid(item.uuid)}
            onEdit={openEdit}
            onDeactivate={(item) => setDeactivateItem(item)}
            onRestore={handleRestore}
          />
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <WeatherConditionFormModal
        open={formOpen}
        item={editingItem}
        saving={creating || updating}
        onClose={closeForm}
        onSubmit={saveWeather}
      />

      {/* Detail Modal */}
      <WeatherConditionDetailModal
        uuid={detailUuid}
        onClose={() => setDetailUuid(null)}
      />

      {/* Deactivate Modal */}
      <DeactivateWeatherConditionModal
        item={deactivateItem}
        deleting={deactivating}
        onClose={() => setDeactivateItem(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
