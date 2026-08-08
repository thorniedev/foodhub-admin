"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings2, X } from "lucide-react";
import {
  useUpdateStoreAccountStatusMutation,
  useUpdateStoreOperatingStatusMutation,
  useUpdateStoreReviewStatusMutation,
} from "@/src/app/store/shopApi";
import type { Store, StoreStatusAction } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

export default function ShopStatusModal({
  store, initialAction="REVIEW", onClose, onChanged,
}: {
  store: Store | null;
  initialAction?: StoreStatusAction;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [action,setAction]=useState<StoreStatusAction>(initialAction);
  const [reviewStatus,setReviewStatus]=useState<"APPROVED"|"REJECTED">("APPROVED");
  const [notes,setNotes]=useState("");
  const [account,setAccount]=useState("ACTIVE");
  const [operating,setOperating]=useState("OPEN");
  const [error,setError]=useState<string|null>(null);
  const [review,{isLoading:rLoading}]=useUpdateStoreReviewStatusMutation();
  const [accountUpdate,{isLoading:aLoading}]=useUpdateStoreAccountStatusMutation();
  const [operatingUpdate,{isLoading:oLoading}]=useUpdateStoreOperatingStatusMutation();
  const loading=rLoading||aLoading||oLoading;

  useEffect(()=>{
    if(!store)return;
    setAction(initialAction);
    setReviewStatus(store.reviewStatus==="REJECTED"?"REJECTED":"APPROVED");
    setAccount(store.accountStatus||"ACTIVE");
    setOperating(store.operatingStatus||"OPEN");
    setNotes("");setError(null);
  },[store,initialAction]);

  if(!store)return null;

  const save=async()=>{
    try{
      setError(null);
      if(action==="REVIEW") await review({storeUuid:store.uuid,body:{reviewStatus,notes:notes.trim()}}).unwrap();
      else if(action==="ACCOUNT") await accountUpdate({storeUuid:store.uuid,body:{accountStatus:account}}).unwrap();
      else await operatingUpdate({storeUuid:store.uuid,body:{operatingStatus:operating}}).unwrap();
      await onChanged();onClose();
    }catch(e){setError(getShopApiErrorMessage(e));}
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div><h2 className="flex items-center gap-2 text-xl font-black"><Settings2 size={20} className="text-[#137A3D]"/>Manage Store status</h2>
          <p className="mt-1 text-sm text-gray-500">{store.storeName}</p></div>
          <button disabled={loading} onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100"><X size={18}/></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-1.5">
            {(["REVIEW","ACCOUNT","OPERATING"] as StoreStatusAction[]).map(x=>
              <button key={x} onClick={()=>setAction(x)} className={`rounded-xl px-3 py-2.5 text-xs font-black ${action===x?"bg-white text-[#137A3D] shadow-sm":"text-gray-500"}`}>{x}</button>)}
          </div>
          <div className="mt-5">
            {action==="REVIEW" && <div className="space-y-4">
              <select value={reviewStatus} onChange={e=>setReviewStatus(e.target.value as "APPROVED"|"REJECTED")} className="h-12 w-full rounded-2xl border px-4">
                <option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option>
              </select>
              <textarea rows={4} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Review notes" className="w-full rounded-2xl border px-4 py-3"/>
              <p className="text-xs text-amber-700">Backend ជាអ្នក enforce valid review transition។</p>
            </div>}
            {action==="ACCOUNT" && <select value={account} onChange={e=>setAccount(e.target.value)} className="h-12 w-full rounded-2xl border px-4">
              {["ACTIVE","INACTIVE","SUSPENDED"].map(x=><option key={x}>{x}</option>)}
            </select>}
            {action==="OPERATING" && <select value={operating} onChange={e=>setOperating(e.target.value)} className="h-12 w-full rounded-2xl border px-4">
              {["OPEN","CLOSED","TEMPORARILY_CLOSED","UNKNOWN"].map(x=><option key={x}>{x}</option>)}
            </select>}
          </div>
          {error&&<div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="mt-6 flex justify-end gap-3 border-t pt-5">
            <button disabled={loading} onClick={onClose} className="rounded-xl border px-4 py-2.5 font-black">Cancel</button>
            <button disabled={loading} onClick={()=>void save()} className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-4 py-2.5 font-black text-white disabled:opacity-60">
              {loading&&<Loader2 size={17} className="animate-spin"/>}Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
