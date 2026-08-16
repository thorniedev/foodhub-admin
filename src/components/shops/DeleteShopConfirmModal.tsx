"use client";

import { useEffect } from "react";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import type { Store } from "@/src/types/shop";

export default function DeleteShopConfirmModal({
  store,
  open,
  loading = false,
  onClose,
  onConfirm,
}: {
  store: Store | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  /* =========================================================
     MODAL UX
  ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open || !store) {
    return null;
  }

  const address =
    [store.addressLine, store.city].filter(Boolean).join(", ") ||
    "មិនមានអាសយដ្ឋាន";

  return (
    <div
      className="
        fixed
        inset-0
        z-[150]
        flex
        items-center
        justify-center
        bg-black/45
        p-4
        backdrop-blur-[3px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-store-title"
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-2xl
          animate-in
          fade-in
          zoom-in-95
          duration-150
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-gray-100
            px-6
            py-5
            sm:px-8
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <Trash2 size={23} />
            </div>

            <div className="min-w-0">
              <p
                id="delete-store-title"
                className="
                  text-3xl
                  font-semibold
                  leading-tight
                  text-gray-900
                "
              >
                លុប Store
              </p>

              <p
                className="
                  mt-2
                  text-lg
                  leading-7
                  text-gray-500
                "
              >
                សូមពិនិត្យព័ត៌មានឱ្យបានច្បាស់ មុនពេលបញ្ជាក់ការលុប។
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close"
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
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

        {/* =================================================
            BODY
        ================================================== */}

        <div className="space-y-5 p-6 sm:p-8">
          {/* CONFIRMATION */}

          <div>
            <p
              className="
                text-xl
                font-semibold
                leading-8
                text-gray-900
              "
            >
              តើអ្នកប្រាកដជាចង់លុប Store នេះមែនទេ?
            </p>

            <p
              className="
                mt-2
                text-lg
                leading-8
                text-gray-500
              "
            >
              Store នេះនឹងត្រូវដកចេញពីប្រព័ន្ធ បន្ទាប់ពីអ្នកបញ្ជាក់។
            </p>
          </div>

          {/* =================================================
              STORE INFORMATION
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              border-gray-100
              bg-gray-50
              p-5
            "
          >
            <p
              className="
                text-xl
                font-semibold
                text-primary-800
              "
            >
              {store.storeName}
            </p>

            <p
              className="
                mt-2
                text-lg
                leading-7
                text-gray-500
              "
            >
              {address}
            </p>
          </div>

          {/* =================================================
              WARNING
          ================================================== */}

          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-4
            "
          >
            <AlertTriangle
              size={22}
              className="
                mt-0.5
                shrink-0
                text-red-600
              "
            />

            <p
              className="
                text-lg
                leading-8
                text-red-700
              "
            >
              ទិន្នន័យទាំងអស់របស់ហាងនេះ នឹងត្រូវលុបចេញពីប្រព័ន្ធជាអចិន្ត្រៃយ៍។
              សកម្មភាពនេះមិនអាច Undo បានទេ។
            </p>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-gray-100
            bg-white
            px-6
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:px-8
          "
        >
          {/* CANCEL */}

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              inline-flex
              min-h-[52px]
              w-full
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
              hover:bg-gray-50
              hover:text-gray-800
              focus:outline-none
              focus:ring-4
              focus:ring-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            បោះបង់
          </button>

          {/* DELETE */}

          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className="
              inline-flex
              min-h-[52px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-red-600
              px-7
              text-lg
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-red-700
              focus:outline-none
              focus:ring-4
              focus:ring-red-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Trash2 size={20} />
            )}

            {loading ? "កំពុងលុប..." : "លុប Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
