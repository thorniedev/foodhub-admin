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
  onChange: (
    key:
      | "logoMediaUuid"
      | "coverMediaUuid",
    value: string,
  ) => void;
}) {
  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D]">
          <ImageIcon size={20} />
        </div>

        <div>
          <h2 className="text-4xl font-bold text-gray-900">
            Store media
          </h2>

          <p className="mt-2 text-base leading-7 text-gray-500">
            Upload the logo and cover from your computer or import a public image URL.
            The backend Media API creates the media UUID automatically.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <StoreMediaUploader
          label="Store logo"
          purpose="STORE_LOGO"
          mediaUuid={logoMediaUuid}
          onMediaUuidChange={(uuid) =>
            onChange(
              "logoMediaUuid",
              uuid,
            )
          }
          variant="logo"
        />

        <StoreMediaUploader
          label="Store cover"
          purpose="STORE_COVER"
          mediaUuid={coverMediaUuid}
          onMediaUuidChange={(uuid) =>
            onChange(
              "coverMediaUuid",
              uuid,
            )
          }
          variant="cover"
        />
      </div>
    </section>
  );
}
