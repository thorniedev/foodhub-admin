import { ExternalLink, Share2 } from "lucide-react";
import type { StoreSocialLink } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";

export default function StoreSocialLinksSection({
  links,
}: {
  links: StoreSocialLink[];
}) {
  return (
    <Section title={`Social links (${links.length})`} icon={<Share2 size={24} />}>
      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-lg text-gray-400">
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
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-4 transition hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="text-xl font-bold text-gray-900">{link.platform}</p>
                  <p className="mt-1 truncate text-lg text-gray-500">{link.profileUrl}</p>
                </div>
                <ExternalLink size={20} className="text-emerald-700" />
              </a>
            ))}
        </div>
      )}
    </Section>
  );
}
