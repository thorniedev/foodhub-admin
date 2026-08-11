import { ImageIcon } from "lucide-react";

import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
import StoreMediaImage from "./StoreMediaImage";

export default function StoreMediaSection({ store }: { store: Store }) {
  return (
    <Section title="Store media" icon={<ImageIcon size={20} />}>
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="h-48 bg-gray-50">
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
          <p className="text-lg text-gray-900">{title}</p>
          {mediaUuid && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm text-emerald-700">
              Uploaded
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-400">
          {mediaUuid ? "Media connected" : `No ${title.toLowerCase()} uploaded`}
        </p>
      </div>
    </div>
  );
}
