// import { ImageIcon } from "lucide-react";
// import type { Store } from "@/src/types/shop";
// import { imageUrlOrNull } from "@/src/lib/shopFormat";
// import { Section } from "./StoreOverviewSection";
// export default function StoreMediaSection({store}:{store:Store}) {
//   return <Section title="Store media" icon={<ImageIcon size={18}/>}>
//     <div className="grid gap-4 sm:grid-cols-2"><Media title="Logo" url={imageUrlOrNull(store.logoUrl)} uuid={store.logoMediaUuid}/><Media title="Cover" url={imageUrlOrNull(store.coverImageUrl)} uuid={store.coverMediaUuid}/></div>
//   </Section>;
// }
// function Media({title,url,uuid}:{title:string;url:string|null;uuid:string|null}){return <div className="overflow-hidden rounded-2xl border bg-gray-50"><div className="h-40 bg-gray-100">{url?
//   // eslint-disable-next-line @next/next/no-img-element
//   <img src={url} alt={title} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center text-gray-300"><ImageIcon size={34}/></div>}</div>
//   <div className="p-3"><p className="font-black">{title}</p><p className="mt-1 break-all font-mono text-[11px] text-gray-400">{uuid??"No media UUID"}</p></div></div>}



import {
  ImageIcon,
} from "lucide-react";

import type {
  Store,
} from "@/src/types/shop";

import {
  Section,
} from "./StoreOverviewSection";

import StoreMediaImage from "./StoreMediaImage";

export default function StoreMediaSection({
  store,
}: {
  store: Store;
}) {
  return (
    <Section
      title="Store media"
      icon={
        <ImageIcon size={18} />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* LOGO */}
        <MediaCard
          title="Logo"
          mediaUuid={
            store.logoMediaUuid
          }
          alt={`${store.storeName} logo`}
          type="logo"
        />

        {/* COVER */}
        <MediaCard
          title="Cover"
          mediaUuid={
            store.coverMediaUuid
          }
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

  mediaUuid:
    | string
    | null
    | undefined;

  alt: string;

  type: "logo" | "cover";
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white">
      {/* IMAGE */}
      <div className="h-44 overflow-hidden bg-gray-50">
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

      {/* INFORMATION */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black text-gray-900">
            {title}
          </h3>

          {mediaUuid && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">
              Uploaded
            </span>
          )}
        </div>

        {mediaUuid ? (
          <p className="mt-2 break-all font-mono text-[10px] leading-4 text-gray-400">
       
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-400">
            No {title.toLowerCase()} uploaded
          </p>
        )}
      </div>
    </div>
  );
}