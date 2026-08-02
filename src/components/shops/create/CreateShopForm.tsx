"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useCreateShopMutation } from "@/src/app/store/shopApi";
import ShopImageUploadGrid from "./ShopImageUploadGrid";
import ShopBasicInfoSection from "./ShopBasicInfoSection";
import ShopHoursSection from "./ShopHoursSection";
import ShopSocialSection from "./ShopSocialSection";
import ShopLocationSection from "./ShopLocationSection";

export default function CreateShopForm() {
  const router = useRouter();
  const [createShop, { isLoading }] = useCreateShopMutation();

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [description, setDescription] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const handleAddImages = (files: FileList) => {
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = (status: "draft" | "published") => ({
    images,
    name,
    address,
    openTime,
    closeTime,
    description,
    socialLink,
    latitude,
    longitude,
    status,
  });

  const handleCancel = () => {
    router.push("/dashboard/shops");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !openTime.trim() || !closeTime.trim()) {
      return;
    }
    // await createShop(buildPayload("published"));
    router.push("/dashboard/shops");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <p className="text-4xl font-bold text-gray-800 mb-6">
        បន្ថែមភោជនីយដ្ឋានថ្មី
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-8">
        <ShopImageUploadGrid
          images={images}
          onAdd={handleAddImages}
          onRemove={handleRemoveImage}
        />

        <ShopBasicInfoSection
          name={name}
          onNameChange={setName}
          address={address}
          onAddressChange={setAddress}
        />

        <ShopHoursSection
          openTime={openTime}
          onOpenTimeChange={setOpenTime}
          closeTime={closeTime}
          onCloseTimeChange={setCloseTime}
          description={description}
          onDescriptionChange={setDescription}
        />

        <ShopSocialSection
          socialLink={socialLink}
          onSocialLinkChange={setSocialLink}
        />

        <ShopLocationSection
          address={address}
          latitude={latitude}
          longitude={longitude}
          onLatLngChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
      </div>

      <div className="flex items-center justify-start gap-3 mt-6">
        <button
          onClick={handleCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          កំណត់ឡើងវិញ
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg disabled:opacity-60"
        >
          <Save size={16} />
          បន្ថែមភោជនីយដ្ឋាន
        </button>
      </div>
    </div>
  );
}