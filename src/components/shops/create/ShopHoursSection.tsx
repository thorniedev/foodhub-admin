import { Clock3 } from "lucide-react";
export default function ShopHoursSection() {
  return (
    <section className="rounded-[24px] border border-amber-100 bg-amber-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Clock3 size={21} className="mt-0.5 text-amber-700" />
        <div>
          <h2 className="font-black text-amber-900">Opening hours</h2>
          {/* <p className="mt-1 text-sm leading-6 text-amber-800/80">
            Hours មិនមែនជាផ្នែកនៃ create payload។ បង្កើត Store មុន ហើយចូល detail
            ដើម្បី PUT /api/v1/admin/stores/{"{uuid}"}/hours។
          </p> */}
        </div>
      </div>
    </section>
  );
}
