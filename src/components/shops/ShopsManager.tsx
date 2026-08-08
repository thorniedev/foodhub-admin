"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Search, Store } from "lucide-react";
import { useGetShopsQuery, useUpdateShopMutation } from "@/src/app/store/shopApi";
import type { Store as StoreType, StoreReviewFilter, StoreStatusAction, UpdateStorePayload } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import ShopEditModal from "./ShopEditModal";
import ShopsHeader from "./ShopsHeader";
import ShopsPagination from "./ShopsPagination";
import ShopStatusModal from "./ShopStatusModal";
import ShopsTable from "./ShopsTable";
import ShopsTabs from "./ShopsTabs";

export default function ShopsManager() {
  const [page,setPage]=useState(0),[size,setSize]=useState(20);
  const [searchInput,setSearchInput]=useState(""),[serverQuery,setServerQuery]=useState("");
  const [filter,setFilter]=useState<StoreReviewFilter>("ALL");
  const [editing,setEditing]=useState<StoreType|null>(null);
  const [statusStore,setStatusStore]=useState<StoreType|null>(null);
  const [statusAction,setStatusAction]=useState<StoreStatusAction>("REVIEW");
  const [notice,setNotice]=useState<{type:"success"|"error";text:string}|null>(null);
  const {data,error,isLoading,isFetching,refetch}=useGetShopsQuery({query:serverQuery||undefined,page,size});
  const [updateShop,{isLoading:updating}]=useUpdateShopMutation();
  const stores=data?.contents??[];
  const counts=useMemo(()=>({
    all:stores.length,
    pending:stores.filter(s=>s.reviewStatus==="PENDING").length,
    approved:stores.filter(s=>s.reviewStatus==="APPROVED").length,
    rejected:stores.filter(s=>s.reviewStatus==="REJECTED").length,
  }),[stores]);
  const filtered=filter==="ALL"?stores:stores.filter(s=>s.reviewStatus===filter);

  const edit=async(values:UpdateStorePayload)=>{
    if(!editing)return;
    try{
      await updateShop({storeUuid:editing.uuid,body:values}).unwrap();
      setEditing(null);setNotice({type:"success",text:"បានកែប្រែ Store ដោយជោគជ័យ។"});await refetch();
    }catch(e){setNotice({type:"error",text:getShopApiErrorMessage(e)});}
  };

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <ShopsHeader total={data?.totalElements??0} approved={counts.approved} pending={counts.pending}/>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <ShopsTabs value={filter} counts={counts} onChange={setFilter}/>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex sm:w-[360px]">
          <label className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setPage(0);setServerQuery(searchInput.trim());}}}
              placeholder="ស្វែងរក Store..." className="h-11 w-full rounded-l-2xl border border-r-0 pl-11 pr-3 text-sm"/>
          </label>
          <button onClick={()=>{setPage(0);setServerQuery(searchInput.trim());}} className="rounded-r-2xl bg-[#137A3D] px-4 text-sm font-black text-white">Search</button>
        </div>
        <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(0);}} className="h-11 rounded-2xl border bg-white px-4 text-sm font-black">
          {[10,20,50].map(x=><option key={x} value={x}>{x} / ទំព័រ</option>)}
        </select>
        <button disabled={isFetching} onClick={()=>void refetch()} className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white">
          <RefreshCw size={18} className={isFetching?"animate-spin":""}/>
        </button>
      </div>
    </div>

    {serverQuery&&<div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      Server search: <b>“{serverQuery}”</b>
      <button onClick={()=>{setSearchInput("");setServerQuery("");setPage(0);}} className="ml-3 font-black underline">Clear</button>
    </div>}
    {notice&&<div className={`rounded-2xl px-4 py-3 text-sm ${notice.type==="success"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-600"}`}>{notice.text}</div>}

    <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
      {isLoading?<div className="flex min-h-[360px] items-center justify-center"><Loader2 size={30} className="animate-spin text-[#137A3D]"/></div>:
      error?<div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center"><AlertTriangle size={38} className="text-red-400"/>
        <h3 className="mt-4 text-xl font-black">មិនអាចទាញយក Store បានទេ</h3><p className="mt-2 text-sm text-gray-500">{getShopApiErrorMessage(error)}</p>
        <button onClick={()=>void refetch()} className="mt-5 rounded-xl bg-[#137A3D] px-4 py-2.5 font-black text-white">សាកល្បងម្តងទៀត</button></div>:
      filtered.length===0?<div className="flex min-h-[340px] flex-col items-center justify-center"><Store size={42} className="text-gray-300"/><p className="mt-3 font-black text-gray-600">មិនមាន Store</p></div>:
      <ShopsTable stores={filtered} disabled={updating||isFetching} onEdit={setEditing}
        onStatus={(s,a)=>{setStatusStore(s);setStatusAction(a);}}/>}
      {!isLoading&&!error&&<ShopsPagination page={data?.pageNumber??page} totalPages={data?.totalPages??0} totalElements={data?.totalElements??0} disabled={isFetching} onPageChange={setPage}/>}
    </section>
    <p className="text-xs text-gray-400">`query`, `page`, `size` គឺ server-side។ Review tabs filter page បច្ចុប្បន្ន ព្រោះ collection មិនមាន reviewStatus query parameter។</p>
    <ShopEditModal store={editing} saving={updating} onClose={()=>!updating&&setEditing(null)} onSubmit={edit}/>
    <ShopStatusModal store={statusStore} initialAction={statusAction} onClose={()=>setStatusStore(null)} onChanged={async()=>{await refetch();}}/>
  </div>;
}
