"use client";

import {
  CloudRain,
  Loader2,
  X,
} from "lucide-react";

import {
  useGetWeatherConditionByUuidQuery,
} from "@/src/app/store/weatherConditionApi";

export default function WeatherConditionDetailModal({
  uuid,
  onClose,
}: {
  uuid: string | null;
  onClose: () => void;
}) {
  const {
    data,
    isLoading,
    isError,
  } =
    useGetWeatherConditionByUuidQuery(
      uuid ?? "",
      {
        skip:
          !uuid,
      },
    );

  if (!uuid) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-8 w-full max-w-xl rounded-[30px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary-800">
              <CloudRain
                size={22}
              />
            </div>

            <div>
              <p className="text-3xl font-black text-primary-800">
                Weather Detail
              </p>

              <p className="mt-1 text-lg text-gray-500">
                Get Weather Condition by UUID
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2
              size={28}
              className="animate-spin text-primary-800"
            />
          </div>
        ) : isError ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-lg text-red-600">
            មិនអាចទាញយក Weather Condition detail បានទេ។
          </div>
        ) : data ? (
          <div className="mt-6 space-y-4">
            <Row
              label="Code"
              value={
                data.code
              }
            />

            <Row
              label="Name"
              value={
                data.name
              }
            />

            <Row
              label="Local name"
              value={
                data.localName ||
                "—"
              }
            />

            <Row
              label="Description"
              value={
                data.description ||
                "—"
              }
            />

            <Row
              label="Status"
              value={
                data.isActive ??
                data.active ??
                true
                  ? "ACTIVE"
                  : "INACTIVE"
              }
            />

            <Row
              label="UUID"
              value={
                data.uuid
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-lg font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xl font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}
