"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Save, Send } from "lucide-react";
import { useCreateShopMutation } from "@/src/app/store/shopApi";
import { CreateShopPayload, DayOfWeek, OpeningHourEntry } from "@/src/types/shop";
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

export default function CreateShopForm() {
  const router = useRouter();
  const [createShop, { isLoading }] = useCreateShopMutation();

  const [images, setImages] = useState<string[]>([]);
  const [storeName, setStoreName] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [openTime, setOpenTime] = useState("7:30ព្រឹក");
  const [closeTime, setCloseTime] = useState("10:00យប់");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [facebook, setFacebook] = useState("");
  const [telegram, setTelegram] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCancel = () => router.push("/shops");

  const handleSubmit = async () => {
    if (!storeName.trim() || !addressLine.trim() || !googleMapUrl.trim()) return;

    const openingHours: OpeningHourEntry[] = DAYS.map((day) => ({
      dayOfWeek: day,
      openTime,
      closeTime,
      isClosed: false,
    }));

    const socialLinks = [
      ...(facebook.trim() ? [{ platform: "facebook", url: facebook.trim() }] : []),
      ...(telegram.trim() ? [{ platform: "telegram", url: telegram.trim() }] : []),
    ];

    const payload: CreateShopPayload = {
      storeName,
      description,
      addressLine,
      commune: null,
      district: "",
      city: "",
      province: "",
      countryCode: "KH",
      postalCode: null,
      timezone: "Asia/Phnom_Penh",
      latitude: null,
      longitude: null,
      phoneNumber,
      email,
      logoUrl: images[0] || null,
      coverImageUrl: images[1] || null,
      galleryImages: images,
      googleMapUrl,
      priceLevel: null,
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
    <div className="max-w-3xl mx-auto p-3 sm:p-6">
      {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        បន្ថែមភោជនីយដ្ឋានថ្មី
      </h1> */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/shops")}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0"
          title="ត្រឡប់ទៅហាង"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          បន្ថែមភោជនីយដ្ឋានថ្មី
        </h1>
      </div>

      <div className="space-y-6">
        {/* Image upload */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <ShopImageUploadGrid images={images} onChange={setImages} />
        </div>

        {/* Basic info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-base text-gray-800 mb-2 block">
              ឈ្មោះភោជនីយដ្ឋាន <span className="text-red-500">*</span>
            </label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="ឧទាហរណ៍: ឡាក់គី អិចស្ព្រេស (Lucky Express - BKK3 Branch)"
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-base text-gray-800 mb-2 block">
              អាសយដ្ឋាន GOOGLE MAP <span className="text-red-500">*</span>
            </label>
            <textarea
              value={googleMapUrl}
              onChange={(e) => setGoogleMapUrl(e.target.value)}
              rows={4}
              placeholder="ឧទាហរណ៍: https://www.google.com/maps/place/Lucky+Express+BKK3/..."
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="text-base text-gray-800 mb-2 block">
              អាសយដ្ឋានភោជនីយដ្ឋាន <span className="text-red-500">*</span>
            </label>
            <textarea
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              rows={3}
              placeholder="ឧទាហរណ៍: #155 E0, Street 143 corner 368, Sangkat Beong Keng Kong 3, Khan Beong Keng Kong Phnom Penh, 12304,..."
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Hours + description */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-lg font-semibold text-gray-800 mb-3 block">
              ពេលវេលា <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ម៉ោងបើកនៅ</p>
                <input
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  placeholder="7:30ព្រឹក"
                  className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ម៉ោងបិទនៅ</p>
                <input
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  placeholder="10:00យប់"
                  className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-base text-gray-800 mb-2 block">ការពិពណ៌នាហាង</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="ឡាក់គី អិចស្ព្រេស គឺជាទំនាក់ទំនងផ្គត់ផ្គង់អាហារ គេសដ្ឋ: គ្រឿងទេស និងផលិតផលប្រើប្រាស់ថ្ងៃជាច្រើនប្រភេទៗ..."
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">
            ព័ត៌មានទំនាក់ទំនងរបស់ភោជនីយដ្ឋាន
          </h2>

          <div>
            <label className="flex items-center gap-2 text-base text-gray-800 mb-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="LuckySupermarketKH@gmail.com"
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-base text-gray-800 mb-2">
              <Send size={16} />
              Facebook
            </label>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://web.facebook.com/LuckySupermarketKH/"
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-base text-gray-800 mb-2 block pl-6">Telegram</label>
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="https://t.me/LuckySupermarketKH"
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-base text-gray-800 mb-2">
              <Phone size={16} />
              Phone
            </label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+85515814888"
              className="w-full px-4 py-3 text-sm text-gray-700 border-0 rounded-xl bg-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50"
          >
            កំណត់ឡើងវិញ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-full disabled:opacity-60"
          >
            <Save size={16} />
            បន្ថែមភោជនីយដ្ឋាន
          </button>
        </div>
      </div>
    </div>
  );
}