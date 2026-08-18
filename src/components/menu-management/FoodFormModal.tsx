// "use client";

// import {
//   Check,
//   ChevronDown,
//   Loader2,
//   Plus,
//   Save,
//   Trash2,
//   X,
// } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";

// import ImagePicker from "./ImagePicker";

// import type {
//   CuisineOption,
//   EventOption,
//   FoodAgeRuleRelation,
//   FoodCategoryOption,
//   FoodDietaryTypeRelation,
//   FoodEventRelation,
//   FoodMealTypeRelation,
//   FoodRecord,
//   FoodSeasonRelation,
//   FoodWeatherRelation,
//   FoodWritePayload,
//   NutritionData,
//   SeasonOption,
//   WeatherConditionOption,
// } from "@/src/types/menu-management";
// import type { MealType } from "@/src/types/mealType";
// import type { AgeGroup } from "@/src/types/ageGroup";
// import type { DietaryType } from "@/src/types/dietaryType";

// type FormState = {
//   canonicalName: string;
//   localName: string;
//   description: string;
//   categoryUuid: string;
//   cuisineUuid: string;
//   defaultSpiceLevel: string;
//   calories: string;
//   protein: string;
//   carbohydrate: string;
//   fat: string;
//   fiber: string;
//   isActive: boolean;
// };

// const EMPTY: FormState = {
//   canonicalName: "",
//   localName: "",
//   description: "",
//   categoryUuid: "",
//   cuisineUuid: "",
//   defaultSpiceLevel: "0",
//   calories: "",
//   protein: "",
//   carbohydrate: "",
//   fat: "",
//   fiber: "",
//   isActive: true,
// };

// function numberOrNull(value: string): number | null {
//   if (!value.trim()) return null;

//   const result = Number(value);
//   return Number.isFinite(result) ? result : null;
// }

// export default function FoodFormModal({
//   open,
//   item,
//   categories,
//   cuisines,
//   seasons = [],
//   events = [],
//   weatherConditions = [],
//   mealTypes = [],
//   ageGroups = [],
//   dietaryTypes = [],
//   saving,
//   onClose,
//   onSubmit,
// }: {
//   open: boolean;
//   item: FoodRecord | null;
//   categories: FoodCategoryOption[];
//   cuisines: CuisineOption[];
//   seasons?: SeasonOption[];
//   events?: EventOption[];
//   weatherConditions?: WeatherConditionOption[];
//   mealTypes?: MealType[];
//   ageGroups?: AgeGroup[];
//   dietaryTypes?: DietaryType[];
//   saving: boolean;
//   onClose: () => void;
//   onSubmit: (payload: FoodWritePayload, images: File[]) => Promise<void>;
// }) {
//   const [values, setValues] = useState<FormState>(EMPTY);
//   const [images, setImages] = useState<File[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   // Metadata relations state (all filters in ចម្រោះទិន្នន័យ)
//   const [seasonRows, setSeasonRows] = useState<FoodSeasonRelation[]>([]);
//   const [eventRows, setEventRows] = useState<FoodEventRelation[]>([]);
//   const [weatherRows, setWeatherRows] = useState<FoodWeatherRelation[]>([]);
//   const [mealTypeRows, setMealTypeRows] = useState<FoodMealTypeRelation[]>([]);
//   const [ageRuleRows, setAgeRuleRows] = useState<FoodAgeRuleRelation[]>([]);
//   const [dietaryTypeRows, setDietaryTypeRows] = useState<
//     FoodDietaryTypeRelation[]
//   >([]);
//   const [existingImages, setExistingImages] = useState<string[]>([]);

//   useEffect(() => {
//     if (!open) return;

//     if (!item) {
//       setValues(EMPTY);
//       setImages([]);
//       setExistingImages([]);
//       setSeasonRows([]);
//       setEventRows([]);
//       setWeatherRows([]);
//       setMealTypeRows([]);
//       setAgeRuleRows([]);
//       setDietaryTypeRows([]);
//       setError(null);
//       return;
//     }

//     const list = item.images?.length
//       ? item.images
//       : item.gallery?.length
//         ? item.gallery
//         : item.primaryMediaUrls?.length
//           ? item.primaryMediaUrls
//           : [item.thumbnail || item.imageUrl].filter(Boolean);
//     setExistingImages(list as string[]);

//     const matchedCategoryUuid =
//       item.categoryUuid ??
//       item.category?.uuid ??
//       categories.find(
//         (c) =>
//           (item.category?.code && c.code === item.category.code) ||
//           (item.category?.name && c.name === item.category.name) ||
//           (item.categoryName && c.name === item.categoryName),
//       )?.uuid ??
//       "";

//     const matchedCuisineUuid =
//       item.cuisineUuid ??
//       item.cuisine?.uuid ??
//       cuisines.find(
//         (c) =>
//           (item.cuisine?.code && c.code === item.cuisine.code) ||
//           (item.cuisine?.name && c.name === item.cuisine.name) ||
//           (item.cuisineName && c.name === item.cuisineName),
//       )?.uuid ??
//       "";

//     setValues({
//       canonicalName: item.canonicalName ?? "",
//       localName: item.localName ?? "",
//       description: item.description ?? "",
//       categoryUuid: matchedCategoryUuid,
//       cuisineUuid: matchedCuisineUuid,
//       defaultSpiceLevel: String(item.defaultSpiceLevel ?? 0),
//       calories:
//         item.nutritionData?.calories != null
//           ? String(item.nutritionData.calories)
//           : "",
//       protein:
//         item.nutritionData?.proteinGrams != null
//           ? String(item.nutritionData.proteinGrams)
//           : "",
//       carbohydrate:
//         item.nutritionData?.carbohydrateGrams != null
//           ? String(item.nutritionData.carbohydrateGrams)
//           : item.nutritionData?.carbsGrams != null
//             ? String(item.nutritionData.carbsGrams)
//             : "",
//       fat:
//         item.nutritionData?.fatGrams != null
//           ? String(item.nutritionData.fatGrams)
//           : "",
//       fiber:
//         item.nutritionData?.fiberGrams != null
//           ? String(item.nutritionData.fiberGrams)
//           : "",
//       isActive: item.isActive !== false,
//     });

//     // Populate metadata relations if editing
//     const rawSeasons = Array.isArray(item.seasons) ? item.seasons : [];
//     setSeasonRows(
//       rawSeasons
//         .map((s: any) => {
//           const found = seasons.find(
//             (opt) =>
//               opt.uuid === s.seasonUuid ||
//               opt.uuid === s.uuid ||
//               opt.uuid === s.season?.uuid ||
//               (s.code && opt.code === s.code) ||
//               (s.name && opt.name === s.name),
//           );
//           return {
//             seasonUuid:
//               found?.uuid || s.seasonUuid || s.uuid || s.season?.uuid || "",
//             suitabilityScore:
//               s.suitabilityScore != null ? Number(s.suitabilityScore) : 0.95,
//             reasonText: s.reasonText ?? "",
//           };
//         })
//         .filter((s) => Boolean(s.seasonUuid)),
//     );

//     const rawEvents = Array.isArray(item.events) ? item.events : [];
//     setEventRows(
//       rawEvents
//         .map((e: any) => {
//           const found = events.find(
//             (opt) =>
//               opt.uuid === e.eventUuid ||
//               opt.uuid === e.uuid ||
//               opt.uuid === e.event?.uuid ||
//               (e.code && opt.code === e.code) ||
//               (e.name && opt.name === e.name),
//           );
//           return {
//             eventUuid:
//               found?.uuid || e.eventUuid || e.uuid || e.event?.uuid || "",
//             relevanceScore:
//               e.relevanceScore != null ? Number(e.relevanceScore) : 0.9,
//             reasonText: e.reasonText ?? "",
//           };
//         })
//         .filter((e) => Boolean(e.eventUuid)),
//     );

//     const rawWeather = Array.isArray(item.suitableWeather)
//       ? item.suitableWeather
//       : [];
//     setWeatherRows(
//       rawWeather
//         .map((w: any) => {
//           const found = weatherConditions.find(
//             (opt) =>
//               opt.uuid === w.weatherConditionUuid ||
//               opt.uuid === w.uuid ||
//               opt.uuid === w.weatherCondition?.uuid ||
//               (w.code && opt.code === w.code) ||
//               (w.name && opt.name === w.name),
//           );
//           return {
//             weatherConditionUuid:
//               found?.uuid ||
//               w.weatherConditionUuid ||
//               w.uuid ||
//               w.weatherCondition?.uuid ||
//               "",
//             suitabilityScore:
//               w.suitabilityScore != null ? Number(w.suitabilityScore) : 0.95,
//             reasonText: w.reasonText ?? "",
//           };
//         })
//         .filter((w) => Boolean(w.weatherConditionUuid)),
//     );

//     const rawMealTypes = Array.isArray(item.mealTypes) ? item.mealTypes : [];
//     setMealTypeRows(
//       rawMealTypes
//         .map((m: any) => {
//           const found = mealTypes.find(
//             (opt) =>
//               opt.uuid === m.mealTypeUuid ||
//               opt.uuid === m.uuid ||
//               opt.uuid === m.mealType?.uuid ||
//               (m.code && opt.code === m.code) ||
//               (m.name && opt.name === m.name),
//           );
//           return {
//             mealTypeUuid:
//               found?.uuid || m.mealTypeUuid || m.uuid || m.mealType?.uuid || "",
//             suitabilityScore:
//               m.suitabilityScore != null ? Number(m.suitabilityScore) : 1.0,
//           };
//         })
//         .filter((m) => Boolean(m.mealTypeUuid)),
//     );

//     const rawAgeRules = Array.isArray(item.ageRules) ? item.ageRules : [];
//     setAgeRuleRows(
//       rawAgeRules
//         .map((a: any) => {
//           const found = ageGroups.find(
//             (opt) =>
//               opt.uuid === a.ageGroupUuid ||
//               opt.uuid === a.uuid ||
//               opt.uuid === a.ageGroup?.uuid ||
//               (a.code && opt.code === a.code) ||
//               (a.name && opt.name === a.name),
//           );
//           return {
//             ageGroupUuid:
//               found?.uuid || a.ageGroupUuid || a.uuid || a.ageGroup?.uuid || "",
//             ruleResult: a.ruleResult || "ALLOWED",
//             reasonText: a.reasonText ?? "Suitable as a normal serving.",
//           };
//         })
//         .filter((a) => Boolean(a.ageGroupUuid)),
//     );

//     const rawDietary = Array.isArray(item.dietaryTypes)
//       ? item.dietaryTypes
//       : [];
//     setDietaryTypeRows(
//       rawDietary
//         .map((d: any) => {
//           const code = d.code ?? d.dietaryTypeCode ?? "";
//           const found = dietaryTypes.find(
//             (opt) =>
//               opt.code === code ||
//               opt.uuid === d.uuid ||
//               opt.uuid === d.dietaryTypeUuid,
//           );
//           return {
//             code: found?.code || code,
//             name: found?.name || d.name || code,
//           };
//         })
//         .filter((d) => Boolean(d.code)),
//     );

//     setImages([]);
//     setError(null);
//   }, [
//     item,
//     open,
//     categories,
//     cuisines,
//     seasons,
//     events,
//     weatherConditions,
//     mealTypes,
//     ageGroups,
//     dietaryTypes,
//   ]);

//   const activeCategories = useMemo(() => {
//     return categories.filter((category) => category.isActive !== false);
//   }, [categories]);

//   const submit = async () => {
//     try {
//       setError(null);

//       if (!values.canonicalName.trim()) {
//         throw new Error("Canonical name is required.");
//       }

//       if (!values.categoryUuid) {
//         throw new Error("Category (ប្រភេទម្ហូប) is required.");
//       }

//       if (!values.cuisineUuid) {
//         throw new Error("Cuisine (ម្ហូបតាមប្រទេស) is required.");
//       }

//       const nutritionData: NutritionData = {
//         calories: numberOrNull(values.calories) ?? 0,
//         proteinGrams: numberOrNull(values.protein) ?? 0,
//         carbohydrateGrams: numberOrNull(values.carbohydrate) ?? 0,
//         fatGrams: numberOrNull(values.fat) ?? 0,
//         fiberGrams: numberOrNull(values.fiber) ?? 0,
//       };

//       const hasImages = Array.isArray(images) && images.length > 0;

//       const payload: FoodWritePayload = {
//         canonicalName: values.canonicalName.trim(),
//         localName: values.localName.trim() || null,
//         description: values.description.trim() || null,
//         categoryUuid: values.categoryUuid,
//         cuisineUuid: values.cuisineUuid,
//         ...(hasImages
//           ? {}
//           : { primaryMediaUuids: item?.primaryMediaUuids ?? [] }),
//         defaultSpiceLevel: numberOrNull(values.defaultSpiceLevel) ?? 0,
//         nutritionData,
//         seasons: seasonRows
//           .filter((r) => Boolean(r.seasonUuid))
//           .map((r) => ({
//             seasonUuid: r.seasonUuid,
//             suitabilityScore: r.suitabilityScore ?? 0.95,
//             reasonText: r.reasonText?.trim() || null,
//           })),
//         dietaryTypes: dietaryTypeRows
//           .filter((r) => Boolean(r.code))
//           .map((r) => ({
//             code: r.code,
//             name: r.name || r.code,
//           })),
//         events: eventRows
//           .filter((r) => Boolean(r.eventUuid))
//           .map((r) => ({
//             eventUuid: r.eventUuid,
//             relevanceScore: r.relevanceScore ?? 0.9,
//             reasonText: r.reasonText?.trim() || null,
//           })),
//         suitableWeather: weatherRows
//           .filter((r) => Boolean(r.weatherConditionUuid))
//           .map((r) => ({
//             weatherConditionUuid: r.weatherConditionUuid,
//             suitabilityScore: r.suitabilityScore ?? 0.95,
//             reasonText: r.reasonText?.trim() || null,
//           })),
//         mealTypes: mealTypeRows
//           .filter((r) => Boolean(r.mealTypeUuid))
//           .map((r) => ({
//             mealTypeUuid: r.mealTypeUuid,
//             suitabilityScore: r.suitabilityScore ?? 1.0,
//           })),
//         ageRules: ageRuleRows
//           .filter((r) => Boolean(r.ageGroupUuid))
//           .map((r) => ({
//             ageGroupUuid: r.ageGroupUuid,
//             ruleResult: r.ruleResult || "ALLOWED",
//             reasonText: r.reasonText?.trim() || "Suitable as a normal serving.",
//           })),
//         isActive: values.isActive,
//       };

//       await onSubmit(payload, images);
//     } catch (submitError) {
//       setError(
//         submitError instanceof Error
//           ? submitError.message
//           : "Could not save Food.",
//       );
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
//       <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//         <div className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
//           <div>
//             <p className="text-3xl font-semibold text-primary-800">
//               {item ? "កែប្រែមីនុយ" : "បន្ថែមមីនុយ"}
//             </p>
//             <p className="mt-2 text-lg leading-7 text-gray-500">
//               Food នេះអាចឱ្យ Store ជ្រើសយកទៅបង្កើត Menu Item។
//             </p>
//           </div>

//           <button
//             type="button"
//             disabled={saving}
//             onClick={onClose}
//             className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
//           >
//             <X size={21} />
//           </button>
//         </div>

//         <div className="space-y-6 p-6 sm:p-8">
//           <div className="grid gap-4 md:grid-cols-2">
//             <Field
//               label="Canonical name *"
//               value={values.canonicalName}
//               onChange={(value) =>
//                 setValues((current) => ({
//                   ...current,
//                   canonicalName: value,
//                 }))
//               }
//             />

//             <Field
//               label="ឈ្មោះខ្មែរ"
//               value={values.localName}
//               onChange={(value) =>
//                 setValues((current) => ({
//                   ...current,
//                   localName: value,
//                 }))
//               }
//             />

//             <label>
//               <Label>Category (ប្រភេទម្ហូប) *</Label>
//               <FormSelect
//                 value={values.categoryUuid}
//                 placeholder="ជ្រើស Category"
//                 options={activeCategories.map((category) => ({
//                   value: category.uuid,
//                   label: `${category.name} (${category.code})`,
//                 }))}
//                 onChange={(value) =>
//                   setValues((current) => ({
//                     ...current,
//                     categoryUuid: value,
//                   }))
//                 }
//               />
//             </label>

//             <label>
//               <Label>Cuisine (ម្ហូបតាមប្រទេស) *</Label>
//               <FormSelect
//                 value={values.cuisineUuid}
//                 placeholder="ជ្រើស Cuisine"
//                 options={cuisines
//                   .filter((cuisine) => cuisine.isActive !== false)
//                   .map((cuisine) => ({
//                     value: cuisine.uuid,
//                     label: cuisine.name,
//                   }))}
//                 onChange={(value) =>
//                   setValues((current) => ({
//                     ...current,
//                     cuisineUuid: value,
//                   }))
//                 }
//               />
//             </label>

//             <Field
//               label="Spice level"
//               type="number"
//               value={values.defaultSpiceLevel}
//               onChange={(value) =>
//                 setValues((current) => ({
//                   ...current,
//                   defaultSpiceLevel: value,
//                 }))
//               }
//             />

//             <label className="flex items-center gap-3 pt-7">
//               <input
//                 type="checkbox"
//                 checked={values.isActive}
//                 onChange={(event) =>
//                   setValues((current) => ({
//                     ...current,
//                     isActive: event.target.checked,
//                   }))
//                 }
//                 className="h-5 w-5 accent-primary-700"
//               />
//               <span className="text-lg font-medium text-primary-800">
//                 Active
//               </span>
//             </label>

//             <label className="md:col-span-2">
//               <Label>Description</Label>
//               <textarea
//                 rows={3}
//                 value={values.description}
//                 onChange={(event) =>
//                   setValues((current) => ({
//                     ...current,
//                     description: event.target.value,
//                   }))
//                 }
//                 className={`${inputClass} h-auto py-3`}
//               />
//             </label>
//           </div>

//           {/* Nutrition Section */}
//           <div>
//             <p className="mb-4 text-3xl font-semibold text-primary-800">
//               Nutrition
//             </p>

//             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
//               {[
//                 ["calories", "Calories"],
//                 ["protein", "Protein (g)"],
//                 ["carbohydrate", "Carbohydrate (g)"],
//                 ["fat", "Fat (g)"],
//                 ["fiber", "Fiber (g)"],
//               ].map(([key, label]) => (
//                 <Field
//                   key={key}
//                   label={label}
//                   type="number"
//                   value={
//                     values[
//                       key as keyof Pick<
//                         FormState,
//                         | "calories"
//                         | "protein"
//                         | "carbohydrate"
//                         | "fat"
//                         | "fiber"
//                       >
//                     ]
//                   }
//                   onChange={(value) =>
//                     setValues((current) => ({
//                       ...current,
//                       [key]: value,
//                     }))
//                   }
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Dietary Types Metadata Section */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-3xl font-semibold text-primary-800">
//                   របបអាហារ
//                 </p>
//                 <p className="mt-1 text-lg leading-7 text-gray-500">
//                   កំណត់របបអាហារដែលត្រូវគ្នា (Gluten Free, Vegan, Halal, etc.)
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setDietaryTypeRows((current) => [
//                     ...current,
//                     { code: "", name: "" },
//                   ])
//                 }
//                 className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit"
//               >
//                 <Plus size={20} />
//                 បន្ថែមរបបអាហារ
//               </button>
//             </div>

//             {dietaryTypeRows.length === 0 ? (
//               <p className="mt-4 text-lg text-gray-500">
//                 មិនទាន់បានជ្រើសរបបអាហារ
//               </p>
//             ) : (
//               <div className="mt-5 space-y-4">
//                 {dietaryTypeRows.map((row, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:flex-row lg:items-center"
//                   >
//                     <FormSelect
//                       value={row.code}
//                       placeholder="ជ្រើសរបបអាហារ..."
//                       className="min-w-0 flex-1"
//                       options={dietaryTypes.map((dietaryType) => ({
//                         value: dietaryType.code,
//                         label: `${dietaryType.name} (${dietaryType.code})`,
//                       }))}
//                       onChange={(value) => {
//                         const found = dietaryTypes.find(
//                           (dietaryType) => dietaryType.code === value,
//                         );
//                         setDietaryTypeRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? {
//                                   ...currentRow,
//                                   code: value,
//                                   name: found?.name ?? value,
//                                 }
//                               : currentRow,
//                           ),
//                         );
//                       }}
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setDietaryTypeRows((prev) =>
//                           prev.filter((_, i) => i !== idx),
//                         )
//                       }
//                       className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 lg:w-[52px]"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Meal Types Metadata Section */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-3xl font-semibold text-primary-800">
//                   ពេលទទួលទាន
//                 </p>
//                 <p className="mt-1 text-lg leading-7 text-gray-500">
//                   កំណត់ពេលទទួលទាន (Breakfast, Lunch, Dinner, etc.)
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setMealTypeRows((current) => [
//                     ...current,
//                     { mealTypeUuid: "", suitabilityScore: 1.0 },
//                   ])
//                 }
//                 className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit"
//               >
//                 <Plus size={20} />
//                 បន្ថែមពេលទទួលទាន
//               </button>
//             </div>

//             {mealTypeRows.length === 0 ? (
//               <p className="mt-4 text-lg text-gray-500">
//                 មិនទាន់បានជ្រើសពេលទទួលទាន
//               </p>
//             ) : (
//               <div className="mt-5 space-y-4">
//                 {mealTypeRows.map((row, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:flex-row lg:items-center"
//                   >
//                     <FormSelect
//                       value={row.mealTypeUuid}
//                       placeholder="ជ្រើសពេលទទួលទាន..."
//                       className="min-w-0 flex-1"
//                       options={mealTypes.map((mealType) => ({
//                         value: mealType.uuid,
//                         label: `${mealType.name} (${mealType.code})`,
//                       }))}
//                       onChange={(value) =>
//                         setMealTypeRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? { ...currentRow, mealTypeUuid: value }
//                               : currentRow,
//                           ),
//                         )
//                       }
//                     />

//                     <input
//                       type="number"
//                       step="0.05"
//                       min="0"
//                       max="1"
//                       placeholder="Suitability Score (0-1)"
//                       value={row.suitabilityScore ?? 1.0}
//                       onChange={(e) => {
//                         const val = Number(e.target.value);
//                         setMealTypeRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, suitabilityScore: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 lg:w-40"
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setMealTypeRows((prev) =>
//                           prev.filter((_, i) => i !== idx),
//                         )
//                       }
//                       className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 lg:w-[52px]"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Age Rules Section */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-3xl font-semibold text-primary-800">
//                   ក្រុមអាយុ
//                 </p>
//                 <p className="mt-1 text-lg leading-7 text-gray-500">
//                   កំណត់លក្ខខណ្ឌសាកសមសម្រាប់ក្រុមអាយុ
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setAgeRuleRows((current) => [
//                     ...current,
//                     {
//                       ageGroupUuid: "",
//                       ruleResult: "ALLOWED",
//                       reasonText: "Suitable as a normal serving.",
//                     },
//                   ])
//                 }
//                 className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit"
//               >
//                 <Plus size={20} />
//                 បន្ថែមក្រុមអាយុ
//               </button>
//             </div>

//             {ageRuleRows.length === 0 ? (
//               <p className="mt-4 text-lg text-gray-500">
//                 មិនទាន់បានជ្រើសក្រុមអាយុ
//               </p>
//             ) : (
//               <div className="mt-5 space-y-4">
//                 {ageRuleRows.map((row, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:flex-row lg:items-center"
//                   >
//                     <FormSelect
//                       value={row.ageGroupUuid}
//                       placeholder="ជ្រើសក្រុមអាយុ..."
//                       className="min-w-0 flex-1"
//                       options={ageGroups.map((ageGroup) => ({
//                         value: ageGroup.uuid,
//                         label: `${ageGroup.name} (${ageGroup.code})`,
//                       }))}
//                       onChange={(value) =>
//                         setAgeRuleRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? { ...currentRow, ageGroupUuid: value }
//                               : currentRow,
//                           ),
//                         )
//                       }
//                     />

//                     <FormSelect
//                       value={row.ruleResult || "ALLOWED"}
//                       className="w-full lg:w-48"
//                       options={[
//                         { value: "ALLOWED", label: "ALLOWED" },
//                         { value: "WARNING", label: "WARNING" },
//                         { value: "RESTRICTED", label: "RESTRICTED" },
//                       ]}
//                       onChange={(value) =>
//                         setAgeRuleRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? { ...currentRow, ruleResult: value }
//                               : currentRow,
//                           ),
//                         )
//                       }
//                     />

//                     <input
//                       type="text"
//                       placeholder="ហេតុផល (Reason)..."
//                       value={row.reasonText ?? ""}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setAgeRuleRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, reasonText: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setAgeRuleRows((prev) =>
//                           prev.filter((_, i) => i !== idx),
//                         )
//                       }
//                       className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 lg:w-[52px]"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Seasons Metadata Section */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-3xl font-semibold text-primary-800">
//                   រដូវកាល
//                 </p>
//                 <p className="mt-1 text-lg leading-7 text-gray-500">
//                   កំណត់រដូវកាលដែលសាកសមសម្រាប់ម្ហូបនេះ
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSeasonRows((current) => [
//                     ...current,
//                     { seasonUuid: "", suitabilityScore: 1.0, reasonText: "" },
//                   ])
//                 }
//                 className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit"
//               >
//                 <Plus size={20} />
//                 បន្ថែមរដូវកាល
//               </button>
//             </div>

//             {seasonRows.length === 0 ? (
//               <p className="mt-4 text-lg text-gray-500">
//                 មិនទាន់បានជ្រើសរដូវកាល
//               </p>
//             ) : (
//               <div className="mt-5 space-y-4">
//                 {seasonRows.map((row, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:flex-row lg:items-center"
//                   >
//                     <FormSelect
//                       value={row.seasonUuid}
//                       placeholder="ជ្រើសរដូវកាល..."
//                       className="min-w-0 flex-1"
//                       options={seasons.map((season) => ({
//                         value: season.uuid,
//                         label: `${season.name}${
//                           season.localName ? ` (${season.localName})` : ""
//                         }`,
//                       }))}
//                       onChange={(value) =>
//                         setSeasonRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? { ...currentRow, seasonUuid: value }
//                               : currentRow,
//                           ),
//                         )
//                       }
//                     />

//                     <input
//                       type="number"
//                       step="0.05"
//                       min="0"
//                       max="1"
//                       placeholder="Score (0-1)"
//                       value={row.suitabilityScore ?? 1.0}
//                       onChange={(e) => {
//                         const val = Number(e.target.value);
//                         setSeasonRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, suitabilityScore: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 lg:w-36"
//                     />

//                     <input
//                       type="text"
//                       placeholder="ហេតុផល (Reason)..."
//                       value={row.reasonText ?? ""}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setSeasonRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, reasonText: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setSeasonRows((prev) =>
//                           prev.filter((_, i) => i !== idx),
//                         )
//                       }
//                       className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 lg:w-[52px]"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Events Metadata Section */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-3xl font-semibold text-primary-800">
//                   ព្រឹត្តិការណ៍ / បុណ្យទាន
//                 </p>
//                 <p className="mt-1 text-lg leading-7 text-gray-500">
//                   កំណត់ពិធីបុណ្យ ឬព្រឹត្តិការណ៍ដែលពាក់ព័ន្ធ
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setEventRows((current) => [
//                     ...current,
//                     { eventUuid: "", relevanceScore: 0.9, reasonText: "" },
//                   ])
//                 }
//                 className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit"
//               >
//                 <Plus size={20} />
//                 បន្ថែមព្រឹត្តិការណ៍
//               </button>
//             </div>

//             {eventRows.length === 0 ? (
//               <p className="mt-4 text-lg text-gray-500">
//                 មិនទាន់បានជ្រើសព្រឹត្តិការណ៍
//               </p>
//             ) : (
//               <div className="mt-5 space-y-4">
//                 {eventRows.map((row, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:flex-row lg:items-center"
//                   >
//                     <FormSelect
//                       value={row.eventUuid}
//                       placeholder="ជ្រើសព្រឹត្តិការណ៍..."
//                       className="min-w-0 flex-1"
//                       options={events.map((eventOption) => ({
//                         value: eventOption.uuid,
//                         label: `${eventOption.name}${
//                           eventOption.localName
//                             ? ` (${eventOption.localName})`
//                             : ""
//                         }`,
//                       }))}
//                       onChange={(value) =>
//                         setEventRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? { ...currentRow, eventUuid: value }
//                               : currentRow,
//                           ),
//                         )
//                       }
//                     />

//                     <input
//                       type="number"
//                       step="0.05"
//                       min="0"
//                       max="1"
//                       placeholder="Score (0-1)"
//                       value={row.relevanceScore ?? 0.9}
//                       onChange={(e) => {
//                         const val = Number(e.target.value);
//                         setEventRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, relevanceScore: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 lg:w-36"
//                     />

//                     <input
//                       type="text"
//                       placeholder="ហេតុផល (Reason)..."
//                       value={row.reasonText ?? ""}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setEventRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, reasonText: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setEventRows((prev) => prev.filter((_, i) => i !== idx))
//                       }
//                       className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 lg:w-[52px]"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Weather Conditions Metadata Section */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-3xl font-semibold text-primary-800">
//                   ស្ថានភាពអាកាសធាតុ
//                 </p>
//                 <p className="mt-1 text-lg leading-7 text-gray-500">
//                   កំណត់អាកាសធាតុដែលសាកសមសម្រាប់ម្ហូបនេះ
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setWeatherRows((current) => [
//                     ...current,
//                     {
//                       weatherConditionUuid: "",
//                       suitabilityScore: 0.8,
//                       reasonText: "",
//                     },
//                   ])
//                 }
//                 className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-lg font-semibold text-white transition hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-100 sm:w-fit"
//               >
//                 <Plus size={20} />
//                 បន្ថែមអាកាសធាតុ
//               </button>
//             </div>

//             {weatherRows.length === 0 ? (
//               <p className="mt-4 text-lg text-gray-500">
//                 មិនទាន់បានជ្រើសអាកាសធាតុ
//               </p>
//             ) : (
//               <div className="mt-5 space-y-4">
//                 {weatherRows.map((row, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 lg:flex-row lg:items-center"
//                   >
//                     <FormSelect
//                       value={row.weatherConditionUuid}
//                       placeholder="ជ្រើសអាកាសធាតុ..."
//                       className="min-w-0 flex-1"
//                       options={weatherConditions.map((weather) => ({
//                         value: weather.uuid,
//                         label: `${weather.name}${
//                           weather.localName ? ` (${weather.localName})` : ""
//                         }`,
//                       }))}
//                       onChange={(value) =>
//                         setWeatherRows((previous) =>
//                           previous.map((currentRow, currentIndex) =>
//                             currentIndex === idx
//                               ? { ...currentRow, weatherConditionUuid: value }
//                               : currentRow,
//                           ),
//                         )
//                       }
//                     />

//                     <input
//                       type="number"
//                       step="0.05"
//                       min="0"
//                       max="1"
//                       placeholder="Score (0-1)"
//                       value={row.suitabilityScore ?? 0.8}
//                       onChange={(e) => {
//                         const val = Number(e.target.value);
//                         setWeatherRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, suitabilityScore: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 lg:w-36"
//                     />

//                     <input
//                       type="text"
//                       placeholder="ហេតុផល (Reason)..."
//                       value={row.reasonText ?? ""}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setWeatherRows((prev) =>
//                           prev.map((r, i) =>
//                             i === idx ? { ...r, reasonText: val } : r,
//                           ),
//                         );
//                       }}
//                       className="h-[52px] min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setWeatherRows((prev) =>
//                           prev.filter((_, i) => i !== idx),
//                         )
//                       }
//                       className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 lg:w-[52px]"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <ImagePicker
//             value={images}
//             onChange={setImages}
//             existingImages={existingImages}
//             onExistingChange={setExistingImages}
//             label={
//               item
//                 ? "រូបភាព (ទុកទទេ = រក្សារូបចាស់)"
//                 : "រូបភាព Food (អតិបរមា 4)"
//             }
//           />

//           {error && (
//             <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
//               {error}
//             </div>
//           )}

//           <div className="sticky bottom-0 z-40 -mx-6 -mb-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:flex-row sm:items-center sm:justify-end sm:px-8">
//             <button
//               type="button"
//               disabled={saving}
//               onClick={onClose}
//               className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50 sm:w-auto"
//             >
//               បោះបង់
//             </button>

//             <button
//               type="button"
//               disabled={saving}
//               onClick={() => void submit()}
//               className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-semibold text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//             >
//               {saving ? (
//                 <Loader2 size={20} className="animate-spin" />
//               ) : (
//                 <Save size={20} />
//               )}
//               រក្សាទុក
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// type FormSelectOption = {
//   value: string;
//   label: string;
// };

// function FormSelect({
//   value,
//   options,
//   onChange,
//   placeholder = "ជ្រើសរើស...",
//   className = "",
// }: {
//   value: string;
//   options: FormSelectOption[];
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
// }) {
//   const [open, setOpen] = useState(false);
//   const [openUpward, setOpenUpward] = useState(false);
//   const [position, setPosition] = useState({
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: 0,
//   });

//   const rootRef = useRef<HTMLDivElement | null>(null);
//   const buttonRef = useRef<HTMLButtonElement | null>(null);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   const selectedOption = options.find((option) => option.value === value);

//   const updatePosition = () => {
//     const button = buttonRef.current;

//     if (!button) {
//       return;
//     }

//     const rect = button.getBoundingClientRect();
//     const availableBelow = window.innerHeight - rect.bottom;
//     const availableAbove = rect.top;
//     const shouldOpenUpward =
//       availableBelow < 280 && availableAbove > availableBelow;

//     setOpenUpward(shouldOpenUpward);
//     setPosition({
//       top: rect.bottom + 8,
//       bottom: window.innerHeight - rect.top + 8,
//       left: rect.left,
//       width: rect.width,
//     });
//   };

//   useEffect(() => {
//     if (!open) {
//       return;
//     }

//     updatePosition();

//     const handlePointerDown = (event: MouseEvent) => {
//       const target = event.target as Node;

//       if (
//         !rootRef.current?.contains(target) &&
//         !menuRef.current?.contains(target)
//       ) {
//         setOpen(false);
//       }
//     };

//     const handleKeyDown = (event: globalThis.KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//         buttonRef.current?.focus();
//       }
//     };

//     const handleViewportChange = () => {
//       updatePosition();
//     };

//     document.addEventListener("mousedown", handlePointerDown);
//     window.addEventListener("resize", handleViewportChange);
//     window.addEventListener("scroll", handleViewportChange, true);
//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("mousedown", handlePointerDown);
//       window.removeEventListener("resize", handleViewportChange);
//       window.removeEventListener("scroll", handleViewportChange, true);
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [open]);

//   return (
//     <div ref={rootRef} className={`relative ${className}`}>
//       <button
//         ref={buttonRef}
//         type="button"
//         onClick={() => {
//           updatePosition();
//           setOpen((current) => !current);
//         }}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         className={`
//           flex
//           h-[52px]
//           w-full
//           items-center
//           justify-between
//           gap-3
//           rounded-xl
//           border
//           bg-gray-50
//           px-4
//           text-left
//           text-lg
//           outline-none
//           transition
//           hover:border-gray-300
//           focus:ring-4
//           focus:ring-primary-100
//           ${open ? "border-primary-600 bg-white" : "border-gray-200"}
//         `}
//       >
//         <span
//           className={`min-w-0 flex-1 truncate ${
//             selectedOption ? "text-gray-800" : "text-gray-400"
//           }`}
//         >
//           {selectedOption?.label ?? placeholder}
//         </span>

//         <ChevronDown
//           size={21}
//           className={`shrink-0 text-gray-400 transition-transform ${
//             open ? "rotate-180 text-primary-700" : ""
//           }`}
//         />
//       </button>

//       {open &&
//         createPortal(
//           <div
//             ref={menuRef}
//             role="listbox"
//             style={{
//               left: position.left,
//               width: position.width,
//               ...(openUpward
//                 ? { bottom: position.bottom }
//                 : { top: position.top }),
//             }}
//             className="fixed z-[300] max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,0.16)] [scrollbar-width:thin]"
//           >
//             {options.length === 0 ? (
//               <div className="px-4 py-4 text-lg text-gray-500">
//                 មិនមានជម្រើស
//               </div>
//             ) : (
//               options.map((option) => {
//                 const selected = option.value === value;

//                 return (
//                   <button
//                     key={option.value}
//                     type="button"
//                     role="option"
//                     aria-selected={selected}
//                     onClick={() => {
//                       onChange(option.value);
//                       setOpen(false);
//                       buttonRef.current?.focus();
//                     }}
//                     className={`
//                       flex
//                       min-h-[48px]
//                       w-full
//                       items-center
//                       justify-between
//                       gap-3
//                       rounded-xl
//                       px-4
//                       py-2.5
//                       text-left
//                       text-lg
//                       transition
//                       ${
//                         selected
//                           ? "bg-primary-50 font-medium text-primary-800"
//                           : "text-gray-700 hover:bg-gray-50"
//                       }
//                     `}
//                   >
//                     <span className="min-w-0 flex-1 break-words">
//                       {option.label}
//                     </span>

//                     {selected && (
//                       <Check size={20} className="shrink-0 text-primary-700" />
//                     )}
//                   </button>
//                 );
//               })
//             )}
//           </div>,
//           document.body,
//         )}
//     </div>
//   );
// }

// const inputClass =
//   "h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100";

// function Label({ children }: { children: React.ReactNode }) {
//   return (
//     <span className="mb-2 block text-lg font-medium text-primary-800">
//       {children}
//     </span>
//   );
// }

// function Field({
//   label,
//   value,
//   onChange,
//   type = "text",
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   type?: string;
// }) {
//   return (
//     <label>
//       <Label>{label}</Label>
//       <input
//         type={type}
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         className={inputClass}
//       />
//     </label>
//   );
// }

"use client";

import { Check, Loader2, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";

import type {
  CuisineOption,
  EventOption,
  FoodAgeRuleRelation,
  FoodCategoryOption,
  FoodDietaryTypeRelation,
  FoodEventRelation,
  FoodMealTypeRelation,
  FoodRecord,
  FoodSeasonRelation,
  FoodWeatherRelation,
  FoodWritePayload,
  NutritionData,
  SeasonOption,
  WeatherConditionOption,
} from "@/src/types/menu-management";
import type { MealType } from "@/src/types/mealType";
import type { AgeGroup } from "@/src/types/ageGroup";
import type { DietaryType } from "@/src/types/dietaryType";

type FormState = {
  canonicalName: string;
  localName: string;
  description: string;
  categoryUuid: string;
  cuisineUuid: string;
  defaultSpiceLevel: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  fiber: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  canonicalName: "",
  localName: "",
  description: "",
  categoryUuid: "",
  cuisineUuid: "",
  defaultSpiceLevel: "0",
  calories: "",
  protein: "",
  carbohydrate: "",
  fat: "",
  fiber: "",
  isActive: true,
};

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export default function FoodFormModal({
  open,
  item,
  categories,
  cuisines,
  seasons = [],
  events = [],
  weatherConditions = [],
  mealTypes = [],
  ageGroups = [],
  dietaryTypes = [],
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: FoodRecord | null;
  categories: FoodCategoryOption[];
  cuisines: CuisineOption[];
  seasons?: SeasonOption[];
  events?: EventOption[];
  weatherConditions?: WeatherConditionOption[];
  mealTypes?: MealType[];
  ageGroups?: AgeGroup[];
  dietaryTypes?: DietaryType[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: FoodWritePayload, images: File[]) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata relations state (all filters in ចម្រោះទិន្នន័យ)
  const [seasonRows, setSeasonRows] = useState<FoodSeasonRelation[]>([]);
  const [eventRows, setEventRows] = useState<FoodEventRelation[]>([]);
  const [weatherRows, setWeatherRows] = useState<FoodWeatherRelation[]>([]);
  const [mealTypeRows, setMealTypeRows] = useState<FoodMealTypeRelation[]>([]);
  const [ageRuleRows, setAgeRuleRows] = useState<FoodAgeRuleRelation[]>([]);
  const [dietaryTypeRows, setDietaryTypeRows] = useState<
    FoodDietaryTypeRelation[]
  >([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setImages([]);
      setExistingImages([]);
      setSeasonRows([]);
      setEventRows([]);
      setWeatherRows([]);
      setMealTypeRows([]);
      setAgeRuleRows([]);
      setDietaryTypeRows([]);
      setError(null);
      return;
    }

    const list = item.images?.length
      ? item.images
      : item.gallery?.length
        ? item.gallery
        : item.primaryMediaUrls?.length
          ? item.primaryMediaUrls
          : item.primaryMediaUuids?.length
            ? item.primaryMediaUuids
            : [(item as any).primaryMediaUuid || item.thumbnail || item.imageUrl].filter(Boolean);
    setExistingImages(list as string[]);


    const matchedCategoryUuid =
      item.categoryUuid ??
      item.category?.uuid ??
      categories.find(
        (c) =>
          (item.category?.code && c.code === item.category.code) ||
          (item.category?.name && c.name === item.category.name) ||
          (item.categoryName && c.name === item.categoryName),
      )?.uuid ??
      "";

    const matchedCuisineUuid =
      item.cuisineUuid ??
      item.cuisine?.uuid ??
      cuisines.find(
        (c) =>
          (item.cuisine?.code && c.code === item.cuisine.code) ||
          (item.cuisine?.name && c.name === item.cuisine.name) ||
          (item.cuisineName && c.name === item.cuisineName),
      )?.uuid ??
      "";

    setValues({
      canonicalName: item.canonicalName ?? "",
      localName: item.localName ?? "",
      description: item.description ?? "",
      categoryUuid: matchedCategoryUuid,
      cuisineUuid: matchedCuisineUuid,
      defaultSpiceLevel: String(item.defaultSpiceLevel ?? 0),
      calories:
        item.nutritionData?.calories != null
          ? String(item.nutritionData.calories)
          : "",
      protein:
        item.nutritionData?.proteinGrams != null
          ? String(item.nutritionData.proteinGrams)
          : "",
      carbohydrate:
        item.nutritionData?.carbohydrateGrams != null
          ? String(item.nutritionData.carbohydrateGrams)
          : item.nutritionData?.carbsGrams != null
            ? String(item.nutritionData.carbsGrams)
            : "",
      fat:
        item.nutritionData?.fatGrams != null
          ? String(item.nutritionData.fatGrams)
          : "",
      fiber:
        item.nutritionData?.fiberGrams != null
          ? String(item.nutritionData.fiberGrams)
          : "",
      isActive: item.isActive !== false,
    });

    // Populate metadata relations if editing
    const rawSeasons = Array.isArray(item.seasons) ? item.seasons : [];
    setSeasonRows(
      rawSeasons
        .map((s: any) => {
          const found = seasons.find(
            (opt) =>
              opt.uuid === s.seasonUuid ||
              opt.uuid === s.uuid ||
              opt.uuid === s.season?.uuid ||
              (s.code && opt.code === s.code) ||
              (s.name && opt.name === s.name),
          );
          return {
            seasonUuid:
              found?.uuid || s.seasonUuid || s.uuid || s.season?.uuid || "",
            suitabilityScore:
              s.suitabilityScore != null ? Number(s.suitabilityScore) : 0.95,
            reasonText: s.reasonText ?? "",
          };
        })
        .filter((s) => Boolean(s.seasonUuid)),
    );

    const rawEvents = Array.isArray(item.events) ? item.events : [];
    setEventRows(
      rawEvents
        .map((e: any) => {
          const found = events.find(
            (opt) =>
              opt.uuid === e.eventUuid ||
              opt.uuid === e.uuid ||
              opt.uuid === e.event?.uuid ||
              (e.code && opt.code === e.code) ||
              (e.name && opt.name === e.name),
          );
          return {
            eventUuid:
              found?.uuid || e.eventUuid || e.uuid || e.event?.uuid || "",
            relevanceScore:
              e.relevanceScore != null ? Number(e.relevanceScore) : 0.9,
            reasonText: e.reasonText ?? "",
          };
        })
        .filter((e) => Boolean(e.eventUuid)),
    );

    const rawWeather = Array.isArray(item.suitableWeather)
      ? item.suitableWeather
      : [];
    setWeatherRows(
      rawWeather
        .map((w: any) => {
          const found = weatherConditions.find(
            (opt) =>
              opt.uuid === w.weatherConditionUuid ||
              opt.uuid === w.uuid ||
              opt.uuid === w.weatherCondition?.uuid ||
              (w.code && opt.code === w.code) ||
              (w.name && opt.name === w.name),
          );
          return {
            weatherConditionUuid:
              found?.uuid ||
              w.weatherConditionUuid ||
              w.uuid ||
              w.weatherCondition?.uuid ||
              "",
            suitabilityScore:
              w.suitabilityScore != null ? Number(w.suitabilityScore) : 0.95,
            reasonText: w.reasonText ?? "",
          };
        })
        .filter((w) => Boolean(w.weatherConditionUuid)),
    );

    const rawMealTypes = Array.isArray(item.mealTypes) ? item.mealTypes : [];
    setMealTypeRows(
      rawMealTypes
        .map((m: any) => {
          const found = mealTypes.find(
            (opt) =>
              opt.uuid === m.mealTypeUuid ||
              opt.uuid === m.uuid ||
              opt.uuid === m.mealType?.uuid ||
              (m.code && opt.code === m.code) ||
              (m.name && opt.name === m.name),
          );
          return {
            mealTypeUuid:
              found?.uuid || m.mealTypeUuid || m.uuid || m.mealType?.uuid || "",
            suitabilityScore:
              m.suitabilityScore != null ? Number(m.suitabilityScore) : 1.0,
          };
        })
        .filter((m) => Boolean(m.mealTypeUuid)),
    );

    const rawAgeRules = Array.isArray(item.ageRules) ? item.ageRules : [];
    setAgeRuleRows(
      rawAgeRules
        .map((a: any) => {
          const found = ageGroups.find(
            (opt) =>
              opt.uuid === a.ageGroupUuid ||
              opt.uuid === a.uuid ||
              opt.uuid === a.ageGroup?.uuid ||
              (a.code && opt.code === a.code) ||
              (a.name && opt.name === a.name),
          );
          return {
            ageGroupUuid:
              found?.uuid || a.ageGroupUuid || a.uuid || a.ageGroup?.uuid || "",
            ruleResult: a.ruleResult || "ALLOWED",
            reasonText: a.reasonText ?? "Suitable as a normal serving.",
          };
        })
        .filter((a) => Boolean(a.ageGroupUuid)),
    );

    const rawDietary = Array.isArray(item.dietaryTypes)
      ? item.dietaryTypes
      : [];
    setDietaryTypeRows(
      rawDietary
        .map((d: any) => {
          const code = d.code ?? d.dietaryTypeCode ?? "";
          const found = dietaryTypes.find(
            (opt) =>
              opt.code === code ||
              opt.uuid === d.uuid ||
              opt.uuid === d.dietaryTypeUuid,
          );
          return {
            code: found?.code || code,
            name: found?.name || d.name || code,
          };
        })
        .filter((d) => Boolean(d.code)),
    );

    setImages([]);
    setError(null);
  }, [
    item,
    open,
    categories,
    cuisines,
    seasons,
    events,
    weatherConditions,
    mealTypes,
    ageGroups,
    dietaryTypes,
  ]);

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.isActive !== false);
  }, [categories]);

  const activeCuisines = useMemo(() => {
    return cuisines.filter((cuisine) => cuisine.isActive !== false);
  }, [cuisines]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving, onClose]);

  const submit = async () => {
    try {
      setError(null);

      if (!values.canonicalName.trim()) {
        throw new Error("Canonical name is required.");
      }

      if (!values.categoryUuid) {
        throw new Error("Category (ប្រភេទម្ហូប) is required.");
      }

      if (!values.cuisineUuid) {
        throw new Error("Cuisine (ម្ហូបតាមប្រទេស) is required.");
      }

      const nutritionData: NutritionData = {
        calories: numberOrNull(values.calories) ?? 0,
        proteinGrams: numberOrNull(values.protein) ?? 0,
        carbohydrateGrams: numberOrNull(values.carbohydrate) ?? 0,
        fatGrams: numberOrNull(values.fat) ?? 0,
        fiberGrams: numberOrNull(values.fiber) ?? 0,
      };

      const hasImages = Array.isArray(images) && images.length > 0;

      const payload: FoodWritePayload = {
        canonicalName: values.canonicalName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        categoryUuid: values.categoryUuid,
        cuisineUuid: values.cuisineUuid,
        ...(hasImages
          ? {}
          : { primaryMediaUuids: item?.primaryMediaUuids ?? [] }),
        defaultSpiceLevel: numberOrNull(values.defaultSpiceLevel) ?? 0,
        nutritionData,
        seasons: seasonRows
          .filter((r) => Boolean(r.seasonUuid))
          .map((r) => ({
            seasonUuid: r.seasonUuid,
            suitabilityScore: r.suitabilityScore ?? 0.95,
            reasonText: r.reasonText?.trim() || null,
          })),
        dietaryTypes: dietaryTypeRows
          .filter((r) => Boolean(r.code))
          .map((r) => ({
            code: r.code,
            name: r.name || r.code,
          })),
        events: eventRows
          .filter((r) => Boolean(r.eventUuid))
          .map((r) => ({
            eventUuid: r.eventUuid,
            relevanceScore: r.relevanceScore ?? 0.9,
            reasonText: r.reasonText?.trim() || null,
          })),
        suitableWeather: weatherRows
          .filter((r) => Boolean(r.weatherConditionUuid))
          .map((r) => ({
            weatherConditionUuid: r.weatherConditionUuid,
            suitabilityScore: r.suitabilityScore ?? 0.95,
            reasonText: r.reasonText?.trim() || null,
          })),
        mealTypes: mealTypeRows
          .filter((r) => Boolean(r.mealTypeUuid))
          .map((r) => ({
            mealTypeUuid: r.mealTypeUuid,
            suitabilityScore: r.suitabilityScore ?? 1.0,
          })),
        ageRules: ageRuleRows
          .filter((r) => Boolean(r.ageGroupUuid))
          .map((r) => ({
            ageGroupUuid: r.ageGroupUuid,
            ruleResult: r.ruleResult || "ALLOWED",
            reasonText: r.reasonText?.trim() || "Suitable as a normal serving.",
          })),
        isActive: values.isActive,
      };

      await onSubmit(payload, images);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save Food.",
      );
    }
  };

  const toggleDietaryType = (code: string) => {
    setDietaryTypeRows((current) => {
      const exists = current.some((row) => row.code === code);

      if (exists) {
        return current.filter((row) => row.code !== code);
      }

      const option = dietaryTypes.find((row) => row.code === code);

      return [
        ...current,
        {
          code,
          name: option?.name ?? code,
        },
      ];
    });
  };

  const toggleMealType = (uuid: string) => {
    setMealTypeRows((current) => {
      const exists = current.some((row) => row.mealTypeUuid === uuid);

      if (exists) {
        return current.filter((row) => row.mealTypeUuid !== uuid);
      }

      return [
        ...current,
        {
          mealTypeUuid: uuid,
          suitabilityScore: 1.0,
        },
      ];
    });
  };

  const toggleAgeGroup = (uuid: string) => {
    setAgeRuleRows((current) => {
      const exists = current.some((row) => row.ageGroupUuid === uuid);

      if (exists) {
        return current.filter((row) => row.ageGroupUuid !== uuid);
      }

      return [
        ...current,
        {
          ageGroupUuid: uuid,
          ruleResult: "ALLOWED",
          reasonText: "Suitable as a normal serving.",
        },
      ];
    });
  };

  const toggleSeason = (uuid: string) => {
    setSeasonRows((current) => {
      const exists = current.some((row) => row.seasonUuid === uuid);

      if (exists) {
        return current.filter((row) => row.seasonUuid !== uuid);
      }

      return [
        ...current,
        {
          seasonUuid: uuid,
          suitabilityScore: 1.0,
          reasonText: "",
        },
      ];
    });
  };

  const toggleEvent = (uuid: string) => {
    setEventRows((current) => {
      const exists = current.some((row) => row.eventUuid === uuid);

      if (exists) {
        return current.filter((row) => row.eventUuid !== uuid);
      }

      return [
        ...current,
        {
          eventUuid: uuid,
          relevanceScore: 0.9,
          reasonText: "",
        },
      ];
    });
  };

  const toggleWeather = (uuid: string) => {
    setWeatherRows((current) => {
      const exists = current.some((row) => row.weatherConditionUuid === uuid);

      if (exists) {
        return current.filter((row) => row.weatherConditionUuid !== uuid);
      }

      return [
        ...current,
        {
          weatherConditionUuid: uuid,
          suitabilityScore: 0.8,
          reasonText: "",
        },
      ];
    });
  };

  const selectedDietaryCodes = dietaryTypeRows.map((row) => row.code);
  const selectedMealTypeUuids = mealTypeRows.map((row) => row.mealTypeUuid);
  const selectedAgeGroupUuids = ageRuleRows.map((row) => row.ageGroupUuid);
  const selectedSeasonUuids = seasonRows.map((row) => row.seasonUuid);
  const selectedEventUuids = eventRows.map((row) => row.eventUuid);
  const selectedWeatherUuids = weatherRows.map(
    (row) => row.weatherConditionUuid,
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-form-title"
    >
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* =================================================
            STICKY HEADER
        ================================================== */}
        <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="min-w-0">
            <p
              id="food-form-title"
              className="text-3xl font-semibold text-primary-800"
            >
              {item ? "កែប្រែមីនុយ" : "បន្ថែមមីនុយ"}
            </p>

            <p className="mt-2 text-lg leading-7 text-gray-500">
              កំណត់ព័ត៌មានម្ហូប និងជ្រើសលក្ខណៈសមស្របដោយចុចលើជម្រើស។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="បិទ"
            title="បិទ"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-6 pb-0 sm:p-8 sm:pb-0">
          {/* =================================================
              BASIC INFORMATION
          ================================================== */}
          <FormSection
            title="ព័ត៌មានមូលដ្ឋាន"
            description="បញ្ចូលព័ត៌មានសំខាន់ៗរបស់ម្ហូប និងជ្រើស Category និង Cuisine។"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Canonical name"
                value={values.canonicalName}
                placeholder="ឧ. Beef Lok Lak"
                required
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    canonicalName: value,
                  }))
                }
              />

              <Field
                label="ឈ្មោះខ្មែរ"
                value={values.localName}
                placeholder="ឧ. ឡុកឡាក់សាច់គោ"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    localName: value,
                  }))
                }
              />

              <div className="md:col-span-2">
                <OptionFieldLabel
                  label="Category (ប្រភេទម្ហូប)"
                  required
                  description="ជ្រើសតែមួយ។ ចុចលើជម្រើសដែលបានជ្រើសម្ដងទៀត ដើម្បីដកការជ្រើស។"
                />

                <OptionPills
                  options={activeCategories.map((category) => ({
                    value: category.uuid,
                    // label: `${category.name} (${category.code})`,
                      label: `${category.name} `,
                  }))}
                  selectedValues={
                    values.categoryUuid ? [values.categoryUuid] : []
                  }
                  onToggle={(value) =>
                    setValues((current) => ({
                      ...current,
                      categoryUuid: current.categoryUuid === value ? "" : value,
                    }))
                  }
                  emptyText="មិនមាន Category សម្រាប់ជ្រើសរើស។"
                />
              </div>

              <div className="md:col-span-2">
                <OptionFieldLabel
                  label="Cuisine (ម្ហូបតាមប្រទេស)"
                  required
                  description="ជ្រើស Cuisine មួយដែលតំណាងឱ្យម្ហូបនេះ។"
                />

                <OptionPills
                  options={activeCuisines.map((cuisine) => ({
                    value: cuisine.uuid,
                    label: cuisine.name,
                  }))}
                  selectedValues={
                    values.cuisineUuid ? [values.cuisineUuid] : []
                  }
                  onToggle={(value) =>
                    setValues((current) => ({
                      ...current,
                      cuisineUuid: current.cuisineUuid === value ? "" : value,
                    }))
                  }
                  emptyText="មិនមាន Cuisine សម្រាប់ជ្រើសរើស។"
                />
              </div>

              <Field
                label="Spice level"
                type="number"
                value={values.defaultSpiceLevel}
                placeholder="0"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    defaultSpiceLevel: value,
                  }))
                }
              />

              <StatusToggle
                checked={values.isActive}
                onChange={(checked) =>
                  setValues((current) => ({
                    ...current,
                    isActive: checked,
                  }))
                }
              />

              <label className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  rows={4}
                  value={values.description}
                  placeholder="សរសេរការពិពណ៌នាអំពីម្ហូប..."
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={`${inputClass} h-auto resize-none py-3.5 leading-8`}
                />
              </label>
            </div>
          </FormSection>

          {/* =================================================
              NUTRITION
          ================================================== */}
          <FormSection
            title="Nutrition"
            description="កំណត់តម្លៃអាហារូបត្ថម្ភសម្រាប់ម្ហូបនេះ។"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["calories", "Calories"],
                ["protein", "Protein (g)"],
                ["carbohydrate", "Carbohydrate (g)"],
                ["fat", "Fat (g)"],
                ["fiber", "Fiber (g)"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  type="number"
                  value={
                    values[
                      key as keyof Pick<
                        FormState,
                        | "calories"
                        | "protein"
                        | "carbohydrate"
                        | "fat"
                        | "fiber"
                      >
                    ]
                  }
                  placeholder="0"
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              ))}
            </div>
          </FormSection>

          {/* =================================================
              DIETARY TYPES
          ================================================== */}
          <PreferenceSection
            title="របបអាហារ"
            description="ជ្រើសរបបអាហារដែលត្រូវគ្នា។ អ្នកអាចជ្រើសច្រើន។"
            selectedCount={dietaryTypeRows.length}
          >
            <OptionPills
              options={dietaryTypes.map((dietaryType) => ({
                value: dietaryType.code,
                label: `${dietaryType.name} `,
              }))}
              selectedValues={selectedDietaryCodes}
              onToggle={toggleDietaryType}
              emptyText="មិនមានជម្រើសរបបអាហារ។"
            />
          </PreferenceSection>

          {/* =================================================
              MEAL TYPES
          ================================================== */}
          <PreferenceSection
            title="ពេលទទួលទាន"
            description="ជ្រើសពេលទទួលទានដែលសមស្រប ហើយកំណត់ពិន្ទុសាកសម។"
            selectedCount={mealTypeRows.length}
          >
            <OptionPills
              options={mealTypes.map((mealType) => ({
                value: mealType.uuid,
                label: `${mealType.name} `,
              }))}
              selectedValues={selectedMealTypeUuids}
              onToggle={toggleMealType}
              emptyText="មិនមានជម្រើសពេលទទួលទាន។"
            />

            {mealTypeRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {mealTypeRows.map((row) => {
                  const option = mealTypes.find(
                    (mealType) => mealType.uuid === row.mealTypeUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.mealTypeUuid}
                      title={`${option.name} (${option.code})`}
                      onRemove={() => toggleMealType(row.mealTypeUuid)}
                    >
                      <ScoreField
                        label="ពិន្ទុសាកសម"
                        value={row.suitabilityScore ?? 1}
                        onChange={(value) =>
                          setMealTypeRows((current) =>
                            current.map((currentRow) =>
                              currentRow.mealTypeUuid === row.mealTypeUuid
                                ? {
                                    ...currentRow,
                                    suitabilityScore: value,
                                  }
                                : currentRow,
                            ),
                          )
                        }
                      />
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              AGE RULES
          ================================================== */}
          <PreferenceSection
            title="ក្រុមអាយុ"
            description="ជ្រើសក្រុមអាយុ ហើយកំណត់ថា Allowed, Warning ឬ Restricted។"
            selectedCount={ageRuleRows.length}
          >
            <OptionPills
              options={ageGroups.map((ageGroup) => ({
                value: ageGroup.uuid,
                label: `${ageGroup.name} `,
              }))}
              selectedValues={selectedAgeGroupUuids}
              onToggle={toggleAgeGroup}
              emptyText="មិនមានជម្រើសក្រុមអាយុ។"
            />

            {ageRuleRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {ageRuleRows.map((row) => {
                  const option = ageGroups.find(
                    (ageGroup) => ageGroup.uuid === row.ageGroupUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.ageGroupUuid}
                      title={`${option.name} (${option.code})`}
                      onRemove={() => toggleAgeGroup(row.ageGroupUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                        <div>
                          <Label>លទ្ធផល Rule</Label>

                          <div className="flex flex-wrap gap-3">
                            {["ALLOWED", "WARNING", "RESTRICTED"].map(
                              (ruleResult) => {
                                const selected =
                                  (row.ruleResult || "ALLOWED") === ruleResult;

                                return (
                                  <button
                                    key={ruleResult}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() =>
                                      setAgeRuleRows((current) =>
                                        current.map((currentRow) =>
                                          currentRow.ageGroupUuid ===
                                          row.ageGroupUuid
                                            ? {
                                                ...currentRow,
                                                ruleResult,
                                              }
                                            : currentRow,
                                        ),
                                      )
                                    }
                                    className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border px-5 text-lg font-semibold transition ${
                                      selected
                                        ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700"
                                    }`}
                                  >
                                    {selected && <Check size={20} />}
                                    {ruleResult}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          placeholder="ឧ. Suitable as a normal serving."
                          onChange={(value) =>
                            setAgeRuleRows((current) =>
                              current.map((currentRow) =>
                                currentRow.ageGroupUuid === row.ageGroupUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              SEASONS
          ================================================== */}
          <PreferenceSection
            title="រដូវកាល"
            description="ជ្រើសរដូវកាលដែលសាកសមសម្រាប់ម្ហូបនេះ។"
            selectedCount={seasonRows.length}
          >
            <OptionPills
              options={seasons.map((season) => ({
                value: season.uuid,
                label: `${season.name}${
                  season.localName ? ` (${season.localName})` : ""
                }`,
              }))}
              selectedValues={selectedSeasonUuids}
              onToggle={toggleSeason}
              emptyText="មិនមានជម្រើសរដូវកាល។"
            />

            {seasonRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {seasonRows.map((row) => {
                  const option = seasons.find(
                    (season) => season.uuid === row.seasonUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.seasonUuid}
                      title={`${option.name}${
                        option.localName ? ` (${option.localName})` : ""
                      }`}
                      onRemove={() => toggleSeason(row.seasonUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ScoreField
                          label="ពិន្ទុសាកសម"
                          value={row.suitabilityScore ?? 1}
                          onChange={(value) =>
                            setSeasonRows((current) =>
                              current.map((currentRow) =>
                                currentRow.seasonUuid === row.seasonUuid
                                  ? {
                                      ...currentRow,
                                      suitabilityScore: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          onChange={(value) =>
                            setSeasonRows((current) =>
                              current.map((currentRow) =>
                                currentRow.seasonUuid === row.seasonUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              EVENTS
          ================================================== */}
          <PreferenceSection
            title="ព្រឹត្តិការណ៍ / បុណ្យទាន"
            description="ជ្រើសពិធីបុណ្យ ឬព្រឹត្តិការណ៍ដែលពាក់ព័ន្ធនឹងម្ហូបនេះ។"
            selectedCount={eventRows.length}
          >
            <OptionPills
              options={events.map((eventOption) => ({
                value: eventOption.uuid,
                label: `${eventOption.name}${
                  eventOption.localName ? ` (${eventOption.localName})` : ""
                }`,
              }))}
              selectedValues={selectedEventUuids}
              onToggle={toggleEvent}
              emptyText="មិនមានជម្រើសព្រឹត្តិការណ៍។"
            />

            {eventRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {eventRows.map((row) => {
                  const option = events.find(
                    (eventOption) => eventOption.uuid === row.eventUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.eventUuid}
                      title={`${option.name}${
                        option.localName ? ` (${option.localName})` : ""
                      }`}
                      onRemove={() => toggleEvent(row.eventUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ScoreField
                          label="Relevance score"
                          value={row.relevanceScore ?? 0.9}
                          onChange={(value) =>
                            setEventRows((current) =>
                              current.map((currentRow) =>
                                currentRow.eventUuid === row.eventUuid
                                  ? {
                                      ...currentRow,
                                      relevanceScore: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          onChange={(value) =>
                            setEventRows((current) =>
                              current.map((currentRow) =>
                                currentRow.eventUuid === row.eventUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              WEATHER
          ================================================== */}
          <PreferenceSection
            title="ស្ថានភាពអាកាសធាតុ"
            description="ជ្រើសអាកាសធាតុដែលសាកសមសម្រាប់ម្ហូបនេះ។"
            selectedCount={weatherRows.length}
          >
            <OptionPills
              options={weatherConditions.map((weather) => ({
                value: weather.uuid,
                label: `${weather.name}${
                  weather.localName ? ` (${weather.localName})` : ""
                }`,
              }))}
              selectedValues={selectedWeatherUuids}
              onToggle={toggleWeather}
              emptyText="មិនមានជម្រើសអាកាសធាតុ។"
            />

            {weatherRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {weatherRows.map((row) => {
                  const option = weatherConditions.find(
                    (weather) => weather.uuid === row.weatherConditionUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.weatherConditionUuid}
                      title={`${option.name}${
                        option.localName ? ` (${option.localName})` : ""
                      }`}
                      onRemove={() => toggleWeather(row.weatherConditionUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ScoreField
                          label="ពិន្ទុសាកសម"
                          value={row.suitabilityScore ?? 0.8}
                          onChange={(value) =>
                            setWeatherRows((current) =>
                              current.map((currentRow) =>
                                currentRow.weatherConditionUuid ===
                                row.weatherConditionUuid
                                  ? {
                                      ...currentRow,
                                      suitabilityScore: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          onChange={(value) =>
                            setWeatherRows((current) =>
                              current.map((currentRow) =>
                                currentRow.weatherConditionUuid ===
                                row.weatherConditionUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              IMAGES
          ================================================== */}
          <ImagePicker
            value={images}
            onChange={setImages}
            existingImages={existingImages}
            onExistingChange={setExistingImages}
            label={
              item
                ? "រូបភាព (ទុកទទេ = រក្សារូបចាស់)"
                : "រូបភាព Food (អតិបរមា 4)"
            }
          />

          {/* =================================================
              ERROR
          ================================================== */}
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              STICKY ACTIONS
          ================================================== */}
          <div className="sticky bottom-0 z-40 -mx-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-semibold text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}

              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE UI
========================================================= */

type ChoiceOption = {
  value: string;
  label: string;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-3xl font-semibold text-primary-800">{title}</p>
        <p className="mt-2 text-lg leading-7 text-gray-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function PreferenceSection({
  title,
  description,
  selectedCount,
  children,
}: {
  title: string;
  description: string;
  selectedCount: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-3xl font-semibold text-primary-800">{title}</p>
          <p className="mt-2 text-lg leading-7 text-gray-500">{description}</p>
        </div>

        <div className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-secondary-50 px-4 text-lg font-semibold text-secondary-700">
          បានជ្រើស {selectedCount}
        </div>
      </div>

      {children}
    </section>
  );
}

function OptionFieldLabel({
  label,
  description,
  required = false,
}: {
  label: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-3">
      <p className="text-lg font-medium text-primary-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </p>

      {description && (
        <p className="mt-1 text-lg leading-7 text-gray-500">{description}</p>
      )}
    </div>
  );
}

function OptionPills({
  options,
  selectedValues,
  onToggle,
  emptyText,
}: {
  options: ChoiceOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  emptyText: string;
}) {
  if (options.length === 0) {
    return (
      <p className="rounded-2xl bg-gray-50 px-4 py-4 text-lg text-gray-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/60 p-4 [scrollbar-width:thin]">
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(option.value)}
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border px-5 text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ${
                selected
                  ? "border-primary-800 bg-primary-800 text-white shadow-sm focus:ring-primary-100"
                  : "border-gray-200 bg-white text-gray-700 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700 focus:ring-secondary-100"
              }`}
            >
              {selected && <Check size={20} strokeWidth={2.5} />}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedOptionCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/30 p-5">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-primary-100 pb-4">
        <div className="min-w-0">
          <p className="text-xl font-semibold text-primary-800">{title}</p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-lg font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
        >
          <Trash2 size={20} />
          លុប
        </button>
      </div>

      {children}
    </div>
  );
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <Label>{label} (0–1)</Label>

      <input
        type="number"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClass}
      />
    </label>
  );
}

function ReasonField({
  label,
  value,
  onChange,
  placeholder = "ហេតុផល (Reason)...",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function StatusToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-lg font-medium text-primary-800">ស្ថានភាព</p>
        <p className="mt-1 text-lg leading-7 text-gray-500">
          បើក ដើម្បីឱ្យម្ហូបនេះអាចប្រើបានក្នុងប្រព័ន្ធ។
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
          checked ? "bg-primary-700" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-lg font-medium text-primary-800">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-lg font-medium text-primary-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}
