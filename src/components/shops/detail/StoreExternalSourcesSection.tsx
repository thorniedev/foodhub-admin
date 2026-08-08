import { Database } from "lucide-react";
import type { StoreExternalSourceMetadata } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
export default function StoreExternalSourcesSection({items,loading=false}:{items:StoreExternalSourceMetadata[];loading?:boolean}) {
  return <Section title={`External sources (${items.length})`} icon={<Database size={18}/>}>
    {loading?<p className="text-sm text-gray-400">Loading...</p>:items.length===0?<div className="rounded-2xl bg-gray-50 p-7 text-center text-sm text-gray-400">No external-source metadata</div>:
    <div className="space-y-3">{items.map((x,i)=><pre key={i} className="max-h-[280px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-white">{JSON.stringify(x,null,2)}</pre>)}</div>}
    <p className="mt-4 text-xs text-gray-400">Collection មិនមាន external-source response DTO ដូច្នេះ render real JSON ដោយមិន invent fields។</p>
  </Section>;
}
