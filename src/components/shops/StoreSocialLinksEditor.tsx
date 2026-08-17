"use client";

import { Plus, Trash2 } from "lucide-react";

import {
  MAX_STORE_SOCIAL_LINKS,
  STORE_SOCIAL_PLATFORMS,
  STORE_SOCIAL_PLATFORM_HOSTS,
  type StoreSocialLink,
  type StoreSocialPlatform,
} from "@/src/types/shop";

const PLACEHOLDERS: Record<StoreSocialPlatform, string> = {
  FACEBOOK: "https://facebook.com/your-page",
  INSTAGRAM: "https://instagram.com/your-handle",
  TIKTOK: "https://tiktok.com/@your-handle",
  YOUTUBE: "https://youtube.com/@your-channel",
  TELEGRAM: "https://t.me/your-channel",
  X: "https://x.com/your-handle",
};

function isKnownPlatform(value: string): value is StoreSocialPlatform {
  return (STORE_SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

/**
 * Validates a single link the way the backend does, so the admin gets an inline
 * message instead of a 400. Returns null when the link is acceptable.
 */
export function getSocialLinkError(link: StoreSocialLink): string | null {
  if (!isKnownPlatform(link.platform)) {
    return `Platform "${link.platform}" មិនត្រឹមត្រូវទេ។`;
  }

  const url = link.profileUrl.trim();
  if (!url) {
    return `${link.platform}: សូមបញ្ចូល profile URL។`;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return `${link.platform}: URL មិនត្រឹមត្រូវទេ។`;
  }

  if (parsed.protocol !== "https:") {
    return `${link.platform}: URL ត្រូវតែចាប់ផ្ដើមដោយ https://។`;
  }

  const host = parsed.hostname.toLowerCase().replace(/\.+$/, "");
  const allowedHosts = STORE_SOCIAL_PLATFORM_HOSTS[link.platform];
  const hostAllowed = allowedHosts.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );

  if (!hostAllowed) {
    return `${link.platform}: URL ត្រូវតែជា ${allowedHosts.join(" ឬ ")}។`;
  }

  return null;
}

/**
 * Validates the whole list, including the backend's duplicate-platform and
 * maximum-count rules. Returns null when every link is acceptable.
 */
export function getSocialLinksError(links: StoreSocialLink[]): string | null {
  if (links.length > MAX_STORE_SOCIAL_LINKS) {
    return `Social links អតិបរមា ${MAX_STORE_SOCIAL_LINKS}។`;
  }

  const seen = new Set<string>();
  for (const link of links) {
    if (seen.has(link.platform)) {
      return `Platform ${link.platform} ស្ទួនគ្នា។`;
    }
    seen.add(link.platform);

    const error = getSocialLinkError(link);
    if (error) return error;
  }

  return null;
}

/**
 * Rows + add button only, with no outer card, so the create form and the edit
 * modal can each wrap it in their own section chrome.
 */
export default function StoreSocialLinksEditor({
  links,
  onChange,
  disabled = false,
}: {
  links: StoreSocialLink[];
  onChange: (value: StoreSocialLink[]) => void;
  disabled?: boolean;
}) {
  const usedPlatforms = new Set(links.map((link) => link.platform));

  const nextAvailablePlatform = (): StoreSocialPlatform =>
    STORE_SOCIAL_PLATFORMS.find((platform) => !usedPlatforms.has(platform)) ??
    STORE_SOCIAL_PLATFORMS[0];

  const update = (
    index: number,
    key: keyof StoreSocialLink,
    value: string,
  ) => {
    const next = [...links];
    next[index] = {
      ...next[index],
      [key]: key === "displayOrder" ? Number(value) : value,
    };
    onChange(next);
  };

  const canAdd = !disabled && links.length < MAX_STORE_SOCIAL_LINKS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-gray-500">
          អតិបរមា {MAX_STORE_SOCIAL_LINKS} links · មួយ platform មួយ link
        </p>

        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            onChange([
              ...links,
              {
                platform: nextAvailablePlatform(),
                profileUrl: "",
                displayOrder: links.length + 1,
              },
            ])
          }
          className="
            inline-flex items-center gap-2
            rounded-full
            bg-emerald-50
            px-4 py-2.5
            text-lg font-semibold
            text-[#137A3D]
            transition
            hover:bg-emerald-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Plus size={18} />
          បន្ថែម
        </button>
      </div>

      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-base text-gray-400">
            មិនមាន Social links
          </div>
        ) : (
          links.map((link, index) => {
            const error = getSocialLinkError(link);
            const placeholder = isKnownPlatform(link.platform)
              ? PLACEHOLDERS[link.platform]
              : "https://...";

            return (
              <div
                key={`${link.platform}-${index}`}
                className="rounded-2xl bg-gray-50 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[170px_1fr_110px_44px]">
                  <select
                    value={link.platform}
                    disabled={disabled}
                    onChange={(event) =>
                      update(index, "platform", event.target.value)
                    }
                    className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#136C34] disabled:opacity-60"
                  >
                    {/* Keep an unexpected value from the API visible rather than
                        silently rewriting it to the first option. */}
                    {!isKnownPlatform(link.platform) && (
                      <option value={link.platform}>{link.platform}</option>
                    )}

                    {STORE_SOCIAL_PLATFORMS.map((platform) => (
                      <option
                        key={platform}
                        value={platform}
                        disabled={
                          platform !== link.platform &&
                          usedPlatforms.has(platform)
                        }
                      >
                        {platform}
                      </option>
                    ))}
                  </select>

                  <input
                    value={link.profileUrl}
                    disabled={disabled}
                    onChange={(event) =>
                      update(index, "profileUrl", event.target.value)
                    }
                    placeholder={placeholder}
                    className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#136C34] disabled:opacity-60"
                  />

                  <input
                    type="number"
                    min="1"
                    disabled={disabled}
                    value={link.displayOrder}
                    onChange={(event) =>
                      update(index, "displayOrder", event.target.value)
                    }
                    className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#136C34] disabled:opacity-60"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange(
                        links.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    aria-label="Remove social link"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {link.profileUrl.trim() && error && (
                  <p className="mt-2 text-base text-red-600">{error}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
