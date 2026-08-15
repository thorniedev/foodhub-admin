import {
  Plus,
  UsersRound,
} from "lucide-react";

type Props = {
  total: number;

  currentPageCount: number;

  onAdd: () => void;
};

export default function AgeGroupsHeader({
  total,

  currentPageCount,

  onAdd,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <UsersRound
                size={
                  25
                }
              />
            </div>

            <div>
              <p className="text-3xl font-bold text-accent-400">
                គ្រប់គ្រងក្រុមអាយុ
              </p>

              <p className="mt-2 max-w-2xl text-xl leading-7 text-white/85">
                គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបក្រុមអាយុដែលប្រើក្នុងប្រព័ន្ធ MhouBahar។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <p className="text-xl text-white/75">
                ក្រុមអាយុសកម្មសរុប
              </p>

              <p className="mt-1 text-2xl font-bold">
                {total}
              </p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <p className="text-xl text-white/75">
                ក្នុងទំព័រនេះ
              </p>

              <p className="mt-1 text-2xl font-bold">
                {
                  currentPageCount
                }
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onAdd
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50 sm:w-fit"
        >
          <Plus
            size={
              20
            }
          />

          បន្ថែមក្រុមអាយុ
        </button>
      </div>
    </section>
  );
}