"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings2, X } from "lucide-react";

import {
  useUpdateStoreAccountStatusMutation,
  useUpdateStoreOperatingStatusMutation,
  useUpdateStoreReviewStatusMutation,
} from "@/src/app/store/shop/shopApi";
import type { Store, StoreStatusAction } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import StoreSelect from "./StoreSelect";

export default function ShopStatusModal({
  store,
  initialAction = "REVIEW",
  onClose,
  onChanged,
}: {
  store: Store | null;
  initialAction?: StoreStatusAction;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [action, setAction] = useState<StoreStatusAction>(initialAction);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">(
    "APPROVED",
  );
  const [notes, setNotes] = useState("");
  const [account, setAccount] = useState("ACTIVE");
  const [operating, setOperating] = useState("OPEN");
  const [error, setError] = useState<string | null>(null);

  const [review, { isLoading: reviewLoading }] =
    useUpdateStoreReviewStatusMutation();
  const [accountUpdate, { isLoading: accountLoading }] =
    useUpdateStoreAccountStatusMutation();
  const [operatingUpdate, { isLoading: operatingLoading }] =
    useUpdateStoreOperatingStatusMutation();

  const loading = reviewLoading || accountLoading || operatingLoading;

  useEffect(() => {
    if (!store) return;

    setAction(initialAction);
    setReviewStatus(store.reviewStatus === "REJECTED" ? "REJECTED" : "APPROVED");
    setAccount(store.accountStatus || "ACTIVE");
    setOperating(store.operatingStatus || "OPEN");
    setNotes("");
    setError(null);
  }, [store, initialAction]);

  if (!store) return null;

  const save = async () => {
    try {
      setError(null);

      if (action === "REVIEW") {
        await review({
          storeUuid: store.uuid,
          body: { reviewStatus, notes: notes.trim() },
        }).unwrap();
      } else if (action === "ACCOUNT") {
        await accountUpdate({
          storeUuid: store.uuid,
          body: { accountStatus: account },
        }).unwrap();
      } else {
        await operatingUpdate({
          storeUuid: store.uuid,
          body: { operatingStatus: operating },
        }).unwrap();
      }

      await onChanged();
      onClose();
    } catch (requestError) {
      setError(getShopApiErrorMessage(requestError));
    }
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="flex items-center gap-3 text-4xl font-bold text-[#136C34]">
              <Settings2 size={28} />
              គ្រប់គ្រងស្ថានភាព
            </p>
            <p className="mt-1 text-base text-gray-500">{store.storeName}</p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-1.5">
            {(["REVIEW", "ACCOUNT", "OPERATING"] as StoreStatusAction[]).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAction(value)}
                  className={`rounded-xl px-3 py-2.5 text-base font-semibold transition ${
                    action === value
                      ? "bg-white text-[#137A3D] shadow-sm"
                      : "text-gray-500 hover:text-[#137A3D]"
                  }`}
                >
                  {value}
                </button>
              ),
            )}
          </div>

          <div className="mt-5">
            {action === "REVIEW" && (
              <div className="space-y-4">
                <label>
                  <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                    Review status
                  </span>
                  <StoreSelect
                    value={reviewStatus}
                    onChange={(value) =>
                      setReviewStatus(value as "APPROVED" | "REJECTED")
                    }
                    options={[
                      { value: "APPROVED", label: "APPROVED" },
                      { value: "REJECTED", label: "REJECTED" },
                    ]}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                    Review notes
                  </span>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="សរសេរកំណត់ចំណាំ..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
                  />
                </label>
              </div>
            )}

            {action === "ACCOUNT" && (
              <label>
                <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                  Account status
                </span>
                <StoreSelect
                  value={account}
                  onChange={setAccount}
                  options={[
                    { value: "ACTIVE", label: "ACTIVE" },
                    { value: "INACTIVE", label: "INACTIVE" },
                    { value: "SUSPENDED", label: "SUSPENDED" },
                  ]}
                />
              </label>
            )}

            {action === "OPERATING" && (
              <label>
                <span className="mb-2 block text-xl font-semibold text-[#F97316]">
                  Operating status
                </span>
                <StoreSelect
                  value={operating}
                  onChange={setOperating}
                  options={[
                    { value: "OPEN", label: "OPEN" },
                    { value: "CLOSED", label: "CLOSED" },
                    {
                      value: "TEMPORARILY_CLOSED",
                      label: "TEMPORARILY_CLOSED",
                    },
                    { value: "UNKNOWN", label: "UNKNOWN" },
                  ]}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-base text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {loading && <Loader2 size={17} className="animate-spin" />}
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
