import { Plus, Salad } from "lucide-react";

type Props = {
  total: number;
  activeCount: number;
  inactiveCount: number;
  onAdd: () => void;
};

export default function DietaryTypesHeader({
  total,
  activeCount,
  inactiveCount,
  onAdd,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#147A38] px-6 py-6 text-white shadow-sm sm:px-8 lg:px-10 lg:py-8">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Salad size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">គ្រប់គ្រងរបបអាហារ</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                គ្រប់គ្រង បន្ថែម កែប្រែ បិទ និងស្ដារប្រភេទរបបអាហារដែលប្រើក្នុងប្រព័ន្ធ FoodHub។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-white/75">សរុប</p>
              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-white/75">សកម្មក្នុងទំព័រ</p>
              <p className="mt-1 text-2xl font-bold">{activeCount}</p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm text-white/75">អសកម្មក្នុងទំព័រ</p>
              <p className="mt-1 text-2xl font-bold">{inactiveCount}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
        >
          <Plus size={18} />
          បន្ថែមរបបអាហារ
        </button>
      </div>
    </section>
  );
}
