"use client";

import { ImageIcon, Pencil } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
import StoreMediaImage from "./StoreMediaImage";

export default function StoreMediaSection({
  store,
  onEditMedia,
}: {
  store: Store;
  onEditMedia?: () => void;
}) {
  return (
    <Section title="រូបភាព & ឡូហ្គោ" icon={<ImageIcon size={22} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <MediaCard
          title="ឡូហ្គោ"
          mediaUuid={store.logoMediaUuid}
          alt={`${store.storeName} logo`}
          type="logo"
          onEdit={onEditMedia}
        />
        <MediaCard
          title="រូបភាពផ្ទៃខាងក្រោយ"
          mediaUuid={store.coverMediaUuid}
          alt={`${store.storeName} cover`}
          type="cover"
          onEdit={onEditMedia}
        />
      </div>
    </Section>
  );
}

function MediaCard({
  title,
  mediaUuid,
  alt,
  type,
  onEdit,
}: {
  title: string;
  mediaUuid: string | null | undefined;
  alt: string;
  type: "logo" | "cover";
  onEdit?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 transition hover:border-gray-200 hover:bg-gray-50">
      <div className="relative h-44 bg-white flex items-center justify-center border-b border-gray-100">
        {mediaUuid ? (
          <StoreMediaImage
            mediaUuid={mediaUuid}
            alt={alt}
            className={
              type === "logo"
                ? "h-full w-full object-contain p-4"
                : "h-full w-full object-cover"
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
            <ImageIcon size={40} className="text-gray-300" />
            <p className="mt-2 text-lg font-normal text-gray-500">
              មិនទាន់មាន {type === "logo" ? "ឡូហ្គោ" : "រូបភាពផ្ទៃខាងក្រោយ"} ឡើយ
            </p>
          </div>
        )}
      </div>

      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-gray-800">{title}</p>
          <p className="text-lg text-gray-500 font-mono mt-0.5 font-normal">
            {mediaUuid ? "បានភ្ជាប់រួចរាល់" : "មិនមានរូបភាព"}
          </p>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 shadow-2xs transition hover:bg-gray-100"
          >
            <Pencil size={18} />
            <span>កែប្រែ</span>
          </button>
        )}
      </div>
    </div>
  );
}
