import { ExternalLink, Share2 } from "lucide-react";

import type { StoreSocialLink } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";

export default function StoreSocialLinksSection({
  links,
}: {
  links: StoreSocialLink[];
}) {
  return (
    <Section title={`Social links (${links.length})`} icon={<Share2 size={20} />}>
      {links.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center text-base text-gray-400">
          No social links
        </div>
      ) : (
        <div className="space-y-3">
          {[...links]
            .sort((first, second) =>
              (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
            )
            .map((link, index) => (
              <a
                key={`${link.profileUrl}-${index}`}
                href={link.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-emerald-50"
              >
                <div className="min-w-0">
                  <p className="text-lg text-gray-800">{link.platform}</p>
                  <p className="truncate text-base text-gray-400">{link.profileUrl}</p>
                </div>
                <ExternalLink size={18} className="text-[#137A3D]" />
              </a>
            ))}
        </div>
      )}
    </Section>
  );
}
