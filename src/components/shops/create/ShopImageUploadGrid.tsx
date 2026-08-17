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
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      {/* =================================================
          SECTION HEADER
      ================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary-50
              text-primary-800
            "
          >
            <ImageIcon size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-3xl font-semibold text-primary-800">
              Store media
            </p>

            <p className="mt-2 max-w-2xl text-lg leading-8 text-gray-500">
              បន្ថែម Logo និង Cover របស់ហាង ដោយ Upload រូបភាពពីឧបករណ៍ ឬប្រើ
              Image URL។
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
              min-h-10
              items-center
              gap-2
              rounded-full
              bg-primary-50
              px-4
              text-lg
              font-medium
              text-primary-800
            "
          >
            <Upload size={18} />
            Upload file
          </div>

          <div
            className="
              inline-flex
              min-h-10
              items-center
              gap-2
              rounded-full
              border
              border-gray-200
              bg-white
              px-4
              text-lg
              font-medium
              text-gray-600
            "
          >
            <Link2 size={18} />
            Image URL
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
          {/* <div className="mb-3">
            <p className="text-xl font-semibold text-primary-800">Store logo</p>

            <p className="mt-1 text-lg leading-7 text-gray-500">
              រូបភាពសម្គាល់ហាង។
            </p>
          </div> */}

          <StoreMediaUploader
            label="Store logo"
            purpose="STORE_LOGO"
            mediaUuid={logoMediaUuid}
            onMediaUuidChange={(uuid) => onChange("logoMediaUuid", uuid)}
            variant="logo"
          />
        </div>

        {/* STORE COVER */}

        <div className="min-w-0">
          {/* <div className="mb-3">
            <p className="text-xl font-semibold text-primary-800">
              Store cover
            </p>

            <p className="mt-1 text-lg leading-7 text-gray-500">
              រូបភាព Cover សម្រាប់បង្ហាញព័ត៌មានហាង។
            </p>
          </div> */}

          <StoreMediaUploader
            label="Store cover"
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
