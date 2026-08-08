import type { StoreOperatingStatus } from "@/src/types/shop";

export default function ShopBasicInfoSection({
  values,onChange,
}:{
  values:{storeName:string;description:string;countryCode:string;timezone:string;priceLevel:string;hygieneRating:string;operatingStatus:StoreOperatingStatus};
  onChange:(key:"storeName"|"description"|"countryCode"|"timezone"|"priceLevel"|"hygieneRating"|"operatingStatus",value:string)=>void;
}) {
  return <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="text-lg font-black text-gray-900">ព័ត៌មានមូលដ្ឋាន</h2>
    <p className="mt-1 text-sm text-gray-500">Fields ត្រូវតាម POST /admin/stores payload។</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="Store name" value={values.storeName} onChange={v=>onChange("storeName",v)} required/>
      <Field label="Country code" value={values.countryCode} onChange={v=>onChange("countryCode",v)} required/>
      <Field label="Timezone" value={values.timezone} onChange={v=>onChange("timezone",v)} required/>
      <label><span className="mb-2 block text-sm font-bold">Operating status</span>
        <select value={values.operatingStatus} onChange={e=>onChange("operatingStatus",e.target.value)} className="h-12 w-full rounded-2xl border px-4">
          {["OPEN","CLOSED","TEMPORARILY_CLOSED","UNKNOWN"].map(x=><option key={x}>{x}</option>)}
        </select>
      </label>
      <Field label="Price level" type="number" value={values.priceLevel} onChange={v=>onChange("priceLevel",v)}/>
      <Field label="Hygiene rating" type="number" step="0.1" value={values.hygieneRating} onChange={v=>onChange("hygieneRating",v)}/>
      <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Description</span>
        <textarea rows={4} value={values.description} onChange={e=>onChange("description",e.target.value)} className="w-full rounded-2xl border px-4 py-3 text-sm"/>
      </label>
    </div>
  </section>;
}
function Field({label,value,onChange,type="text",required=false,step}:{label:string;value:string;onChange:(v:string)=>void;type?:string;required?:boolean;step?:string}) {
  return <label><span className="mb-2 block text-sm font-bold">{label}</span><input type={type} step={step} required={required} value={value} onChange={e=>onChange(e.target.value)} className="h-12 w-full rounded-2xl border px-4 text-sm"/></label>;
}
