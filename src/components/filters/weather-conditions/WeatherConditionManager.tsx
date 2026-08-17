"use client";

import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useCreateWeatherConditionMutation,
  useDeactivateWeatherConditionMutation,
  useGetWeatherConditionsQuery,
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
import WeatherConditionPagination from "./WeatherConditionPagination";
import WeatherConditionTable from "./WeatherConditionTable";
import WeatherConditionToolbar, {
  type SortMode,
  type StatusFilter,
} from "./WeatherConditionToolbar";

function getApiErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error ===
      "object"
  ) {
    const record =
      error as Record<
        string,
        unknown
      >;

    const data =
      record.data;

    if (
      data &&
      typeof data ===
        "object"
    ) {
      const dataRecord =
        data as Record<
          string,
          unknown
        >;

      if (
        typeof dataRecord.message ===
          "string" &&
        dataRecord.message.trim()
      ) {
        return dataRecord.message;
      }
    }

    if (
      typeof data ===
        "string" &&
      data.trim()
    ) {
      return data;
    }

    if (
      typeof record.error ===
        "string" &&
      record.error.trim()
    ) {
      return record.error;
    }

    if (
      typeof record.status ===
        "number"
    ) {
      return `Request failed (${record.status}).`;
    }
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "មិនអាចភ្ជាប់ទៅ Weather Condition API បានទេ។";
}

function searchText(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase();
}

function getTime(
  value: string | null | undefined,
): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export default function WeatherConditionManager() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("ALL");

  const [
    sortMode,
    setSortMode,
  ] = useState<SortMode>("NEWEST");

  const [
    size,
    setSize,
  ] = useState(20);

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    editingItem,
    setEditingItem,
  ] =
    useState<WeatherCondition | null>(
      null,
    );

  const [
    detailUuid,
    setDetailUuid,
  ] =
    useState<string | null>(
      null,
    );

  const [
    deactivateItem,
    setDeactivateItem,
  ] =
    useState<WeatherCondition | null>(
      null,
    );

  const [
    notice,
    setNotice,
  ] =
    useState<
      | {
          type:
            | "success"
            | "error";

          text:
            string;
        }
      | null
    >(null);

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } =
    useGetWeatherConditionsQuery({
      page: 0,
      size: 100,
      sort: "name,asc",
    });

  const [
    createWeather,
    {
      isLoading:
        creating,
    },
  ] =
    useCreateWeatherConditionMutation();

  const [
    updateWeather,
    {
      isLoading:
        updating,
    },
  ] =
    useUpdateWeatherConditionMutation();

  const [
    deactivateWeather,
    {
      isLoading:
        deactivating,
    },
  ] =
    useDeactivateWeatherConditionMutation();

  const items =
    data?.contents ??
    [];

  const totalCount = items.length;

  const activeCount = useMemo(() => {
    return items.filter(
      (item) => item.isActive ?? item.active ?? true,
    ).length;
  }, [items]);

  const inactiveCount = totalCount - activeCount;

  const normalizedSearch = search.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return items
      .filter((item) =>
        [item.localName, item.name, item.code, item.description].some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(normalizedSearch),
        ),
      )
      .slice(0, 8);
  }, [items, normalizedSearch]);

  const filteredItems = useMemo(() => {
    const query = searchText(search);

    return items.filter((item) => {
      const active = item.isActive ?? item.active ?? true;
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      if (!statusMatches) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.code,
        item.name,
        item.localName,
        item.description,
      ].some((value) =>
        searchText(value).includes(query),
      );
    });
  }, [items, search, statusFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((first, second) => {
      const firstLabel = first.localName || first.name || "";
      const secondLabel = second.localName || second.name || "";

      if (sortMode === "A_Z") {
        return firstLabel.localeCompare(secondLabel, "km", {
          sensitivity: "base",
        });
      }

      if (sortMode === "Z_A") {
        return secondLabel.localeCompare(firstLabel, "km", {
          sensitivity: "base",
        });
      }

      const firstTime = getTime(first.createdAt);
      const secondTime = getTime(second.createdAt);

      return sortMode === "NEWEST"
        ? secondTime - firstTime
        : firstTime - secondTime;
    });
  }, [filteredItems, sortMode]);

  const totalPages = Math.max(Math.ceil(sortedItems.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sortedItems.slice(safePage * size, safePage * size + size);

  const busy =
    creating ||
    updating ||
    deactivating;

  const openCreate =
    () => {
      setEditingItem(
        null,
      );

      setFormOpen(
        true,
      );
    };

  const openEdit = (
    item: WeatherCondition,
  ) => {
    setEditingItem(
      item,
    );

    setFormOpen(
      true,
    );
  };

  const closeForm =
    () => {
      if (
        creating ||
        updating
      ) {
        return;
      }

      setFormOpen(
        false,
      );

      setEditingItem(
        null,
      );
    };

  const saveWeather =
    async (
      payload:
        | CreateWeatherConditionPayload
        | UpdateWeatherConditionPayload,
    ) => {
      try {
        setNotice(null);

        if (
          editingItem
        ) {
          await updateWeather({
            uuid:
              editingItem.uuid,

            body:
              payload as UpdateWeatherConditionPayload,
          }).unwrap();

          setNotice({
            type:
              "success",

            text:
              "បានកែប្រែ Weather Condition ដោយជោគជ័យ។",
          });
        } else {
          await createWeather(
            payload as CreateWeatherConditionPayload,
          ).unwrap();

          setNotice({
            type:
              "success",

            text:
              "បានបង្កើត Weather Condition ថ្មីដោយជោគជ័យ។",
          });
        }

        setFormOpen(
          false,
        );

        setEditingItem(
          null,
        );

        await refetch();
      } catch (
        requestError
      ) {
        const message =
          getApiErrorMessage(
            requestError,
          );

        setNotice({
          type:
            "error",

          text:
            message,
        });

        throw new Error(
          message,
        );
      }
    };

  const confirmDeactivate =
    async () => {
      if (
        !deactivateItem
      ) {
        return;
      }

      try {
        setNotice(null);

        await deactivateWeather(
          deactivateItem.uuid,
        ).unwrap();

        setDeactivateItem(
          null,
        );

        setNotice({
          type:
            "success",

          text:
            "បាន Deactivate Weather Condition ដោយជោគជ័យ។",
        });

        await refetch();
      } catch (
        requestError
      ) {
        setNotice({
          type:
            "error",

          text:
            getApiErrorMessage(
              requestError,
            ),
        });
      }
    };

  return (
    <div className="space-y-5">
      <WeatherConditionHeader
        total={activeCount}
        refreshing={
          isFetching
        }
        onCreate={
          openCreate
        }
        onRefresh={() =>
          void refetch()
        }
      />

      <WeatherConditionToolbar
        search={search}
        statusFilter={statusFilter}
        sortMode={sortMode}
        size={size}
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        suggestions={suggestions}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onClearSearch={() => {
          setSearch("");
          setPage(0);
        }}
        onSuggestionSelect={(item) => {
          setSearch(item.localName || item.name);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
        onSortChange={(value) => {
          setSortMode(value);
        }}
        onSizeChange={(value) => {
          setSize(value);
          setPage(0);
        }}
      />

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-lg ${
            notice.type ===
            "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <Loader2
              size={32}
              className="animate-spin text-primary-800"
            />

            <p className="mt-3 text-lg font-semibold text-gray-400">
              កំពុងទាញយក Weather Conditions...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle
                size={28}
              />
            </div>

            <p className="mt-4 text-2xl font-black text-gray-800">
              មិនអាចទាញយក Weather Conditions បានទេ
            </p>

            <p className="mt-2 max-w-xl whitespace-pre-wrap text-lg leading-7 text-gray-500">
              {getApiErrorMessage(
                error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                void refetch()
              }
              className="mt-5 rounded-full bg-primary-800 px-6 py-3 text-lg font-black text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : (
          <>
            <WeatherConditionTable
              items={
                pageItems
              }
              busy={
                busy
              }
              onView={(item) =>
                setDetailUuid(
                  item.uuid,
                )
              }
              onEdit={
                openEdit
              }
              onDeactivate={
                setDeactivateItem
              }
            />

            <WeatherConditionPagination
              page={safePage}
              totalPages={totalPages}
              totalElements={sortedItems.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <WeatherConditionFormModal
        open={
          formOpen
        }
        item={
          editingItem
        }
        saving={
          creating ||
          updating
        }
        onClose={
          closeForm
        }
        onSubmit={
          saveWeather
        }
      />

      <WeatherConditionDetailModal
        uuid={
          detailUuid
        }
        onToggleStatus={async (targetUuid, nextActive) => {
          await updateWeather({
            uuid: targetUuid,
            body: {
              isActive: nextActive,
            },
          }).unwrap();
          await refetch();
        }}
        onClose={() =>
          setDetailUuid(
            null,
          )
        }
      />

      <DeactivateWeatherConditionModal
        item={
          deactivateItem
        }
        deleting={
          deactivating
        }
        onClose={() => {
          if (
            deactivating
          ) {
            return;
          }

          setDeactivateItem(
            null,
          );
        }}
        onConfirm={() =>
          void confirmDeactivate()
        }
      />
    </div>
  );
}
