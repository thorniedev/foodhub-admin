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
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <Globe size={32} className="mx-auto text-gray-300" />
          <p className="mt-2 text-lg font-medium text-gray-400">
            មិនទាន់មានតំណភ្ជាប់បណ្តាញសង្គមឡើយ
          </p>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-800 px-5 py-2 text-lg font-bold text-white shadow-xs transition hover:bg-primary-900"
            >
              <Pencil size={16} />
              បន្ថែមបណ្តាញសង្គម
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
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
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3.5 transition hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                    <Globe size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-gray-800">
                      {link.platform}
                    </p>
                    <p className="truncate text-base text-gray-500 font-mono">
                      {link.profileUrl}
                    </p>
                  </div>
                </div>

                <div className="ml-3 shrink-0 text-primary-700">
                  <ExternalLink size={18} />
                </div>
              </a>
            ))}
        </div>
      )}
    </Section>
  );
}
