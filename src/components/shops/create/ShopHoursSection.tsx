import {
  Clock3,
} from "lucide-react";

export default function ShopHoursSection() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary-50
            text-primary-800
          "
        >
          <Clock3 size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-3xl font-semibold text-primary-800">
            ម៉ោងបើកបិទ
          </p>

          <p className="mt-2 max-w-3xl text-lg leading-8 text-gray-500">
            Hours មិនមែនជាផ្នែកនៃ create payload។
            បង្កើត Store មុន ហើយចូល detail
            ដើម្បីកំណត់ម៉ោងបើកបិទ។
          </p>
        </div>
      </div>
    </section>
  );
}