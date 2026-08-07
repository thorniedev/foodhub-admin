// "use client";

// import { useEffect, useState } from "react";
// import { X } from "lucide-react";
// import {
//   FILTER_GROUPS,
//   FilterGroupKey,
//   FilterOption,
// } from "../../../types/dynamicContent";

// interface DynamicContentFormModalProps {
//   open: boolean;
//   defaultGroup: FilterGroupKey;
//   initialData?: FilterOption | null;
//   nextOrder: number;
//   onClose: () => void;
//   onSubmit: (values: Omit<FilterOption, "id">) => void;
// }

// export default function DynamicContentFormModal({
//   open,
//   defaultGroup,
//   initialData,
//   nextOrder,
//   onClose,
//   onSubmit,
// }: DynamicContentFormModalProps) {
//   const [form, setForm] = useState<Omit<FilterOption, "id">>({
//     groupKey: defaultGroup,
//     label: "",
//     value: "",
//     order: nextOrder,
//     active: true,
//   });

//   useEffect(() => {
//     if (initialData) {
//       const { id, ...rest } = initialData;
//       setForm(rest);
//     } else {
//       setForm({
//         groupKey: defaultGroup,
//         label: "",
//         value: "",
//         order: nextOrder,
//         active: true,
//       });
//     }
//   }, [initialData, defaultGroup, nextOrder, open]);

//   if (!open) return null;

//   const handleSubmit = () => {
//     if (!form.label.trim() || !form.value.trim()) return;
//     onSubmit(form);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
//       <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-5">
//           <h2 className="text-base sm:text-lg font-bold text-gray-800">
//             {initialData ? "កែសម្រួលជម្រើស" : "បន្ថែមជម្រើសថ្មី"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">
//               ក្រុមជម្រើស
//             </label>
//             <select
//               value={form.groupKey}
//               onChange={(e) =>
//                 setForm({ ...form, groupKey: e.target.value as FilterGroupKey })
//               }
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             >
//               {FILTER_GROUPS.map((g) => (
//                 <option key={g.key} value={g.key}>
//                   {g.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">
//               ឈ្មោះបង្ហាញ (Khmer)
//             </label>
//             <input
//               type="text"
//               value={form.label}
//               onChange={(e) => setForm({ ...form, label: e.target.value })}
//               placeholder="ឧ. អាហារបួស"
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>

//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">
//               តម្លៃខាងក្នុង (value / key)
//             </label>
//             <input
//               type="text"
//               value={form.value}
//               onChange={(e) => setForm({ ...form, value: e.target.value })}
//               placeholder="ឧ. vegetarian"
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>

//           <div className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               id="active-toggle"
//               checked={form.active}
//               onChange={(e) => setForm({ ...form, active: e.target.checked })}
//               className="accent-emerald-600"
//             />
//             <label htmlFor="active-toggle" className="text-sm text-gray-600">
//               បង្ហាញនៅលើកម្មវិធីអតិថិជន
//             </label>
//           </div>
//         </div>

//         <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
//           >
//             បោះបង់
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
//           >
//             រក្សាទុក
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FilterGroup, FilterOption } from "../../../types/dynamicContent";

interface DynamicContentFormModalProps {
  open: boolean;
  groups: FilterGroup[];
  defaultGroup: string;
  initialData?: FilterOption | null;
  nextOrder: number;
  onClose: () => void;
  onSubmit: (values: Omit<FilterOption, "id">) => void;
}

export default function DynamicContentFormModal({
  open,
  groups,
  defaultGroup,
  initialData,
  nextOrder,
  onClose,
  onSubmit,
}: DynamicContentFormModalProps) {
  const [form, setForm] = useState<Omit<FilterOption, "id">>({
    groupKey: defaultGroup,
    label: "",
    value: "",
    order: nextOrder,
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setForm(rest);
    } else {
      setForm({ groupKey: defaultGroup, label: "", value: "", order: nextOrder, active: true });
    }
  }, [initialData, defaultGroup, nextOrder, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.label.trim() || !form.value.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            {initialData ? "កែសម្រួលជម្រើស" : "បន្ថែមជម្រើសថ្មី"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ក្រុមជម្រើស</label>
            <select
              value={form.groupKey}
              onChange={(e) => setForm({ ...form, groupKey: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {groups.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះបង្ហាញ (Khmer)</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="ឧ. អាហារបួស"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">តម្លៃខាងក្នុង (value / key)</label>
            <input
              type="text"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="ឧ. vegetarian"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-toggle"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="accent-emerald-600"
            />
            <label htmlFor="active-toggle" className="text-sm text-gray-600">
              បង្ហាញនៅលើកម្មវិធីអតិថិជន
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            បោះបង់
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}