"use client";

import { Loader2, X } from "lucide-react";
import {
  useGetPublishedMenuItemDetailQuery,
} from "@/src/app/store/menuManagementApi";

export default function MenuItemDetailModal({
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
  } = useGetPublishedMenuItemDetailQuery(
    uuid ?? "",
    {
      skip: !uuid,
    },
  );

  if (!uuid) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-8 w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Menu Item Detail
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Public rich detail endpoint
            </p>
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
          <div className="flex min-h-52 items-center justify-center">
            <Loader2
              size={28}
              className="animate-spin text-[#137A3D]"
            />
          </div>
        ) : isError ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            មិនអាចទាញយក Detail បានទេ។
          </div>
        ) : (
          <pre className="mt-6 max-h-[65vh] overflow-auto rounded-2xl bg-gray-950 p-4 text-xs leading-6 text-gray-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
