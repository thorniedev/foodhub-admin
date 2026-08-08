import { ExternalLink, Share2 } from "lucide-react";
import type { StoreSocialLink } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
export default function StoreSocialLinksSection({links}:{links:StoreSocialLink[]}) {
  return <Section title={`Social links (${links.length})`} icon={<Share2 size={18}/>}>
    {links.length===0?<div className="rounded-2xl bg-gray-50 p-7 text-center text-sm text-gray-400">No social links</div>:
    <div className="space-y-3">{[...links].sort((a,b)=>(a.displayOrder??0)-(b.displayOrder??0)).map((l,i)=><a key={`${l.profileUrl}-${i}`} href={l.profileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 hover:bg-emerald-50">
      <div className="min-w-0"><p className="font-black">{l.platform}</p><p className="truncate text-xs text-gray-400">{l.profileUrl}</p></div><ExternalLink size={17} className="text-[#137A3D]"/></a>)}</div>}
  </Section>;
}
