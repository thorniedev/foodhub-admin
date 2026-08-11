import { Clock3 } from "lucide-react";

export default function ShopHoursSection() {
  return (
    <section className="rounded-[24px] border border-orange-100 bg-orange-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#F97316]">
          <Clock3 size={22} />
        </div>
        <div>
          <p className="text-xl font-semibold text-[#F97316]">ម៉ោងបើកបិទ</p>
          <p className="mt-1 text-base leading-7 text-orange-800/80">
            Hours មិនមែនជាផ្នែកនៃ create payload។ បង្កើត Store មុន ហើយចូល detail ដើម្បីកំណត់ម៉ោងបើកបិទ។
          </p>
        </div>
      </div>
    </section>
  );
}
