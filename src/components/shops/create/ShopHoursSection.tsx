import {
  Clock3,
} from "lucide-react";

export default function ShopHoursSection() {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-primary-50
            text-primary-800
          "
        >
          <Clock3 size={24} />
        </div>

        <div className="min-w-0">
          <p className="text-2xl font-medium text-[#0F5A2C]">
            ម៉ោងបើក និងបិទហាង
          </p>

          <p className="mt-2 max-w-3xl text-lg font-normal leading-8 text-gray-500">
            ម៉ោងបើកបិទមិនមែនជាផ្នែកនៃការបង្កើតដំបូងឡើយ។
            សូមបង្កើតហាងជាមុនសិន បន្ទាប់មកចូលទៅកាន់ទំព័រព័ត៌មានលម្អិតនៃហាង
            ដើម្បីកំណត់ម៉ោងបើក និងបិទ។
          </p>
        </div>
      </div>
    </section>
  );
}