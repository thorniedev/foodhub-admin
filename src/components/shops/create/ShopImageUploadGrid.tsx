"use client";

import { ImageIcon } from "lucide-react";

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
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-5
        sm:p-6
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-start
          gap-4
        "
      >
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
          <p
            className="
              text-3xl
              font-semibold
              text-primary-800
            "
          >
            Store media
          </p>

          <p
            className="
              mt-2
              max-w-3xl
              text-lg
              leading-8
              text-gray-500
            "
          >
            Upload the store logo and cover image from your computer, or import
            them using a public image URL.
          </p>

          <div
            className="
              mt-3
              inline-flex
              items-center
              rounded-full
              bg-secondary-50
              px-3
              py-1.5
              text-base
              font-medium
              text-secondary-600
            "
          >
            Media UUID is generated automatically
          </div>
        </div>
      </div>

      {/* Upload grid */}
      <div
        className="
          mt-6
          grid
          gap-5
          lg:grid-cols-2
        "
      >
        <StoreMediaUploader
          label="Store logo"
          purpose="STORE_LOGO"
          mediaUuid={logoMediaUuid}
          onMediaUuidChange={(uuid) => onChange("logoMediaUuid", uuid)}
          variant="logo"
        />

        <StoreMediaUploader
          label="Store cover"
          purpose="STORE_COVER"
          mediaUuid={coverMediaUuid}
          onMediaUuidChange={(uuid) => onChange("coverMediaUuid", uuid)}
          variant="cover"
        />
      </div>
    </section>
  );
}
