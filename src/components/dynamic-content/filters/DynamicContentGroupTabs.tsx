// "use client";

// import {
//   FILTER_GROUPS,
//   FilterGroupKey,
//   FilterOption,
// } from "../../../types/dynamicContent";

// interface DynamicContentGroupTabsProps {
//   data: FilterOption[];
//   activeGroup: FilterGroupKey;
//   onGroupChange: (group: FilterGroupKey) => void;
// }

// export default function DynamicContentGroupTabs({
//   data,
//   activeGroup,
//   onGroupChange,
// }: DynamicContentGroupTabsProps) {
//   const countFor = (key: FilterGroupKey) =>
//     data.filter((o) => o.groupKey === key).length;

//   return (
//     <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
//       {FILTER_GROUPS.map((group) => (
//         <button
//           key={group.key}
//           onClick={() => onGroupChange(group.key)}
//           className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap shrink-0 ${
//             activeGroup === group.key
//               ? "bg-[#136C34] text-white"
//               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//           }`}
//         >
//           {group.label}
//           <span
//             className={`text-xs rounded-full px-1.5 py-0.5 ${
//               activeGroup === group.key
//                 ? "bg-white/20 text-white"
//                 : "bg-white text-gray-500"
//             }`}
//           >
//             {countFor(group.key)}
//           </span>
//         </button>
//       ))}
//     </div>

//   );
// }


"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { FilterGroup, FilterOption } from "../../../types/dynamicContent";
import FilterGroupFormModal from "./FilterGroupFormModal";
// import FilterGroupFormModal from "./FilterGroupFormModal";

interface DynamicContentGroupTabsProps {
  groups: FilterGroup[];
  data: FilterOption[];
  activeGroup: string;
  onGroupChange: (group: string) => void;
  onAddGroup: (label: string) => void;
  onRenameGroup: (key: string, label: string) => void;
  onDeleteGroup: (key: string) => void;
}

export default function DynamicContentGroupTabs({
  groups,
  data,
  activeGroup,
  onGroupChange,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
}: DynamicContentGroupTabsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FilterGroup | null>(null);

  const countFor = (key: string) => data.filter((o) => o.groupKey === key).length;

  const handleAddClick = () => {
    setEditingGroup(null);
    setModalOpen(true);
  };

  const handleEditClick = (group: FilterGroup) => {
    setEditingGroup(group);
    setModalOpen(true);
  };

  const handleSubmit = (label: string) => {
    if (editingGroup) {
      onRenameGroup(editingGroup.key, label);
    } else {
      onAddGroup(label);
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {groups.map((group) => {
          const isActive = activeGroup === group.key;
          return (
            <div key={group.key} className="flex items-center shrink-0">
              <button
                onClick={() => onGroupChange(group.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                  isActive ? "bg-[#136C34] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {group.label}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {countFor(group.key)}
                </span>
              </button>

              {isActive && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => handleEditClick(group)}
                    title="ប្តូរឈ្មោះក្រុម"
                    className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteGroup(group.key)}
                    title="លុបក្រុមនេះ"
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={handleAddClick}
          title="បន្ថែមក្រុមត្រងថ្មី"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>

      <FilterGroupFormModal
        open={modalOpen}
        initialLabel={editingGroup?.label ?? ""}
        title={editingGroup ? "ប្តូរឈ្មោះក្រុមត្រង" : "បន្ថែមក្រុមត្រងថ្មី"}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}