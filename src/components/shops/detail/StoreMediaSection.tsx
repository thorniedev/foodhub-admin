import { ImageIcon } from "lucide-react";

import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
import StoreMediaImage from "./StoreMediaImage";

export default function StoreMediaSection({ store }: { store: Store }) {
  return (
    <Section title="Store media" icon={<ImageIcon size={24} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <MediaCard
          title="Logo"
          mediaUuid={store.logoMediaUuid}
          alt={`${store.storeName} logo`}
          type="logo"
        />
        <MediaCard
          title="Cover"
          mediaUuid={store.coverMediaUuid}
          alt={`${store.storeName} cover`}
          type="cover"
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
}: {
  title: string;
  mediaUuid: string | null | undefined;
  alt: string;
  type: "logo" | "cover";
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200">
      <div className="h-48 bg-gray-50/70">
        <StoreMediaImage
          mediaUuid={mediaUuid}
          alt={alt}
          className={
            type === "logo"
              ? "h-full w-full object-contain p-5"
              : "h-full w-full object-cover"
          }
        />
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-gray-900">{title}</p>
          {mediaUuid && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-lg font-semibold text-emerald-700">
              Uploaded
            </span>
          )}
        </div>
        <p className="mt-2 text-lg text-gray-500">
          {mediaUuid ? "Media connected" : `No ${title.toLowerCase()} uploaded`}
        </p>
      </div>
    </div>
  );
}
