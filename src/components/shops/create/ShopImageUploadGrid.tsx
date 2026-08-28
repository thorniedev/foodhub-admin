"use client";

import { ImageIcon, Link2, Upload } from "lucide-react";

import StoreMediaUploader from "../StoreMediaUploader";

export default function ShopImageUploadGrid({
  logoMediaUuid,
  coverMediaUuid,
  onChange,
}: {
  logoMediaUuid: string;
  coverMediaUuid: string;
  onChange: (key: "logoMediaUuid" | "coverMediaUuid", value: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
      {/* =================================================
          SECTION HEADER
      ================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary-50
              text-primary-800
            "
          >
            <ImageIcon size={24} />
          </div>

          <div className="min-w-0">
            <p className="text-2xl font-medium text-[#0F5A2C]">
              រូបភាពហាង
            </p>

            <p className="mt-2 max-w-2xl text-lg font-normal leading-8 text-gray-500">
              បន្ថែមរូបសញ្ញា (Logo) និងរូបគម្រប (Cover) របស់ហាង ដោយផ្ទុកឡើងរូបភាពពីឧបករណ៍ ឬប្រើប្រាស់ Image URL។
            </p>
          </div>
        </div>

        {/* =================================================
            AVAILABLE METHODS
        ================================================== */}

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div
            className="
              inline-flex
              min-h-11
              items-center
              gap-2
              rounded-full
              bg-primary-50
              px-5
              text-lg
              font-normal
              text-primary-800
            "
          >
            <Upload size={18} />
            ផ្ទុកឡើងឯកសារ
          </div>

          <div
            className="
              inline-flex
              min-h-11
              items-center
              gap-2
              rounded-full
              border
              border-gray-200
              bg-white
              px-5
              text-lg
              font-normal
              text-gray-600
            "
          >
            <Link2 size={18} />
            តំណភ្ជាប់រូបភាព (URL)
          </div>
        </div>
      </div>

      {/* =================================================
          DIVIDER
      ================================================== */}

      <div className="my-6 border-t border-gray-100" />

      {/* =================================================
          MEDIA UPLOADERS
      ================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* STORE LOGO */}

        <div className="min-w-0">
          <StoreMediaUploader
            label="រូបសញ្ញាហាង (Logo)"
            purpose="STORE_LOGO"
            mediaUuid={logoMediaUuid}
            onMediaUuidChange={(uuid) => onChange("logoMediaUuid", uuid)}
            variant="logo"
          />
        </div>

        {/* STORE COVER */}

        <div className="min-w-0">
          <StoreMediaUploader
            label="រូបគម្របហាង (Cover)"
            purpose="STORE_COVER"
            mediaUuid={coverMediaUuid}
            onMediaUuidChange={(uuid) => onChange("coverMediaUuid", uuid)}
            variant="cover"
          />
        </div>
      </div>
    </section>
  );
}
