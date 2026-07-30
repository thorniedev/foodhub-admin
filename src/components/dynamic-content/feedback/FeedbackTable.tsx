"use client";

import Image from "next/image";
import { Pencil, RefreshCcw, Star, Trash2, User } from "lucide-react";
import { Feedback } from "@/src/types/feedback";

interface FeedbackTableProps {
  data: Feedback[];
  onEdit: (item: Feedback) => void;
  onDelete: (item: Feedback) => void;
  onCycleStatus: (item: Feedback) => void;
}

const STATUS_BADGE: Record<Feedback["status"], string> = {
  new: "bg-blue-50 text-blue-600",
  reviewed: "bg-amber-50 text-amber-600",
  resolved: "bg-emerald-50 text-emerald-600",
};

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

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }
        />
      ))}
    </div>
  );
}

export default function FeedbackTable({
  data,
  onEdit,
  onDelete,
  onCycleStatus,
}: FeedbackTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="py-3 px-4 font-medium">អតិថិជន</th>
            <th className="py-3 px-4 font-medium">សារ</th>
            <th className="py-3 px-4 font-medium">ការវាយតម្លៃ</th>
            <th className="py-3 px-4 font-medium">ប្រភេទ</th>
            <th className="py-3 px-4 font-medium">ស្ថានភាព</th>
            <th className="py-3 px-4 font-medium text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 align-top"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.avatar ? (
                      <Image
                        src={item.avatar}
                        alt={item.customerName}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.customerName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("km-KH")}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-500 max-w-md">
                {item.message}
              </td>
              <td className="py-3 px-4">
                <RatingStars rating={item.rating} />
              </td>
              <td className="py-3 px-4 text-gray-600">
                {CATEGORY_LABEL[item.category]}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    STATUS_BADGE[item.status]
                  }`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onCycleStatus(item)}
                    title="ប្តូរស្ថានភាព"
                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    title="កែសម្រួល"
                    className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    title="លុប"
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
