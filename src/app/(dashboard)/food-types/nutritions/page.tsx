import Link from "next/link";

export default function NutritionsPage() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#136C34]">អាហាររូបត្ថម្ភ</h1>
          <p className="mt-2 text-sm text-gray-500">
            ទំព័រនេះមិនទាន់បានភ្ជាប់ទៅ API នៅឡើយទេ។
          </p>
        </div>
        <Link
          href="/food-types/nutritions/create"
          className="inline-flex items-center justify-center rounded-xl bg-[#136C34] px-4 py-2 text-sm font-semibold text-white"
        >
          បន្ថែមថ្មី
        </Link>
      </div>
    </div>
  );
}
