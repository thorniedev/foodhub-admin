import { Plus, Trash2 } from "lucide-react";
import type { StoreSocialLink } from "@/src/types/shop";
export default function ShopSocialSection({links,onChange}:{links:StoreSocialLink[];onChange:(v:StoreSocialLink[])=>void}) {
  const update=(i:number,key:keyof StoreSocialLink,value:string)=>{
    const next=[...links];next[i]={...next[i],[key]:key==="displayOrder"?Number(value):value};onChange(next);
  };
  return <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Social links</h2><p className="text-sm text-gray-500">platform, profileUrl, displayOrder</p></div>
      <button type="button" onClick={()=>onChange([...links,{platform:"FACEBOOK",profileUrl:"",displayOrder:links.length+1}])} className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-[#137A3D]"><Plus size={16}/>Add</button>
    </div>
    <div className="mt-5 space-y-3">
      {links.length===0?<div className="rounded-2xl border border-dashed p-7 text-center text-sm text-gray-400">No social links</div>:
      links.map((l,i)=><div key={i} className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-[160px_1fr_110px_44px]">
        <input value={l.platform} onChange={e=>update(i,"platform",e.target.value)} className="h-11 rounded-xl border bg-white px-3"/>
        <input value={l.profileUrl} onChange={e=>update(i,"profileUrl",e.target.value)} placeholder="https://..." className="h-11 rounded-xl border bg-white px-3"/>
        <input type="number" min="1" value={l.displayOrder} onChange={e=>update(i,"displayOrder",e.target.value)} className="h-11 rounded-xl border bg-white px-3"/>
        <button type="button" onClick={()=>onChange(links.filter((_,x)=>x!==i))} className="flex h-11 w-11 items-center justify-center text-red-500"><Trash2 size={17}/></button>
      </div>)}
    </div>
  </section>;
}
