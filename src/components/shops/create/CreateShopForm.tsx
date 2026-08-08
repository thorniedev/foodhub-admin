"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPinned, Save, Store } from "lucide-react";
import { useCreateShopMutation } from "@/src/app/store/shopApi";
import type { CreateStorePayload, StoreOperatingStatus, StoreSocialLink } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import GooglePlacesImportModal from "../GooglePlacesImportModal";
import ShopBasicInfoSection from "./ShopBasicInfoSection";
import ShopHoursSection from "./ShopHoursSection";
import ShopImageUploadGrid from "./ShopImageUploadGrid";
import ShopLocationSection from "./ShopLocationSection";
import ShopSocialSection from "./ShopSocialSection";

type FormState={
  storeName:string;description:string;addressLine:string;commune:string;district:string;city:string;province:string;
  countryCode:string;postalCode:string;timezone:string;latitude:string;longitude:string;phoneNumber:string;email:string;
  logoMediaUuid:string;coverMediaUuid:string;priceLevel:string;hygieneRating:string;operatingStatus:StoreOperatingStatus;
};
const initial:FormState={
  storeName:"",description:"",addressLine:"",commune:"",district:"",city:"Phnom Penh",province:"Phnom Penh",
  countryCode:"KH",postalCode:"",timezone:"Asia/Phnom_Penh",latitude:"11.5484",longitude:"104.9307",
  phoneNumber:"",email:"",logoMediaUuid:"",coverMediaUuid:"",priceLevel:"2",hygieneRating:"",operatingStatus:"OPEN",
};

export default function CreateShopForm(){
  const router=useRouter();const [v,setV]=useState(initial);const [social,setSocial]=useState<StoreSocialLink[]>([]);
  const [googleOpen,setGoogleOpen]=useState(false),[error,setError]=useState<string|null>(null);
  const [create,{isLoading}]=useCreateShopMutation();
  const set=(key:keyof FormState,value:string)=>setV(c=>({...c,[key]:value}));

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setError(null);
    const latitude=Number(v.latitude),longitude=Number(v.longitude);
    if(!Number.isFinite(latitude)||latitude < -90||latitude > 90)return setError("Latitude ត្រូវនៅ -90..90");
    if(!Number.isFinite(longitude)||longitude < -180||longitude > 180)return setError("Longitude ត្រូវនៅ -180..180");
    const body:CreateStorePayload={
      storeName:v.storeName.trim(),description:v.description.trim()||null,addressLine:v.addressLine.trim(),
      commune:v.commune.trim()||null,district:v.district.trim()||null,city:v.city.trim()||null,province:v.province.trim()||null,
      countryCode:v.countryCode.trim().toUpperCase(),postalCode:v.postalCode.trim()||null,timezone:v.timezone.trim(),
      latitude,longitude,phoneNumber:v.phoneNumber.trim()||null,email:v.email.trim()||null,
      logoMediaUuid:v.logoMediaUuid.trim()||null,coverMediaUuid:v.coverMediaUuid.trim()||null,
      priceLevel:v.priceLevel.trim()?Number(v.priceLevel):null,hygieneRating:v.hygieneRating.trim()?Number(v.hygieneRating):null,
      operatingStatus:v.operatingStatus,
      socialLinks:social.map((x,i)=>({platform:x.platform.trim(),profileUrl:x.profileUrl.trim(),displayOrder:Number(x.displayOrder)||i+1})).filter(x=>x.platform&&x.profileUrl),
    };
    try{const s=await create(body).unwrap();router.push(s?.uuid?`/shops/${s.uuid}`:"/shops");router.refresh();}
    catch(err){setError(getShopApiErrorMessage(err));}
  };

  return <div className="space-y-5 p-4 sm:p-6 lg:p-7">
    <section className="relative overflow-hidden rounded-[30px] bg-[#137A3D] px-6 py-7 text-white shadow-xl sm:px-8">
      <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10"/>
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><Link href="/shops" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"><ArrowLeft size={17}/>Back to stores</Link>
          <h1 className="mt-5 flex items-center gap-3 text-3xl font-black"><Store size={30}/>បង្កើត Store ថ្មី</h1>
          <p className="mt-2 text-sm text-emerald-50">Manual POST /admin/stores ឬ Google Places import។</p>
        </div>
        <button type="button" onClick={()=>setGoogleOpen(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-black text-[#137A3D]"><MapPinned size={19}/>Import from Google</button>
      </div>
    </section>

    <form onSubmit={submit} className="space-y-5">
      <ShopBasicInfoSection values={v} onChange={set}/>
      <ShopLocationSection values={v} onChange={set}/>
      <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black">Contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label><span className="mb-2 block text-sm font-bold">Phone</span><input value={v.phoneNumber} onChange={e=>set("phoneNumber",e.target.value)} className="h-12 w-full rounded-2xl border px-4"/></label>
          <label><span className="mb-2 block text-sm font-bold">Email</span><input type="email" value={v.email} onChange={e=>set("email",e.target.value)} className="h-12 w-full rounded-2xl border px-4"/></label>
        </div>
      </section>
      <ShopImageUploadGrid logoMediaUuid={v.logoMediaUuid} coverMediaUuid={v.coverMediaUuid} onChange={set}/>
      <ShopSocialSection links={social} onChange={setSocial}/>
      <ShopHoursSection/>
      {error&&<div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border bg-white/95 p-4 shadow-xl backdrop-blur">
        <Link href="/shops" className="rounded-xl border px-5 py-3 font-black">Cancel</Link>
        <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-5 py-3 font-black text-white disabled:opacity-60">
          {isLoading?<Loader2 size={18} className="animate-spin"/>:<Save size={18}/>} {isLoading?"Creating...":"Create Store"}
        </button>
      </div>
    </form>
    <GooglePlacesImportModal open={googleOpen} onClose={()=>setGoogleOpen(false)}/>
  </div>;
}
