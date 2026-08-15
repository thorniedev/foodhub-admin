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

  /*
   * Load current store status data
   * whenever the modal opens for a store.
   */
  useEffect(() => {
    if (!store) return;

    setAction(initialAction);

    setReviewStatus(
      store.reviewStatus === "REJECTED" ? "REJECTED" : "APPROVED",
    );

    setAccount(store.accountStatus || "ACTIVE");

    setOperating(store.operatingStatus || "OPEN");

    setNotes("");
    setError(null);
  }, [store, initialAction]);

  /*
   * Prevent the page behind the modal
   * from scrolling while the popup is open.
   */
  useEffect(() => {
    if (!store) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [store]);

  if (!store) return null;

  const save = async () => {
    try {
      setError(null);

      if (action === "REVIEW") {
        await review({
          storeUuid: store.uuid,
          body: {
            reviewStatus,
            notes: notes.trim(),
          },
        }).unwrap();
      } else if (action === "ACCOUNT") {
        await accountUpdate({
          storeUuid: store.uuid,
          body: {
            accountStatus: account,
          },
        }).unwrap();
      } else {
        await operatingUpdate({
          storeUuid: store.uuid,
          body: {
            operatingStatus: operating,
          },
        }).unwrap();
      }

      await onChanged();

      onClose();
    } catch (requestError) {
      setError(getShopApiErrorMessage(requestError));
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[125]
        flex items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-[3px]
      "
    >
      {/* Modal */}
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-2xl

          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            sticky top-0 z-30
            flex items-center
            justify-between
            border-b
            border-gray-100
            bg-white/95
            px-6 py-5
            backdrop-blur-md
            sm:px-8
          "
        >
          <div
            className="
              flex min-w-0
              items-center
              gap-4
            "
          >
            <div
              className="
                flex h-12 w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              <Settings2 size={24} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-3xl
                  font-semibold
                  text-primary-800
                "
              >
                គ្រប់គ្រងស្ថានភាព
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-lg
                  text-gray-500
                "
              >
                {store.storeName}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close"
            className="
              flex h-11 w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-4
              focus:ring-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div
          className="
            space-y-6
            p-6
            sm:p-8
          "
        >
          {/* Status tabs */}
          <div
            className="
              grid
              grid-cols-3
              gap-2
              rounded-full
              bg-gray-50
              p-1.5
            "
          >
            {(["REVIEW", "ACCOUNT", "OPERATING"] as StoreStatusAction[]).map(
              (value) => {
                const active = action === value;

                const isReview = value === "REVIEW";

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAction(value)}
                    className={`
                    min-h-11
                    rounded-full
                    px-3
                    text-lg
                    font-medium
                    transition
                    focus:outline-none
                    focus:ring-4
                    ${
                      active
                        ? isReview
                          ? "bg-secondary-50 text-secondary-700 shadow-sm focus:ring-secondary-100"
                          : "bg-white text-primary-800 shadow-sm focus:ring-primary-100"
                        : "text-gray-500 hover:bg-white hover:text-primary-800 focus:ring-gray-100"
                    }
                  `}
                  >
                    {value}
                  </button>
                );
              },
            )}
          </div>

          {/* Status form */}
          <section
            className="
              rounded-2xl
              border
              border-gray-100
              bg-white
              p-5
              sm:p-6
            "
          >
            {action === "REVIEW" && (
              <div className="space-y-5">
                <div>
                  <p
                    className="
                      text-3xl
                      font-semibold
                      text-primary-800
                    "
                  >
                    Review status
                  </p>

                  <p
                    className="
                      mt-1
                      text-base
                      leading-6
                      text-gray-500
                    "
                  >
                    ពិនិត្យ និងកំណត់ស្ថានភាពអនុម័តរបស់ហាង។
                  </p>
                </div>

                <label className="block">
                  <FieldLabel>Review status</FieldLabel>

                  <StoreSelect
                    value={reviewStatus}
                    onChange={(value) =>
                      setReviewStatus(value as "APPROVED" | "REJECTED")
                    }
                    options={[
                      {
                        value: "APPROVED",
                        label: "APPROVED",
                      },
                      {
                        value: "REJECTED",
                        label: "REJECTED",
                      },
                    ]}
                  />
                </label>

                <label className="block">
                  <FieldLabel>Review notes</FieldLabel>

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="សរសេរកំណត់ចំណាំ..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      px-4 py-3.5
                      text-lg
                      leading-7
                      text-gray-800
                      outline-none
                      transition
                      placeholder:text-gray-400
                      hover:border-gray-300
                      focus:border-secondary-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-secondary-100
                    "
                  />
                </label>
              </div>
            )}

            {action === "ACCOUNT" && (
              <div className="space-y-5">
                <div>
                  <p
                    className="
                      text-3xl
                      font-semibold
                      text-primary-800
                    "
                  >
                    Account status
                  </p>

                  <p
                    className="
                      mt-1
                      text-base
                      leading-6
                      text-gray-500
                    "
                  >
                    គ្រប់គ្រងស្ថានភាពគណនីរបស់ហាង។
                  </p>
                </div>

                <label className="block">
                  <FieldLabel>Account status</FieldLabel>

                  <StoreSelect
                    value={account}
                    onChange={setAccount}
                    options={[
                      {
                        value: "ACTIVE",
                        label: "ACTIVE",
                      },
                      {
                        value: "INACTIVE",
                        label: "INACTIVE",
                      },
                      {
                        value: "SUSPENDED",
                        label: "SUSPENDED",
                      },
                    ]}
                  />
                </label>
              </div>
            )}

            {action === "OPERATING" && (
              <div className="space-y-5">
                <div>
                  <p
                    className="
                      text-3xl
                      font-semibold
                      text-primary-800
                    "
                  >
                    Operating status
                  </p>

                  <p
                    className="
                      mt-1
                      text-base
                      leading-6
                      text-gray-500
                    "
                  >
                    កំណត់ស្ថានភាពបើក ឬបិទដំណើរការរបស់ហាង។
                  </p>
                </div>

                <label className="block">
                  <FieldLabel>Operating status</FieldLabel>

                  <StoreSelect
                    value={operating}
                    onChange={setOperating}
                    options={[
                      {
                        value: "OPEN",
                        label: "OPEN",
                      },
                      {
                        value: "CLOSED",
                        label: "CLOSED",
                      },
                      {
                        value: "TEMPORARILY_CLOSED",
                        label: "TEMPORARILY_CLOSED",
                      },
                      {
                        value: "UNKNOWN",
                        label: "UNKNOWN",
                      },
                    ]}
                  />
                </label>
              </div>
            )}
          </section>

          {/* Error */}
          {error && (
            <div
              className="
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-5 py-4
                text-lg
                leading-7
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* ================= ACTIONS ================= */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-gray-100
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                bg-white
                px-7
                text-lg
                font-medium
                text-gray-600
                transition
                hover:border-primary-200
                hover:bg-primary-50
                hover:text-primary-800
                focus:outline-none
                focus:ring-4
                focus:ring-primary-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void save()}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                bg-primary-800
                px-7
                text-lg
                font-medium
                text-white
                transition
                hover:bg-primary-900
                focus:outline-none
                focus:ring-4
                focus:ring-primary-200
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        mb-2
        block
        text-lg
        font-medium
        text-primary-800
      "
    >
      {children}
    </span>
  );
}
