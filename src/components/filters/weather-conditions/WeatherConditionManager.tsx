"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
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

  const activeCount = serverItems.filter(
    (item) => (item.isActive ?? item.active) !== false,
  ).length;
  const inactiveCount = serverItems.length - activeCount;

  // Filter by search & status
  const filteredItems = useMemo(() => {
    const query = searchText(search);

    return serverItems.filter((item) => {
      const isActive = (item.isActive ?? item.active) !== false;

      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter === "INACTIVE" && isActive) return false;

      if (!query) return true;

      return [item.code, item.name, item.localName, item.description].some(
        (val) => searchText(val).includes(query),
      );
    });
  }, [serverItems, search, statusFilter]);

  const busy = creating || updating || deactivating || restoring;

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: WeatherCondition) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (creating || updating) return;
    setFormOpen(false);
    setEditingItem(null);
  };

  // Restore single weather condition
  const handleRestore = async (item: WeatherCondition) => {
    try {
      setNotice(null);

      try {
        await restoreWeatherMutation(item.uuid).unwrap();
      } catch {
        await updateWeather({
          uuid: item.uuid,
          body: { isActive: true },
        }).unwrap();
      }

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
    const inactives = serverItems.filter(
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

      if (editingItem) {
        await updateWeather({
          uuid: editingItem.uuid,
          body: payload as UpdateWeatherConditionPayload,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានកែប្រែ Weather Condition ដោយជោគជ័យ។",
        });
      } else {
        const createPayload = payload as CreateWeatherConditionPayload;
        try {
          await createWeather(createPayload).unwrap();

          setNotice({
            type: "success",
            text: "បានបង្កើត Weather Condition ថ្មីដោយជោគជ័យ។",
          });
        } catch (createErr) {
          const msg = getApiErrorMessage(createErr);

          if (msg.toLowerCase().includes("already exists") || (createErr as any)?.status === 409) {
            const matchingInactive = serverItems.find(
              (item) => item.code.toUpperCase() === createPayload.code.toUpperCase(),
            );

            if (matchingInactive) {
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
      await deactivateWeather(deactivateItem.uuid).unwrap();

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
        total={serverItems.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        refreshing={isFetching}
        onCreate={openCreate}
        onRefresh={() => refetch()}
        onRestoreAll={inactiveCount > 0 ? handleRestoreAll : undefined}
      />

      {/* Notice with Optional Restore Button */}
      {notice && (
        <div
          className={`flex flex-col gap-3 rounded-2xl p-5 text-lg font-semibold sm:flex-row sm:items-center sm:justify-between ${notice.type === "success"
            ? "border border-emerald-100 bg-emerald-50 text-emerald-800"
            : "border border-red-100 bg-red-50 text-red-700"
            }`}
        >
          <div className="flex items-center gap-3">
            {notice.type === "success" ? (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={24} className="text-red-500 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>

          <div className="flex items-center gap-3">
            {notice.action && (
              <button
                type="button"
                onClick={notice.action.onClick}
                className="rounded-xl bg-red-600 px-4 py-2 text-lg font-bold text-white transition hover:bg-red-700"
              >
                {notice.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-full p-1.5 text-gray-400 hover:bg-black/5 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Fetch Error Display */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-5 text-lg text-red-700">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="shrink-0 text-red-500" />
            <span>{getApiErrorMessage(error)}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-lg font-bold text-red-700 hover:bg-red-50"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* Toolbar: Search + Filter Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬកូដ..."
            className="h-12 w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-lg font-medium text-gray-800 outline-none transition focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((tab) => {
            const isSelected = statusFilter === tab;
            const count =
              tab === "ALL"
                ? serverItems.length
                : tab === "ACTIVE"
                  ? activeCount
                  : inactiveCount;

            const label =
              tab === "ALL"
                ? "ទាំងអស់"
                : tab === "ACTIVE"
                  ? "សកម្ម"
                  : "អសកម្ម";

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition ${isSelected
                  ? "bg-primary-800 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-lg font-normal ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-100 bg-white p-8">
          <Loader2 size={36} className="animate-spin text-[#14833E]" />
          <p className="text-lg font-semibold text-gray-500">
            កំពុងទាញយកបញ្ជីស្ថានភាពអាកាសធាតុ...
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

      {/* Deactivate Confirmation Modal */}
      <DeactivateWeatherConditionModal
        item={deactivateItem}
        deleting={deactivating}
        onClose={() => setDeactivateItem(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
