"use client";

import Image from "next/image";

import {
  MessageSquareText,
  Pencil,
  RefreshCcw,
  Star,
  Trash2,
  User,
} from "lucide-react";

import type { Feedback } from "@/src/types/feedback";

/* =========================================================
   PROPS
========================================================= */

interface FeedbackTableProps {
  data: Feedback[];
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onCycleStatus: (item: Feedback) => void;
}

/* =========================================================
   LABELS
========================================================= */

const STATUS_LABEL: Record<Feedback["status"], string> = {
  new: "ថ្មី",
  reviewed: "បានពិនិត្យ",
  resolved: "បានដោះស្រាយ",
};

const CATEGORY_LABEL: Record<Feedback["category"], string> = {
  app: "កម្មវិធី",
  food_quality: "គុណភាពអាហារ",
  delivery: "ការដឹកជញ្ជូន",
  service: "សេវាកម្ម",
};

/* =========================================================
   FEEDBACK TABLE

   UI:
   - text-lg minimum normal text
   - text-xl table headings
   - no h1-h6
   - table fits available width
   - no horizontal scrolling
   - long content truncates/wraps inside columns
========================================================= */

export default function FeedbackTable({
  data,
  onEdit,
  onDelete,
  onCycleStatus,
}: FeedbackTableProps) {
  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (data.length === 0) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-gray-100 bg-white px-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
          <MessageSquareText size={30} />
        </div>

        <p className="mt-4 text-2xl font-semibold text-primary-800">
          មិនមានទិន្នន័យ
        </p>

        <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
          មិនទាន់មានមតិកែលម្អដែលត្រូវបង្ហាញនៅពេលនេះទេ។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <table className="w-full table-fixed border-collapse text-left">
        {/* =================================================
            COLUMN WIDTHS
        ================================================== */}

        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[27%]" />
          <col className="w-[13%]" />
          <col className="w-[14%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
        </colgroup>

        {/* =================================================
            TABLE HEADER
        ================================================== */}

        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              អតិថិជន
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              សារ
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              ការវាយតម្លៃ
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              ប្រភេទ
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              ស្ថានភាព
            </th>

            <th className="px-4 py-4 text-right text-xl font-semibold text-primary-800">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* =================================================
            TABLE BODY
        ================================================== */}

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="
                  border-b
                  border-gray-100
                  bg-white
                  align-middle
                  transition-colors
                  duration-150
                  last:border-b-0
                  hover:bg-gray-50/70
                "
            >
              {/* =========================================
                    CUSTOMER
                ========================================== */}

              <td className="min-w-0 px-4 py-5">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-primary-50">
                    {item.avatar ? (
                      <Image
                        src={item.avatar}
                        alt={item.customerName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <User size={21} className="text-primary-700" />
                    )}
                  </div>

                  {/* Customer info */}
                  <div className="min-w-0 flex-1">
                    <p
                      title={item.customerName}
                      className="truncate text-lg font-semibold text-gray-800"
                    >
                      {item.customerName}
                    </p>

                    <p className="mt-1 truncate text-lg text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("km-KH")}
                    </p>
                  </div>
                </div>
              </td>

              {/* =========================================
                    MESSAGE
                ========================================== */}

              <td className="min-w-0 px-4 py-5">
                <p
                  title={item.message}
                  className="
                      line-clamp-2
                      break-words
                      text-lg
                      leading-7
                      text-gray-600
                    "
                >
                  {item.message}
                </p>
              </td>

              {/* =========================================
                    RATING
                ========================================== */}

              <td className="px-4 py-5">
                <RatingStars rating={item.rating} />
              </td>

              {/* =========================================
                    CATEGORY
                ========================================== */}

              <td className="min-w-0 px-4 py-5">
                <p
                  title={CATEGORY_LABEL[item.category]}
                  className="truncate text-lg font-medium text-gray-600"
                >
                  {CATEGORY_LABEL[item.category]}
                </p>
              </td>

              {/* =========================================
                    STATUS
                ========================================== */}

              <td className="min-w-0 px-4 py-5">
                <StatusBadge status={item.status} />
              </td>

              {/* =========================================
                    ACTIONS
                ========================================== */}

              <td className="px-4 py-5">
                <div className="flex items-center justify-end gap-1.5">
                  {/* Change status */}
                  <button
                    type="button"
                    onClick={() => onCycleStatus(item)}
                    title="ប្តូរស្ថានភាព"
                    aria-label="Change feedback status"
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-primary-700
                        transition
                        hover:bg-primary-50
                        focus:outline-none
                        focus:ring-4
                        focus:ring-primary-100
                      "
                  >
                    <RefreshCcw size={20} />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    title="កែសម្រួល"
                    aria-label="Edit feedback"
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-blue-500
                        transition
                        hover:bg-blue-50
                        focus:outline-none
                        focus:ring-4
                        focus:ring-blue-100
                      "
                  >
                    <Pencil size={20} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    title="លុប"
                    aria-label="Delete feedback"
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-red-500
                        transition
                        hover:bg-red-50
                        focus:outline-none
                        focus:ring-4
                        focus:ring-red-100
                      "
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   RATING STARS
========================================================= */

function RatingStars({ rating }: { rating: number }) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {Array.from(
          {
            length: 5,
          },
          (_, index) => (
            <Star
              key={index}
              size={18}
              className={
                index < normalizedRating
                  ? "fill-secondary-400 text-secondary-400"
                  : "text-gray-200"
              }
            />
          ),
        )}
      </div>

      <p className="text-lg font-medium text-gray-500">
        {Number(rating).toFixed(1)}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: Feedback["status"] }) {
  const styles: Record<
    Feedback["status"],
    {
      container: string;
      dot: string;
    }
  > = {
    new: {
      container: "bg-blue-50 text-blue-600 ring-blue-100",
      dot: "bg-blue-500",
    },

    reviewed: {
      container: "bg-secondary-50 text-secondary-600 ring-secondary-100",
      dot: "bg-secondary-500",
    },

    resolved: {
      container: "bg-primary-50 text-primary-700 ring-primary-100",
      dot: "bg-primary-600",
    },
  };

  const style = styles[status];

  return (
    <span
      className={`
        inline-flex
        max-w-full
        items-center
        gap-2
        rounded-full
        px-3
        py-1.5
        text-lg
        font-medium
        ring-1
        ring-inset
        ${style.container}
      `}
    >
      <span
        className={`
          h-2
          w-2
          shrink-0
          rounded-full
          ${style.dot}
        `}
      />

      <span className="min-w-0 truncate">{STATUS_LABEL[status]}</span>
    </span>
  );
}
