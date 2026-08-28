"use client";

import { ExternalLink, Globe, Pencil, Share2 } from "lucide-react";
import type { StoreSocialLink } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";

export default function StoreSocialLinksSection({
  links,
  onEdit,
}: {
  links: StoreSocialLink[];
  onEdit?: () => void;
}) {
  return (
    <Section
      title={`បណ្តាញសង្គម (${links.length})`}
      icon={<Share2 size={22} />}
    >
      {links.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <Globe size={36} className="mx-auto text-gray-300" />
          <p className="mt-3 text-lg font-normal text-gray-400">
            មិនទាន់មានតំណភ្ជាប់បណ្តាញសង្គមឡើយ
          </p>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary-800 px-6 text-lg font-normal text-white shadow-xs transition hover:bg-primary-900"
            >
              <Pencil size={18} />
              <span>បន្ថែមបណ្តាញសង្គម</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {[...links]
            .sort(
              (first, second) =>
                (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
            )
            .map((link, index) => (
              <a
                key={`${link.profileUrl}-${index}`}
                href={link.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4 transition hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800">
                    <Globe size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-medium text-gray-800">
                      {link.platform}
                    </p>
                    <p className="truncate text-lg text-gray-500 font-mono font-normal">
                      {link.profileUrl}
                    </p>
                  </div>
                </div>

                <div className="ml-3 shrink-0 text-primary-700">
                  <ExternalLink size={20} />
                </div>
              </a>
            ))}
        </div>
      )}
    </Section>
  );
}
