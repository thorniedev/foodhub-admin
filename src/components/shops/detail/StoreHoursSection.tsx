import { CalendarClock, Clock3 } from "lucide-react";
import type { StoreHour } from "@/src/types/shop";
import { formatDayOfWeek, formatStoreHour } from "@/src/lib/shopFormat";
import { Section } from "./StoreOverviewSection";
export default function StoreHoursSection({hours,loading=false}:{hours:StoreHour[];loading?:boolean}) {
  return <Section title={`Opening hours (${hours.length})`} icon={<Clock3 size={18}/>}>
    {loading?<p className="text-sm text-gray-400">Loading...</p>:hours.length===0?<div className="rounded-2xl bg-gray-50 p-7 text-center text-sm text-gray-400">No hours returned</div>:
    <div className="space-y-3">{hours.map((h,i)=><div key={i} className="flex flex-col gap-2 rounded-2xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="flex items-center gap-2 font-black"><CalendarClock size={15} className="text-[#137A3D]"/>{h.scheduleType==="WEEKLY"?formatDayOfWeek(h.dayOfWeek):h.businessDate??"Special date"}</p>
      <p className="mt-1 text-xs text-gray-400">{h.scheduleType} · interval {h.intervalOrder}{h.reason?` · ${h.reason}`:""}</p></div>
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black">{formatStoreHour(h)}</span>
    </div>)}</div>}
  </Section>;
}
