import { ImageIcon } from "lucide-react";
export default function ShopImageUploadGrid({
  logoMediaUuid,
  coverMediaUuid,
  onChange,
}: {
  logoMediaUuid: string;
  coverMediaUuid: string;
  onChange: (key: "logoMediaUuid" | "coverMediaUuid", value: string) => void;
}) {
  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D]">
          <ImageIcon size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black">Store media</h2>
          {/* <p className="mt-1 text-sm text-gray-500">
            Store collection មាន logoMediaUuid / coverMediaUuid ប៉ុណ្ណោះ;
            media-upload endpoint មិនមានក្នុង source នេះ។
          </p> */}
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-bold">Logo media UUID</span>
          <input
            value={logoMediaUuid}
            onChange={(e) => onChange("logoMediaUuid", e.target.value)}
            className="h-12 w-full rounded-2xl border px-4 text-sm"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold">Cover media UUID</span>
          <input
            value={coverMediaUuid}
            onChange={(e) => onChange("coverMediaUuid", e.target.value)}
            className="h-12 w-full rounded-2xl border px-4 text-sm"
          />
        </label>
      </div>
    </section>
  );
}
