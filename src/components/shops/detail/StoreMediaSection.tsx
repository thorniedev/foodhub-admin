import { ImageIcon } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { imageUrlOrNull } from "@/src/lib/shopFormat";
import { Section } from "./StoreOverviewSection";
export default function StoreMediaSection({store}:{store:Store}) {
  return <Section title="Store media" icon={<ImageIcon size={18}/>}>
    <div className="grid gap-4 sm:grid-cols-2"><Media title="Logo" url={imageUrlOrNull(store.logoUrl)} uuid={store.logoMediaUuid}/><Media title="Cover" url={imageUrlOrNull(store.coverImageUrl)} uuid={store.coverMediaUuid}/></div>
  </Section>;
}
function Media({title,url,uuid}:{title:string;url:string|null;uuid:string|null}){return <div className="overflow-hidden rounded-2xl border bg-gray-50"><div className="h-40 bg-gray-100">{url?
  // eslint-disable-next-line @next/next/no-img-element
  <img src={url} alt={title} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center text-gray-300"><ImageIcon size={34}/></div>}</div>
  <div className="p-3"><p className="font-black">{title}</p><p className="mt-1 break-all font-mono text-[11px] text-gray-400">{uuid??"No media UUID"}</p></div></div>}
