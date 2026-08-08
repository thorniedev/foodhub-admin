"use client";
import { useEffect, useState } from "react";
import { Clock3, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useGetStoreHoursQuery, useReplaceStoreHoursMutation } from "@/src/app/store/shopApi";
import type { StoreHour } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

const weekly=():StoreHour=>({scheduleType:"WEEKLY",dayOfWeek:1,businessDate:null,openingTime:"08:00:00",closingTime:"17:00:00",intervalOrder:1,isClosed:false,reason:null});
const special=():StoreHour=>({scheduleType:"SPECIAL_DATE",dayOfWeek:null,businessDate:"",openingTime:"10:00:00",closingTime:"15:00:00",intervalOrder:1,isClosed:false,reason:""});

export default function StoreHoursModal({storeUuid,open,onClose,onChanged}:{storeUuid:string;open:boolean;onClose:()=>void;onChanged?:()=>void|Promise<void>}) {
  const {data,error:loadError,isLoading,refetch}=useGetStoreHoursQuery(storeUuid,{skip:!open});
  const [replace,{isLoading:saving}]=useReplaceStoreHoursMutation();
  const [hours,setHours]=useState<StoreHour[]>([]),[error,setError]=useState<string|null>(null);
  useEffect(()=>{if(open&&data){setHours(data.map(x=>({...x})));setError(null)}},[open,data]);
  if(!open)return null;
  const patch=(i:number,p:Partial<StoreHour>)=>setHours(c=>c.map((x,n)=>n===i?{...x,...p}:x));
  const save=async()=>{
    for(const [i,h] of hours.entries()){
      if(h.scheduleType==="WEEKLY"&&(!h.dayOfWeek||h.dayOfWeek<1||h.dayOfWeek>7))return setError(`Row ${i+1}: dayOfWeek 1..7`);
      if(h.scheduleType==="SPECIAL_DATE"&&!h.businessDate)return setError(`Row ${i+1}: businessDate required`);
      if(!h.isClosed&&(!h.openingTime||!h.closingTime))return setError(`Row ${i+1}: opening/closing required`);
    }
    try{
      await replace({storeUuid,body:{hours:hours.map(h=>({...h,
        openingTime:h.isClosed?null:h.openingTime,closingTime:h.isClosed?null:h.closingTime,
        dayOfWeek:h.scheduleType==="WEEKLY"?h.dayOfWeek:null,businessDate:h.scheduleType==="SPECIAL_DATE"?h.businessDate:null,
      }))}}).unwrap();
      await refetch();await onChanged?.();onClose();
    }catch(e){setError(getShopApiErrorMessage(e));}
  };
  return <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
    <div className="sticky top-0 z-10 flex justify-between border-b bg-white px-6 py-5"><div><h2 className="flex items-center gap-2 text-xl font-black"><Clock3 className="text-[#137A3D]"/>Store opening hours</h2><p className="text-sm text-gray-500">GET + PUT /admin/stores/{storeUuid}/hours</p></div>
      <button disabled={saving} onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"><X size={18}/></button></div>
    <div className="p-6"><div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"><b>Replace operation:</b> load full list, edit it, then PUT full `hours`. Overnight (18:00 → 02:00) is allowed.</div>
      {isLoading?<div className="p-16 text-center"><Loader2 className="mx-auto animate-spin text-[#137A3D]"/></div>:loadError?<div className="mt-5 bg-red-50 p-4 text-red-600">{getShopApiErrorMessage(loadError)}</div>:<>
        <div className="mt-5 flex gap-2"><button onClick={()=>setHours(c=>[...c,weekly()])} className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-[#137A3D]"><Plus size={16}/>Weekly</button>
          <button onClick={()=>setHours(c=>[...c,special()])} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700"><Plus size={16}/>Special date</button></div>
        <div className="mt-5 space-y-3">{hours.length===0?<div className="rounded-2xl border border-dashed p-10 text-center text-gray-400">No hours</div>:hours.map((h,i)=>
          <div key={i} className="grid gap-3 rounded-2xl bg-gray-50 p-4 xl:grid-cols-[150px_130px_150px_150px_100px_110px_1fr_44px]">
            <select value={h.scheduleType} onChange={e=>patch(i,e.target.value==="WEEKLY"?{scheduleType:"WEEKLY",dayOfWeek:1,businessDate:null}:{scheduleType:"SPECIAL_DATE",dayOfWeek:null,businessDate:""})} className="h-11 rounded-xl border bg-white px-3"><option>WEEKLY</option><option>SPECIAL_DATE</option></select>
            {h.scheduleType==="WEEKLY"?<select value={h.dayOfWeek??1} onChange={e=>patch(i,{dayOfWeek:Number(e.target.value)})} className="h-11 rounded-xl border bg-white px-3">{[1,2,3,4,5,6,7].map(d=><option key={d} value={d}>Day {d}</option>)}</select>:
            <input type="date" value={h.businessDate??""} onChange={e=>patch(i,{businessDate:e.target.value})} className="h-11 rounded-xl border bg-white px-3"/>}
            <input type="time" step="1" disabled={h.isClosed} value={h.openingTime?.slice(0,8)??""} onChange={e=>patch(i,{openingTime:e.target.value.length===5?e.target.value+":00":e.target.value})} className="h-11 rounded-xl border bg-white px-3 disabled:opacity-40"/>
            <input type="time" step="1" disabled={h.isClosed} value={h.closingTime?.slice(0,8)??""} onChange={e=>patch(i,{closingTime:e.target.value.length===5?e.target.value+":00":e.target.value})} className="h-11 rounded-xl border bg-white px-3 disabled:opacity-40"/>
            <input type="number" min="1" value={h.intervalOrder} onChange={e=>patch(i,{intervalOrder:Number(e.target.value)||1})} className="h-11 rounded-xl border bg-white px-3"/>
            <label className="flex h-11 items-center gap-2 rounded-xl border bg-white px-3 text-xs"><input type="checkbox" checked={h.isClosed} onChange={e=>patch(i,{isClosed:e.target.checked})}/>Closed</label>
            <input value={h.reason??""} onChange={e=>patch(i,{reason:e.target.value||null})} placeholder="Reason" className="h-11 rounded-xl border bg-white px-3"/>
            <button onClick={()=>setHours(c=>c.filter((_,n)=>n!==i))} className="flex h-11 w-11 items-center justify-center text-red-500"><Trash2 size={17}/></button>
          </div>)}</div></>}
      {error&&<div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="mt-6 flex justify-end gap-3 border-t pt-5"><button disabled={saving} onClick={onClose} className="rounded-xl border px-4 py-2.5 font-black">Cancel</button>
        <button disabled={saving||isLoading||!!loadError} onClick={()=>void save()} className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-4 py-2.5 font-black text-white disabled:opacity-50">{saving?<Loader2 size={17} className="animate-spin"/>:<Save size={17}/>}Replace hours</button></div>
    </div>
  </div></div>;
}
