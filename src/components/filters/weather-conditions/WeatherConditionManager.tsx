"use client";

import {
  AlertTriangle,
  Loader2,
  Search,
  X,
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
import WeatherConditionTable from "./WeatherConditionTable";

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

export default function WeatherConditionManager() {
  const [
    search,
    setSearch,
  ] = useState("");

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

  const filteredItems =
    useMemo(() => {
      const query =
        searchText(
          search,
        );

      if (!query) {
        return items;
      }

      return items.filter(
        (item) =>
          [
            item.code,
            item.name,
            item.localName,
            item.description,
          ].some(
            (value) =>
              searchText(
                value,
              ).includes(
                query,
              ),
          ),
      );
    }, [
      items,
      search,
    ]);

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
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <WeatherConditionHeader
        total={
          data?.totalElements ??
          items.length
        }
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

      <section className="rounded-[26px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-black text-primary-800">
              Active Weather Conditions
            </p>

            <p className="mt-1 text-lg text-gray-500">
              List endpoint បង្ហាញ Weather Conditions ដែល Active។
            </p>
          </div>

          <div className="relative w-full lg:w-[390px]">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="ស្វែងរក code, name, local name..."
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-lg outline-none transition focus:border-primary-700 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch(
                    "",
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X
                  size={
                    17
                  }
                />
              </button>
            )}
          </div>
        </div>
      </section>

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
          <WeatherConditionTable
            items={
              filteredItems
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
