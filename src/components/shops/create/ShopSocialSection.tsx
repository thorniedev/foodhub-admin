import type { StoreSocialLink } from "@/src/types/shop";

import StoreSocialLinksEditor from "../StoreSocialLinksEditor";

export default function ShopSocialSection({
  links,
  onChange,
}: {
  links: StoreSocialLink[];
  onChange: (value: StoreSocialLink[]) => void;
}) {
  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-4xl font-bold text-gray-900">Social links</p>

      <div className="mt-5">
        <StoreSocialLinksEditor links={links} onChange={onChange} />
      </div>
    </section>
  );
}
