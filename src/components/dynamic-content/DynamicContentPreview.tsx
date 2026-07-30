"use client";

import { FILTER_GROUPS, FilterOption } from "../../types/dynamicContent";

// import { FILTER_GROUPS, FilterOption } from "@/types/dynamicContent";

interface DynamicContentPreviewProps {
  data: FilterOption[];
  open: boolean;
  onClose: () => void;
}

export default function DynamicContentPreview({
  data,
  open,
  onClose,
}: DynamicContentPreviewProps) {
  if (!open) return null;

  const activeOnly = data.filter((o) => o.active);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">
            ការមើលជាមុននៃកម្មវិធីអតិថិជន
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">
            បិទ
          </button>
        </div>

        {FILTER_GROUPS.map((group) => {
          const items = activeOnly
            .filter((o) => o.groupKey === group.key)
            .sort((a, b) => a.order - b.order);

          if (items.length === 0) return null;

          return (
            <div key={group.key} className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-gray-600"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}