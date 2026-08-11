import { Plus, Trash2 } from "lucide-react";
import type { StoreSocialLink } from "@/src/types/shop";

export default function ShopSocialSection({
  links,
  onChange,
}: {
  links: StoreSocialLink[];
  onChange: (value: StoreSocialLink[]) => void;
}) {
  const update = (index: number, key: keyof StoreSocialLink, value: string) => {
    const next = [...links];
    next[index] = {
      ...next[index],
      [key]: key === "displayOrder" ? Number(value) : value,
    };
    onChange(next);
  };

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-4xl font-bold text-gray-900">Social links</p>

        <button
          type="button"
          onClick={() =>
            onChange([
              ...links,
              {
                platform: "FACEBOOK",
                profileUrl: "",
                displayOrder: links.length + 1,
              },
            ])
          }
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 text-lg font-semibold text-[#137A3D] transition hover:bg-emerald-100"
        >
          <Plus size={18} />
          បន្ថែម
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-base text-gray-400">
            មិនមាន Social links
          </div>
        ) : (
          links.map((link, index) => (
            <div
              key={`${link.platform}-${index}`}
              className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-[170px_1fr_110px_44px]"
            >
              <input
                value={link.platform}
                onChange={(event) => update(index, "platform", event.target.value)}
                placeholder="Platform"
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#136C34]"
              />
              <input
                value={link.profileUrl}
                onChange={(event) => update(index, "profileUrl", event.target.value)}
                placeholder="https://..."
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#136C34]"
              />
              <input
                type="number"
                min="1"
                value={link.displayOrder}
                onChange={(event) => update(index, "displayOrder", event.target.value)}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#136C34]"
              />
              <button
                type="button"
                onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                aria-label="Remove social link"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
