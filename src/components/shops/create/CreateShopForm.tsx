// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Save } from "lucide-react";
// import { useCreateShopMutation } from "@/src/app/store/shopApi";
// import ShopImageUploadGrid from "./ShopImageUploadGrid";
// import ShopBasicInfoSection from "./ShopBasicInfoSection";
// import ShopHoursSection from "./ShopHoursSection";
// import ShopSocialSection from "./ShopSocialSection";
// import ShopLocationSection from "./ShopLocationSection";

// export default function CreateShopForm() {
//   const router = useRouter();
//   const [createShop, { isLoading }] = useCreateShopMutation();

//   const [images, setImages] = useState<string[]>([]);
//   const [name, setName] = useState("");
//   const [address, setAddress] = useState("");
//   const [openTime, setOpenTime] = useState("");
//   const [closeTime, setCloseTime] = useState("");
//   const [description, setDescription] = useState("");
//   const [socialLink, setSocialLink] = useState("");
//   const [latitude, setLatitude] = useState<number | null>(null);
//   const [longitude, setLongitude] = useState<number | null>(null);

//   const handleAddImages = (files: FileList) => {
//     const urls = Array.from(files).map((f) => URL.createObjectURL(f));
//     setImages((prev) => [...prev, ...urls]);
//   };

//   const handleRemoveImage = (index: number) => {
//     setImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const buildPayload = (status: "draft" | "published") => ({
//     images,
//     name,
//     address,
//     openTime,
//     closeTime,
//     description,
//     socialLink,
//     latitude,
//     longitude,
//     status,
//   });

//   const handleCancel = () => {
//     router.push("/dashboard/shops");
//   };

//   const handleSubmit = async () => {
//     if (!name.trim() || !address.trim() || !openTime.trim() || !closeTime.trim()) {
//       return;
//     }
//     // await createShop(buildPayload("published"));
//     router.push("/dashboard/shops");
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-6 py-6">
//       <p className="text-4xl font-bold text-gray-800 mb-6">
//         បន្ថែមភោជនីយដ្ឋានថ្មី
//       </p>

//       <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-8">
//         <ShopImageUploadGrid
//           images={images}
//           onAdd={handleAddImages}
//           onRemove={handleRemoveImage}
//         />

//         <ShopBasicInfoSection
//           name={name}
//           onNameChange={setName}
//           address={address}
//           onAddressChange={setAddress}
//         />

//         <ShopHoursSection
//           openTime={openTime}
//           onOpenTimeChange={setOpenTime}
//           closeTime={closeTime}
//           onCloseTimeChange={setCloseTime}
//           description={description}
//           onDescriptionChange={setDescription}
//         />

//         <ShopSocialSection
//           socialLink={socialLink}
//           onSocialLinkChange={setSocialLink}
//         />

//         <ShopLocationSection
//           address={address}
//           latitude={latitude}
//           longitude={longitude}
//           onLatLngChange={(lat, lng) => {
//             setLatitude(lat);
//             setLongitude(lng);
//           }}
//         />
//       </div>

//       <div className="flex items-center justify-start gap-3 mt-6">
//         <button
//           onClick={handleCancel}
//           className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
//         >
//           កំណត់ឡើងវិញ
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={isLoading}
//           className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg disabled:opacity-60"
//         >
//           <Save size={16} />
//           បន្ថែមភោជនីយដ្ឋាន
//         </button>
//       </div>
//     </div>
//   );
// }




























// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Plus, Save, Trash2 } from "lucide-react";
// import { useCreateShopMutation } from "@/src/app/store/shopApi";
// import {
//   CreateShopPayload,
//   DayOfWeek,
//   OpeningHourEntry,
//   PriceLevel,
//   SocialLink,
// } from "@/src/types/shop";

// const DAYS: DayOfWeek[] = [
//   "MONDAY",
//   "TUESDAY",
//   "WEDNESDAY",
//   "THURSDAY",
//   "FRIDAY",
//   "SATURDAY",
//   "SUNDAY",
// ];

// const emptyHours: OpeningHourEntry[] = DAYS.map((day) => ({
//   dayOfWeek: day,
//   openTime: "08:00",
//   closeTime: "22:00",
//   isClosed: false,
// }));

// export default function CreateShopForm() {
//   const router = useRouter();
//   const [createShop, { isLoading }] = useCreateShopMutation();

//   const [storeName, setStoreName] = useState("");
//   const [description, setDescription] = useState("");
//   const [addressLine, setAddressLine] = useState("");
//   const [commune, setCommune] = useState("");
//   const [district, setDistrict] = useState("");
//   const [city, setCity] = useState("");
//   const [province, setProvince] = useState("");
//   const [countryCode, setCountryCode] = useState("KH");
//   const [postalCode, setPostalCode] = useState("");
//   const [timezone, setTimezone] = useState("Asia/Phnom_Penh");
//   const [latitude, setLatitude] = useState<number | null>(null);
//   const [longitude, setLongitude] = useState<number | null>(null);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [logoUrl, setLogoUrl] = useState("");
//   const [coverImageUrl, setCoverImageUrl] = useState("");
//   const [priceLevel, setPriceLevel] = useState<PriceLevel>(null);
//   const [openingHours, setOpeningHours] =
//     useState<OpeningHourEntry[]>(emptyHours);
//   const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

//   const updateHour = (day: DayOfWeek, changes: Partial<OpeningHourEntry>) => {
//     setOpeningHours((prev) =>
//       prev.map((h) => (h.dayOfWeek === day ? { ...h, ...changes } : h))
//     );
//   };

//   const addSocialLink = () => {
//     setSocialLinks((prev) => [...prev, { platform: "facebook", url: "" }]);
//   };

//   const updateSocialLink = (index: number, changes: Partial<SocialLink>) => {
//     setSocialLinks((prev) =>
//       prev.map((s, i) => (i === index ? { ...s, ...changes } : s))
//     );
//   };

//   const removeSocialLink = (index: number) => {
//     setSocialLinks((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     if (!storeName.trim() || !addressLine.trim() || !district.trim() || !city.trim() || !province.trim()) {
//       return;
//     }

//     const payload: CreateShopPayload = {
//       storeName,
//       description,
//       addressLine,
//       commune: commune || null,
//       district,
//       city,
//       province,
//       countryCode,
//       postalCode: postalCode || null,
//       timezone,
//       latitude,
//       longitude,
//       phoneNumber,
//       email,
//       logoUrl: logoUrl || null,
//       coverImageUrl: coverImageUrl || null,
//       priceLevel,
//       hygieneRating: null,
//       reviewStatus: "PENDING",
//       operatingStatus: "UNKNOWN",
//       accountStatus: "ACTIVE",
//       socialLinks,
//       openingHours,
//       externalSource: null,
//     };

//     await createShop(payload);
//     router.push("/shops");
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-6">
//       <h1 className="text-2xl sm:text-3xl font-bold text-[#136C34]">
//         បន្ថែមហាងថ្មី
//       </h1>

//       {/* Basic Info */}
//       <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
//         <h2 className="text-lg font-bold text-gray-800">ព័ត៌មានមូលដ្ឋាន</h2>
//         <div>
//           <label className="text-sm text-gray-600 mb-1 block">
//             ឈ្មោះហាង <span className="text-red-500">*</span>
//           </label>
//           <input
//             value={storeName}
//             onChange={(e) => setStoreName(e.target.value)}
//             className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           />
//         </div>
//         <div>
//           <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា</label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={3}
//             className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//           />
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">លេខទូរស័ព្ទ</label>
//             <input
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               placeholder="+855..."
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">អ៊ីមែល</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Images */}
//       <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
//         <h2 className="text-lg font-bold text-gray-800">រូបភាព</h2>
//         <p className="text-xs text-gray-400">
//           បណ្តោះអាសន្នប្រើ URL — នឹងផ្លាស់ប្តូរជា upload ពិតប្រាកដនៅពេលមាន media API
//         </p>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Logo URL</label>
//             <input
//               value={logoUrl}
//               onChange={(e) => setLogoUrl(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Cover Image URL</label>
//             <input
//               value={coverImageUrl}
//               onChange={(e) => setCoverImageUrl(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Location */}
//       <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
//         <h2 className="text-lg font-bold text-gray-800">ទីតាំង</h2>
//         <div>
//           <label className="text-sm text-gray-600 mb-1 block">
//             អាសយដ្ឋាន <span className="text-red-500">*</span>
//           </label>
//           <textarea
//             value={addressLine}
//             onChange={(e) => setAddressLine(e.target.value)}
//             rows={2}
//             className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//           />
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">ឃុំ/សង្កាត់</label>
//             <input
//               value={commune}
//               onChange={(e) => setCommune(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">
//               ស្រុក/ខណ្ឌ <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={district}
//               onChange={(e) => setDistrict(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">
//               ខេត្ត/ក្រុង <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={city}
//               onChange={(e) => setCity(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">
//               ខេត្ត (province) <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={province}
//               onChange={(e) => setProvince(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//         </div>
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Country</label>
//             <input
//               value={countryCode}
//               onChange={(e) => setCountryCode(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Postal</label>
//             <input
//               value={postalCode}
//               onChange={(e) => setPostalCode(e.target.value)}
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Lat</label>
//             <input
//               type="number"
//               step="any"
//               value={latitude ?? ""}
//               onChange={(e) =>
//                 setLatitude(e.target.value ? Number(e.target.value) : null)
//               }
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-gray-600 mb-1 block">Lng</label>
//             <input
//               type="number"
//               step="any"
//               value={longitude ?? ""}
//               onChange={(e) =>
//                 setLongitude(e.target.value ? Number(e.target.value) : null)
//               }
//               className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
//         </div>
//         <div>
//           <label className="text-sm text-gray-600 mb-1 block">Timezone</label>
//           <input
//             value={timezone}
//             onChange={(e) => setTimezone(e.target.value)}
//             className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           />
//         </div>
//       </div>

//       {/* Business details */}
//       <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
//         <h2 className="text-lg font-bold text-gray-800">ព័ត៌មានអាជីវកម្ម</h2>
//         <div>
//           <label className="text-sm text-gray-600 mb-1 block">តម្លៃ</label>
//           <select
//             value={priceLevel ?? ""}
//             onChange={(e) =>
//               setPriceLevel((e.target.value || null) as PriceLevel)
//             }
//             className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           >
//             <option value="">មិនកំណត់</option>
//             <option value="LOW">$</option>
//             <option value="MEDIUM">$$</option>
//             <option value="HIGH">$$$</option>
//           </select>
//         </div>
//       </div>

//       {/* Opening hours */}
//       <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-3">
//         <h2 className="text-lg font-bold text-gray-800">ម៉ោងបើក/បិទ</h2>
//         {openingHours.map((h) => (
//           <div
//             key={h.dayOfWeek}
//             className="flex flex-wrap items-center gap-3 border-b border-gray-50 pb-3 last:border-0"
//           >
//             <span className="w-24 text-sm text-gray-600 shrink-0">
//               {h.dayOfWeek}
//             </span>
//             <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
//               <input
//                 type="checkbox"
//                 checked={!h.isClosed}
//                 onChange={(e) =>
//                   updateHour(h.dayOfWeek, { isClosed: !e.target.checked })
//                 }
//                 className="accent-emerald-600"
//               />
//               បើក
//             </label>
//             <input
//               type="time"
//               value={h.openTime}
//               disabled={h.isClosed}
//               onChange={(e) => updateHour(h.dayOfWeek, { openTime: e.target.value })}
//               className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 disabled:opacity-40"
//             />
//             <span className="text-gray-400 text-sm">–</span>
//             <input
//               type="time"
//               value={h.closeTime}
//               disabled={h.isClosed}
//               onChange={(e) => updateHour(h.dayOfWeek, { closeTime: e.target.value })}
//               className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 disabled:opacity-40"
//             />
//           </div>
//         ))}
//       </div>

//       {/* Social links */}
//       <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-3">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-bold text-gray-800">តំណភ្ជាប់សង្គម</h2>
//           <button
//             onClick={addSocialLink}
//             className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
//           >
//             <Plus size={16} />
//             បន្ថែម
//           </button>
//         </div>
//         {socialLinks.map((link, i) => (
//           <div key={i} className="flex flex-col sm:flex-row gap-2">
//             <input
//               value={link.platform}
//               onChange={(e) => updateSocialLink(i, { platform: e.target.value })}
//               placeholder="facebook"
//               className="sm:w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//             <input
//               value={link.url}
//               onChange={(e) => updateSocialLink(i, { url: e.target.value })}
//               placeholder="https://..."
//               className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//             <button
//               onClick={() => removeSocialLink(i)}
//               className="text-red-400 hover:text-red-600 shrink-0 self-center"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="flex items-center justify-end gap-3 pb-6">
//         <button
//           onClick={() => router.push("/shops")}
//           className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
//         >
//           បោះបង់
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={isLoading}
//           className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
//         >
//           <Save size={16} />
//           បន្ថែមហាង
//         </button>
//       </div>
//     </div>
//   );
// }































"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { useCreateShopMutation } from "@/src/app/store/shopApi";
import {
  CreateShopPayload,
  DayOfWeek,
  OpeningHourEntry,
  PriceLevel,
  SocialLink,
} from "@/src/types/shop";
import ShopImageUploadGrid from "./ShopImageUploadGrid";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const emptyHours: OpeningHourEntry[] = DAYS.map((day) => ({
  dayOfWeek: day,
  openTime: "08:00",
  closeTime: "22:00",
  isClosed: false,
}));

export default function CreateShopForm() {
  const router = useRouter();
  const [createShop, { isLoading }] = useCreateShopMutation();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [commune, setCommune] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [countryCode, setCountryCode] = useState("KH");
  const [postalCode, setPostalCode] = useState("");
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [priceLevel, setPriceLevel] = useState<PriceLevel>(null);
  const [openingHours, setOpeningHours] =
    useState<OpeningHourEntry[]>(emptyHours);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const updateHour = (day: DayOfWeek, changes: Partial<OpeningHourEntry>) => {
    setOpeningHours((prev) =>
      prev.map((h) => (h.dayOfWeek === day ? { ...h, ...changes } : h))
    );
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "facebook", url: "" }]);
  };

  const updateSocialLink = (index: number, changes: Partial<SocialLink>) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...changes } : s))
    );
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!storeName.trim() || !addressLine.trim() || !district.trim() || !city.trim() || !province.trim()) {
      return;
    }

    const payload: CreateShopPayload = {
      storeName,
      description,
      addressLine,
      commune: commune || null,
      district,
      city,
      province,
      countryCode,
      postalCode: postalCode || null,
      timezone,
      latitude,
      longitude,
      phoneNumber,
      email,
      logoUrl: logoUrl || null,
      coverImageUrl: coverImageUrl || null,
      priceLevel,
      hygieneRating: null,
      reviewStatus: "PENDING",
      operatingStatus: "UNKNOWN",
      accountStatus: "ACTIVE",
      socialLinks,
      openingHours,
      externalSource: null,
    };

    await createShop(payload);
    router.push("/shops");
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#136C34]">
        បន្ថែមហាងថ្មី
      </h1>

      {/* Basic Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ព័ត៌មានមូលដ្ឋាន</h2>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            ឈ្មោះហាង <span className="text-red-500">*</span>
          </label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">លេខទូរស័ព្ទ</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+855..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">អ៊ីមែល</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Images — now real device upload */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-800">រូបភាព</h2>

        <ShopImageUploadGrid
          label="Logo"
          imageUrl={logoUrl}
          onChange={setLogoUrl}
        />

        <ShopImageUploadGrid
          label="រូបភាពគម្រប (Cover)"
          imageUrl={coverImageUrl}
          onChange={setCoverImageUrl}
        />
      </div>

      {/* Location */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ទីតាំង</h2>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            អាសយដ្ឋាន <span className="text-red-500">*</span>
          </label>
          <textarea
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ឃុំ/សង្កាត់</label>
            <input
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              ស្រុក/ខណ្ឌ <span className="text-red-500">*</span>
            </label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              ខេត្ត/ក្រុង <span className="text-red-500">*</span>
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              ខេត្ត (province) <span className="text-red-500">*</span>
            </label>
            <input
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Country</label>
            <input
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Postal</label>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Lat</label>
            <input
              type="number"
              step="any"
              value={latitude ?? ""}
              onChange={(e) =>
                setLatitude(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Lng</label>
            <input
              type="number"
              step="any"
              value={longitude ?? ""}
              onChange={(e) =>
                setLongitude(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Timezone</label>
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Business details */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ព័ត៌មានអាជីវកម្ម</h2>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">តម្លៃ</label>
          <select
            value={priceLevel ?? ""}
            onChange={(e) =>
              setPriceLevel((e.target.value || null) as PriceLevel)
            }
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">មិនកំណត់</option>
            <option value="LOW">$</option>
            <option value="MEDIUM">$$</option>
            <option value="HIGH">$$$</option>
          </select>
        </div>
      </div>

      {/* Opening hours */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-800">ម៉ោងបើក/បិទ</h2>
        {openingHours.map((h) => (
          <div
            key={h.dayOfWeek}
            className="flex flex-wrap items-center gap-3 border-b border-gray-50 pb-3 last:border-0"
          >
            <span className="w-24 text-sm text-gray-600 shrink-0">
              {h.dayOfWeek}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
              <input
                type="checkbox"
                checked={!h.isClosed}
                onChange={(e) =>
                  updateHour(h.dayOfWeek, { isClosed: !e.target.checked })
                }
                className="accent-emerald-600"
              />
              បើក
            </label>
            <input
              type="time"
              value={h.openTime}
              disabled={h.isClosed}
              onChange={(e) => updateHour(h.dayOfWeek, { openTime: e.target.value })}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 disabled:opacity-40"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="time"
              value={h.closeTime}
              disabled={h.isClosed}
              onChange={(e) => updateHour(h.dayOfWeek, { closeTime: e.target.value })}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      {/* Social links */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">តំណភ្ជាប់សង្គម</h2>
          <button
            onClick={addSocialLink}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Plus size={16} />
            បន្ថែម
          </button>
        </div>
        {socialLinks.map((link, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2">
            <input
              value={link.platform}
              onChange={(e) => updateSocialLink(i, { platform: e.target.value })}
              placeholder="facebook"
              className="sm:w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              value={link.url}
              onChange={(e) => updateSocialLink(i, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => removeSocialLink(i)}
              className="text-red-400 hover:text-red-600 shrink-0 self-center"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => router.push("/shops")}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          បោះបង់
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
        >
          <Save size={16} />
          បន្ថែមហាង
        </button>
      </div>
    </div>
  );
}