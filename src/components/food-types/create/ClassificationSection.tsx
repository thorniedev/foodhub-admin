// // "use client";

// // import { useState } from "react";
// // import { Plus, Tags, X } from "lucide-react";

// // import type {
// //   AgeGroupKey,
// //   DietSuitabilityKey,
// //   FoodCategoryKey,
// // } from "@/src/types/createFood";

// // interface ClassificationSectionProps {
// //   category: FoodCategoryKey;
// //   onCategoryChange: (value: FoodCategoryKey) => void;
// //   ageGroups: AgeGroupKey[];
// //   onAgeGroupsChange: (value: AgeGroupKey[]) => void;
// //   dietSuitability: DietSuitabilityKey[];
// //   onDietSuitabilityChange: (value: DietSuitabilityKey[]) => void;
// //   customTags: string[];
// //   onCustomTagsChange: (value: string[]) => void;
// // }

// // const CATEGORY_OPTIONS: Array<{
// //   value: FoodCategoryKey;
// //   label: string;
// // }> = [
// //   { value: "khmerFood", label: "ម្ហូបខ្មែរ" },
// //   { value: "fastFood", label: "អាហាររហ័ស" },
// //   { value: "chineseFood", label: "ម្ហូបចិន" },
// //   { value: "other", label: "ផ្សេងៗ" },
// // ];

// // const AGE_OPTIONS: Array<{
// //   value: AgeGroupKey;
// //   label: string;
// // }> = [
// //   { value: "infant0to6m", label: "0–6 ខែ" },
// //   { value: "infant6to12m", label: "6–12 ខែ" },
// //   { value: "toddler1to3y", label: "1–3 ឆ្នាំ" },
// //   { value: "child4to12y", label: "4–12 ឆ្នាំ" },
// //   { value: "teen13to17y", label: "13–17 ឆ្នាំ" },
// //   { value: "adult18to59y", label: "18–59 ឆ្នាំ" },
// //   { value: "elderly60plus", label: "60 ឆ្នាំឡើង" },
// // ];

// // const DIET_OPTIONS: Array<{
// //   value: DietSuitabilityKey;
// //   label: string;
// // }> = [
// //   { value: "halal", label: "ហាឡាល់" },
// //   { value: "glutenFree", label: "គ្មានជាតិ Gluten" },
// //   { value: "vegetarian", label: "បួស" },
// //   { value: "dairyFree", label: "គ្មានទឹកដោះគោ" },
// //   { value: "nutFree", label: "គ្មានគ្រាប់ធញ្ញជាតិ" },
// //   { value: "lowCarb", label: "កាបូអ៊ីដ្រាតទាប" },
// // ];

// // function toggleValue<T extends string>(current: T[], value: T): T[] {
// //   return current.includes(value)
// //     ? current.filter((item) => item !== value)
// //     : [...current, value];
// // }

// // export default function ClassificationSection({
// //   category,
// //   onCategoryChange,
// //   ageGroups,
// //   onAgeGroupsChange,
// //   dietSuitability,
// //   onDietSuitabilityChange,
// //   customTags,
// //   onCustomTagsChange,
// // }: ClassificationSectionProps) {
// //   const [customTag, setCustomTag] = useState("");

// //   const addCustomTag = () => {
// //     const normalizedTag = customTag.trim();

// //     if (!normalizedTag || customTags.includes(normalizedTag)) {
// //       return;
// //     }

// //     onCustomTagsChange([...customTags, normalizedTag]);
// //     setCustomTag("");
// //   };

// //   return (
// //     <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
// //       <div className="flex items-center gap-2">
// //         <Tags size={20} className="text-[#136C34]" />
// //         <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
// //           ការចាត់ថ្នាក់
// //         </h2>
// //       </div>

// //       <div>
// //         <label
// //           htmlFor="food-category"
// //           className="mb-2 block text-sm font-medium text-gray-600"
// //         >
// //           ប្រភេទម្ហូប
// //         </label>

// //         <select
// //           id="food-category"
// //           value={category}
// //           onChange={(event) =>
// //             onCategoryChange(event.target.value as FoodCategoryKey)
// //           }
// //           className="w-full rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
// //         >
// //           {CATEGORY_OPTIONS.map((option) => (
// //             <option key={option.value} value={option.value}>
// //               {option.label}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       <div>
// //         <p className="mb-3 text-sm font-medium text-gray-600">
// //           សាកសមសម្រាប់ក្រុមអាយុ
// //         </p>

// //         <div className="flex flex-wrap gap-2">
// //           {AGE_OPTIONS.map((option) => {
// //             const selected = ageGroups.includes(option.value);

// //             return (
// //               <button
// //                 key={option.value}
// //                 type="button"
// //                 onClick={() =>
// //                   onAgeGroupsChange(toggleValue(ageGroups, option.value))
// //                 }
// //                 className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
// //                   selected
// //                     ? "border-[#136C34] bg-[#136C34] text-white"
// //                     : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
// //                 }`}
// //               >
// //                 {option.label}
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       <div>
// //         <p className="mb-3 text-sm font-medium text-gray-600">
// //           សាកសមសម្រាប់របបអាហារ
// //         </p>

// //         <div className="flex flex-wrap gap-2">
// //           {DIET_OPTIONS.map((option) => {
// //             const selected = dietSuitability.includes(option.value);

// //             return (
// //               <button
// //                 key={option.value}
// //                 type="button"
// //                 onClick={() =>
// //                   onDietSuitabilityChange(
// //                     toggleValue(dietSuitability, option.value),
// //                   )
// //                 }
// //                 className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
// //                   selected
// //                     ? "border-[#136C34] bg-[#136C34] text-white"
// //                     : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
// //                 }`}
// //               >
// //                 {option.label}
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       <div>
// //         <label
// //           htmlFor="custom-tag"
// //           className="mb-2 block text-sm font-medium text-gray-600"
// //         >
// //           គ្រឿងផ្សំ ឬស្លាកបន្ថែម
// //         </label>

// //         <div className="flex gap-2">
// //           <input
// //             id="custom-tag"
// //             value={customTag}
// //             onChange={(event) => setCustomTag(event.target.value)}
// //             onKeyDown={(event) => {
// //               if (event.key === "Enter") {
// //                 event.preventDefault();
// //                 addCustomTag();
// //               }
// //             }}
// //             placeholder="បញ្ចូលគ្រឿងផ្សំ..."
// //             className="min-w-0 flex-1 rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
// //           />

// //           <button
// //             type="button"
// //             onClick={addCustomTag}
// //             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#136C34] text-white hover:bg-emerald-700"
// //             aria-label="Add custom tag"
// //           >
// //             <Plus size={18} />
// //           </button>
// //         </div>

// //         {customTags.length > 0 && (
// //           <div className="mt-3 flex flex-wrap gap-2">
// //             {customTags.map((tag) => (
// //               <span
// //                 key={tag}
// //                 className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700"
// //               >
// //                 {tag}
// //                 <button
// //                   type="button"
// //                   onClick={() =>
// //                     onCustomTagsChange(
// //                       customTags.filter((currentTag) => currentTag !== tag),
// //                     )
// //                   }
// //                   aria-label={`Remove ${tag}`}
// //                 >
// //                   <X size={13} />
// //                 </button>
// //               </span>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </section>
// //   );
// // }



// "use client";

// import {
//   ChevronDown,
//   Search,
//   Tags,
// } from "lucide-react";

// import {
//   useMemo,
//   useState,
// } from "react";

// import {
//   FILTER_GROUPS,
// } from "@/src/config/filterCatalog";

// import {
//   useFilterCatalog,
// } from "@/src/hooks/useFilterCatalog";

// import {
//   useGetAllergensQuery,
// } from "@/src/app/store/allergenApi";

// import {
//   useGetDietaryTypesQuery,
// } from "@/src/app/store/dietaryTypeApi";

// import {
//   useGetMedicalConditionsQuery,
// } from "@/src/app/store/medicalConditionApi";

// import type {
//   ClassificationSelections,
//   FilterGroupDefinition,
// } from "@/src/types/filterCatalog";

// interface ClassificationOptionView {
//   uuid: string;
//   code: string;
//   label: string;
//   description?: string | null;
//   active: boolean;
// }

// interface ClassificationSectionProps {
//   values: ClassificationSelections;
//   onChange: (
//     values: ClassificationSelections,
//   ) => void;
// }

// export default function ClassificationSection({
//   values,
//   onChange,
// }: ClassificationSectionProps) {
//   const { options: localOptions } =
//     useFilterCatalog();

//   const {
//     data: allergenData,
//     isFetching: allergensLoading,
//   } = useGetAllergensQuery({
//     page: 0,
//     size: 100,
//   });

//   const {
//     data: dietaryData,
//     isFetching: dietaryLoading,
//   } = useGetDietaryTypesQuery({
//     page: 0,
//     size: 100,
//   });

//   const {
//     data: medicalData,
//     isFetching: medicalLoading,
//   } = useGetMedicalConditionsQuery({
//     page: 0,
//     size: 100,
//   });

//   const optionMap =
//     useMemo(() => {
//       const map: Record<
//         string,
//         ClassificationOptionView[]
//       > = {};

//       for (const group of FILTER_GROUPS) {
//         if (
//           group.source ===
//           "LOCAL"
//         ) {
//           map[group.code] =
//             localOptions
//               .filter(
//                 (item) =>
//                   item.groupCode ===
//                     group.code &&
//                   item.active,
//               )
//               .map(
//                 (item) => ({
//                   uuid: item.uuid,
//                   code: item.code,
//                   label:
//                     item.localName ||
//                     item.name,
//                   description:
//                     item.description,
//                   active:
//                     item.active,
//                 }),
//               );

//           continue;
//         }

//         if (
//           group.source ===
//           "ALLERGEN_API"
//         ) {
//           map[group.code] =
//             (
//               allergenData?.contents ??
//               []
//             )
//               .filter(
//                 (item) =>
//                   item.active,
//               )
//               .map(
//                 (item) => ({
//                   uuid: item.uuid,
//                   code: item.code,
//                   label:
//                     item.code ||
//                     item.name,
//                   description:
//                     item.description,
//                   active:
//                     item.active,
//                 }),
//               );

//           continue;
//         }

//         if (
//           group.source ===
//           "DIETARY_TYPE_API"
//         ) {
//           map[group.code] =
//             (
//               dietaryData?.contents ??
//               []
//             )
//               .filter(
//                 (item) =>
//                   item.active,
//               )
//               .map(
//                 (item) => ({
//                   uuid: item.uuid,
//                   code: item.code,
//                   label:
//                     item.name ||
//                     item.code,
//                   description:
//                     item.description,
//                   active:
//                     item.active,
//                 }),
//               );

//           continue;
//         }

//         if (
//           group.source ===
//           "MEDICAL_CONDITION_API"
//         ) {
//           map[group.code] =
//             (
//               medicalData?.contents ??
//               []
//             )
//               .filter(
//                 (item) =>
//                   item.active,
//               )
//               .map(
//                 (item) => ({
//                   uuid: item.uuid,
//                   code: item.code,
//                   label:
//                     item.name ||
//                     item.code,
//                   description:
//                     item.description,
//                   active:
//                     item.active,
//                 }),
//               );
//         }
//       }

//       return map;
//     }, [
//       localOptions,
//       allergenData,
//       dietaryData,
//       medicalData,
//     ]);

//   const toggle = (
//     group: FilterGroupDefinition,
//     code: string,
//   ) => {
//     const current =
//       values[group.code] ??
//       [];

//     if (
//       group.selectionMode ===
//       "SINGLE"
//     ) {
//       onChange({
//         ...values,
//         [group.code]:
//           current.includes(code)
//             ? []
//             : [code],
//       });

//       return;
//     }

//     onChange({
//       ...values,
//       [group.code]:
//         current.includes(code)
//           ? current.filter(
//               (value) =>
//                 value !== code,
//             )
//           : [
//               ...current,
//               code,
//             ],
//     });
//   };

//   const loading =
//     allergensLoading ||
//     dietaryLoading ||
//     medicalLoading;

//   return (
//     <section className="space-y-6 rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
//       <div>
//         <div className="flex items-center gap-3">
//           <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
//             <Tags size={22} />
//           </div>

//           <div>
//             <h2 className="text-3xl font-bold text-[#136C34]">
//               ការចាត់ថ្នាក់
//             </h2>

//             <p className="mt-1 text-base text-gray-500">
//               ជ្រើសរើសស្លាកត្រងទាំងអស់ដែលទាក់ទងនឹងម្ហូបនេះ។
//             </p>
//           </div>
//         </div>

//         {loading && (
//           <p className="mt-3 text-sm text-gray-400">
//             កំពុងធ្វើបច្ចុប្បន្នភាព Allergens / Dietary types / Medical conditions...
//           </p>
//         )}
//       </div>

//       <div className="grid gap-4 lg:grid-cols-2">
//         {FILTER_GROUPS.map(
//           (group) => (
//             <ClassificationGroup
//               key={
//                 group.code
//               }
//               group={group}
//               options={
//                 optionMap[
//                   group.code
//                 ] ?? []
//               }
//               selectedCodes={
//                 values[
//                   group.code
//                 ] ?? []
//               }
//               onToggle={(code) =>
//                 toggle(
//                   group,
//                   code,
//                 )
//               }
//             />
//           ),
//         )}
//       </div>
//     </section>
//   );
// }

// function ClassificationGroup({
//   group,
//   options,
//   selectedCodes,
//   onToggle,
// }: {
//   group: FilterGroupDefinition;
//   options: ClassificationOptionView[];
//   selectedCodes: string[];
//   onToggle: (
//     code: string,
//   ) => void;
// }) {
//   const [open, setOpen] =
//     useState(true);

//   const [search, setSearch] =
//     useState("");

//   const filtered =
//     useMemo(() => {
//       const query =
//         search
//           .trim()
//           .toLowerCase();

//       if (!query) {
//         return options;
//       }

//       return options.filter(
//         (option) =>
//           [
//             option.label,
//             option.code,
//             option.description ??
//               "",
//           ].some((value) =>
//             String(
//               value ?? "",
//             )
//               .toLowerCase()
//               .includes(query),
//           ),
//       );
//     }, [
//       options,
//       search,
//     ]);

//   return (
//     <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
//       <button
//         type="button"
//         onClick={() =>
//           setOpen(
//             (current) =>
//               !current,
//           )
//         }
//         className="flex w-full items-start justify-between gap-3 text-left"
//       >
//         <div>
//           <p className="text-xl font-semibold text-[#136C34]">
//             {group.labelKm}
//           </p>

//           <p className="mt-1 text-sm text-gray-400">
//             {group.labelEn} ·{" "}
//             {group.selectionMode ===
//             "SINGLE"
//               ? "ជ្រើសបាន 1"
//               : "ជ្រើសបានច្រើន"}
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {selectedCodes.length >
//             0 && (
//             <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#136C34] px-2 text-sm text-white">
//               {
//                 selectedCodes.length
//               }
//             </span>
//           )}

//           <ChevronDown
//             size={18}
//             className={`mt-1 text-gray-400 transition-transform ${
//               open
//                 ? "rotate-180"
//                 : ""
//             }`}
//           />
//         </div>
//       </button>

//       {open && (
//         <div className="mt-4">
//           {options.length >
//             6 && (
//             <div className="relative mb-3">
//               <Search
//                 size={16}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />

//               <input
//                 value={search}
//                 onChange={(
//                   event,
//                 ) =>
//                   setSearch(
//                     event
//                       .target
//                       .value,
//                   )
//                 }
//                 placeholder="ស្វែងរក..."
//                 className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#136C34]"
//               />
//             </div>
//           )}

//           {filtered.length ===
//           0 ? (
//             <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-5 text-center text-sm text-gray-400">
//               មិនមានទិន្នន័យសកម្ម
//             </div>
//           ) : (
//             <div className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1">
//               {filtered.map(
//                 (option) => {
//                   const selected =
//                     selectedCodes.includes(
//                       option.code,
//                     );

//                   return (
//                     <label
//                       key={
//                         option.uuid
//                       }
//                       className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
//                         selected
//                           ? "border-emerald-200 bg-emerald-50"
//                           : "border-transparent bg-white hover:border-gray-200"
//                       }`}
//                     >
//                       <input
//                         type={
//                           group.selectionMode ===
//                           "SINGLE"
//                             ? "radio"
//                             : "checkbox"
//                         }
//                         name={
//                           group.selectionMode ===
//                           "SINGLE"
//                             ? group.code
//                             : undefined
//                         }
//                         checked={
//                           selected
//                         }
//                         onChange={() =>
//                           onToggle(
//                             option.code,
//                           )
//                         }
//                         className="mt-1 h-4 w-4 accent-[#136C34]"
//                       />

//                       <div className="min-w-0 flex-1">
//                         <p className="text-base text-gray-700">
//                           {
//                             option.label
//                           }
//                         </p>

//                         {option.description && (
//                           <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-400">
//                             {
//                               option.description
//                             }
//                           </p>
//                         )}
//                       </div>
//                     </label>
//                   );
//                 },
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import {
  ChevronDown,
  Search,
  Tags,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  FILTER_GROUPS,
} from "@/src/config/filterCatalog";

import {
  useFilterCatalog,
} from "@/src/hooks/useFilterCatalog";

import {
  useGetAllergensQuery,
} from "@/src/app/store/allergenApi";

import {
  useGetDietaryTypesQuery,
} from "@/src/app/store/dietaryTypeApi";

import {
  useGetMedicalConditionsQuery,
} from "@/src/app/store/medicalConditionApi";

import {
  useGetAgeGroupsQuery,
} from "@/src/app/store/ageGroupApi";

import type {
  ClassificationSelections,
  FilterGroupDefinition,
} from "@/src/types/filterCatalog";

interface ClassificationOptionView {
  uuid: string;
  code: string;
  label: string;
  description?: string | null;
  active: boolean;
}

interface ClassificationSectionProps {
  values: ClassificationSelections;
  onChange: (
    values: ClassificationSelections,
  ) => void;
}

export default function ClassificationSection({
  values,
  onChange,
}: ClassificationSectionProps) {
  const {
    options: localOptions,
  } = useFilterCatalog();

  const {
    data: allergenData,
    isFetching: allergensLoading,
  } = useGetAllergensQuery({
    page: 0,
    size: 100,
  });

  const {
    data: dietaryData,
    isFetching: dietaryLoading,
  } = useGetDietaryTypesQuery({
    page: 0,
    size: 100,
  });

  const {
    data: medicalData,
    isFetching: medicalLoading,
  } = useGetMedicalConditionsQuery({
    page: 0,
    size: 100,
  });

  const {
    data: ageGroupData,
    isFetching: ageGroupsLoading,
  } = useGetAgeGroupsQuery({
    page: 0,
    size: 100,
    sort: "minAge,asc",
  });

  const optionMap = useMemo(() => {
    const map: Record<
      string,
      ClassificationOptionView[]
    > = {};

    for (const group of FILTER_GROUPS) {
      if (group.source === "LOCAL") {
        map[group.code] = localOptions
          .filter(
            (item) =>
              item.groupCode === group.code &&
              item.active,
          )
          .map((item) => ({
            uuid: item.uuid,
            code: item.code,
            label:
              item.localName ||
              item.name,
            description:
              item.description,
            active:
              item.active,
          }));

        continue;
      }

      if (
        group.source ===
        "ALLERGEN_API"
      ) {
        map[group.code] =
          (
            allergenData?.contents ??
            []
          )
            .filter(
              (item) =>
                item.active,
            )
            .map((item) => ({
              uuid: item.uuid,
              code: item.code,
              label:
                item.code ||
                item.name,
              description:
                item.description,
              active:
                item.active,
            }));

        continue;
      }

      if (
        group.source ===
        "DIETARY_TYPE_API"
      ) {
        map[group.code] =
          (
            dietaryData?.contents ??
            []
          )
            .filter(
              (item) =>
                item.active,
            )
            .map((item) => ({
              uuid: item.uuid,
              code: item.code,
              label:
                item.name ||
                item.code,
              description:
                item.description,
              active:
                item.active,
            }));

        continue;
      }

      if (
        group.source ===
        "MEDICAL_CONDITION_API"
      ) {
        map[group.code] =
          (
            medicalData?.contents ??
            []
          )
            .filter(
              (item) =>
                item.active,
            )
            .map((item) => ({
              uuid: item.uuid,
              code: item.code,
              label:
                item.name ||
                item.code,
              description:
                item.description,
              active:
                item.active,
            }));

        continue;
      }

      if (
        group.source ===
        "AGE_GROUP_API"
      ) {
        map[group.code] =
          (
            ageGroupData?.contents ??
            []
          )
            .filter(
              (item) =>
                item.isActive,
            )
            .map((item) => ({
              uuid: item.uuid,
              code: item.code,
              label:
                item.name ||
                item.code,
              description:
                item.description ||
                `${item.minAge}–${item.maxAge} years`,
              active:
                item.isActive,
            }));
      }
    }

    return map;
  }, [
    localOptions,
    allergenData,
    dietaryData,
    medicalData,
    ageGroupData,
  ]);

  const toggle = (
    group: FilterGroupDefinition,
    code: string,
  ) => {
    const current =
      values[group.code] ??
      [];

    if (
      group.selectionMode ===
      "SINGLE"
    ) {
      onChange({
        ...values,
        [group.code]:
          current.includes(code)
            ? []
            : [code],
      });

      return;
    }

    onChange({
      ...values,
      [group.code]:
        current.includes(code)
          ? current.filter(
              (value) =>
                value !== code,
            )
          : [
              ...current,
              code,
            ],
    });
  };

  const loading =
    allergensLoading ||
    dietaryLoading ||
    medicalLoading ||
    ageGroupsLoading;

  return (
    <section className="space-y-6 rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
            <Tags size={22} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#136C34]">
              ការចាត់ថ្នាក់
            </h2>

            <p className="mt-1 text-base text-gray-500">
              ជ្រើសរើសស្លាកត្រងទាំងអស់ដែលទាក់ទងនឹងម្ហូបនេះ។
            </p>
          </div>
        </div>

        {loading && (
          <p className="mt-3 text-sm text-gray-400">
            កំពុងធ្វើបច្ចុប្បន្នភាពទិន្នន័យស្លាកត្រងពី API...
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {FILTER_GROUPS.map(
          (group) => (
            <ClassificationGroup
              key={
                group.code
              }
              group={group}
              options={
                optionMap[
                  group.code
                ] ?? []
              }
              selectedCodes={
                values[
                  group.code
                ] ?? []
              }
              onToggle={(code) =>
                toggle(
                  group,
                  code,
                )
              }
            />
          ),
        )}
      </div>
    </section>
  );
}

function ClassificationGroup({
  group,
  options,
  selectedCodes,
  onToggle,
}: {
  group: FilterGroupDefinition;
  options: ClassificationOptionView[];
  selectedCodes: string[];
  onToggle: (
    code: string,
  ) => void;
}) {
  const [
    open,
    setOpen,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return options;
      }

      return options.filter(
        (option) =>
          [
            option.label,
            option.code,
            option.description ??
              "",
          ].some((value) =>
            String(
              value ?? "",
            )
              .toLowerCase()
              .includes(query),
          ),
      );
    }, [
      options,
      search,
    ]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xl font-semibold text-[#136C34]">
            {
              group.labelKm
            }
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {
              group.labelEn
            }{" "}
            ·{" "}
            {group.selectionMode ===
            "SINGLE"
              ? "ជ្រើសបាន 1"
              : "ជ្រើសបានច្រើន"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCodes.length >
            0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#136C34] px-2 text-sm text-white">
              {
                selectedCodes.length
              }
            </span>
          )}

          <ChevronDown
            size={18}
            className={`mt-1 text-gray-400 transition-transform ${
              open
                ? "rotate-180"
                : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="mt-4">
          {options.length >
            6 && (
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="ស្វែងរក..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#136C34]"
              />
            </div>
          )}

          {filtered.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-5 text-center text-sm text-gray-400">
              មិនមានទិន្នន័យសកម្ម
            </div>
          ) : (
            <div className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1">
              {filtered.map(
                (
                  option,
                ) => {
                  const selected =
                    selectedCodes.includes(
                      option.code,
                    );

                  return (
                    <label
                      key={
                        option.uuid
                      }
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                        selected
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-transparent bg-white hover:border-gray-200"
                      }`}
                    >
                      <input
                        type={
                          group.selectionMode ===
                          "SINGLE"
                            ? "radio"
                            : "checkbox"
                        }
                        name={
                          group.selectionMode ===
                          "SINGLE"
                            ? group.code
                            : undefined
                        }
                        checked={
                          selected
                        }
                        onChange={() =>
                          onToggle(
                            option.code,
                          )
                        }
                        className="mt-1 h-4 w-4 accent-[#136C34]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-base text-gray-700">
                          {
                            option.label
                          }
                        </p>

                        {option.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-400">
                            {
                              option.description
                            }
                          </p>
                        )}
                      </div>
                    </label>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
