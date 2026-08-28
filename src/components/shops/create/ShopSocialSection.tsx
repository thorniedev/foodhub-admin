import { Plus, Share2, Trash2 } from "lucide-react";

import {
  MAX_STORE_SOCIAL_LINKS,
  STORE_SOCIAL_PLATFORMS,
  type StoreSocialLink,
  type StoreSocialPlatform,
} from "@/src/types/shop";

import { getSocialLinkError } from "../StoreSocialLinksEditor";

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

export default function ShopSocialSection({
  links,
  onChange,
}: {
  links: StoreSocialLink[];
  onChange: (value: StoreSocialLink[]) => void;
}) {
  const usedPlatforms = new Set(links.map((link) => link.platform));

  const nextAvailablePlatform = (): StoreSocialPlatform =>
    STORE_SOCIAL_PLATFORMS.find((platform) => !usedPlatforms.has(platform)) ??
    STORE_SOCIAL_PLATFORMS[0];

  const canAdd = links.length < MAX_STORE_SOCIAL_LINKS;

  const update = (index: number, key: keyof StoreSocialLink, value: string) => {
    const next = [...links];

    next[index] = {
      ...next[index],
      [key]: key === "displayOrder" ? Number(value) : value,
    };

    onChange(next);
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
      {/* =================================================
          SECTION HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary-50
              text-primary-800
            "
          >
            <Share2 size={24} />
          </div>

          <div className="min-w-0">
            <p className="text-2xl font-medium text-[#0F5A2C]">
              បណ្ដាញសង្គម
            </p>

            <p className="mt-1 text-lg font-normal leading-7 text-gray-500">
              បន្ថែមបណ្ដាញសង្គមរបស់ហាងសម្រាប់បង្ហាញទៅកាន់គណនីអ្នកប្រើប្រាស់ (អតិបរមា {MAX_STORE_SOCIAL_LINKS} links · មួយ platform មួយ link)។
            </p>
          </div>
        </div>

        {/* ADD BUTTON */}

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
            inline-flex
            min-h-12
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-full
            bg-primary-800
            px-6
            text-lg
            font-normal
            text-white
            transition
            hover:bg-primary-900
            focus:outline-none
            focus:ring-2
            focus:ring-primary-100
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-fit
          "
        >
          <Plus size={20} />
          បន្ថែម
        </button>
      </div>

      {/* =================================================
          SOCIAL LINKS
      ================================================== */}

      <div className="mt-6 space-y-4">
        {links.length === 0 ? (
          /* ===============================================
             EMPTY STATE
          ================================================ */

          <div
            className="
              flex
              min-h-[150px]
              flex-col
              items-center
              justify-center
              rounded-3xl
              border
              border-dashed
              border-gray-200
              bg-gray-50/50
              px-5
              text-center
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-primary-50
                text-primary-700
              "
            >
              <Share2 size={23} />
            </div>

            <p className="mt-3 text-lg font-normal text-gray-600">
              មិនទាន់មានបណ្ដាញសង្គម
            </p>

            <p className="mt-1 text-lg font-normal leading-7 text-gray-400">
              ចុចប៊ូតុង "បន្ថែម" ដើម្បីបញ្ចូលបណ្ដាញសង្គមថ្មី។
            </p>
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
                className="
                    rounded-3xl
                    border
                    border-gray-100
                    bg-gray-50/70
                    p-5
                    sm:p-6
                  "
              >
                <div
                  className="
                      grid
                      grid-cols-1
                      gap-5
                      lg:grid-cols-[1fr_2fr_180px_52px]
                      lg:items-end
                    "
                >
                  {/* =====================================
                        PLATFORM
                    ====================================== */}

                  <label className="block min-w-0">
                    <span
                      className="
                          mb-2
                          block
                          text-lg
                          font-normal
                          text-gray-700
                        "
                    >
                      Platform
                    </span>

                    <select
                      value={link.platform}
                      onChange={(event) =>
                        update(index, "platform", event.target.value)
                      }
                      className="
                          h-12
                          w-full
                          rounded-full
                          border
                          border-gray-200
                          bg-white
                          px-5
                          text-lg
                          font-normal
                          text-gray-800
                          outline-none
                          transition
                          hover:border-gray-300
                          focus:border-primary-600
                          focus:ring-2
                          focus:ring-primary-100
                        "
                    >
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
                  </label>

                  {/* =====================================
                        PROFILE URL
                    ====================================== */}

                  <label className="block min-w-0">
                    <span
                      className="
                          mb-2
                          block
                          text-lg
                          font-normal
                          text-gray-700
                        "
                    >
                      Profile URL
                    </span>

                    <input
                      value={link.profileUrl}
                      onChange={(event) =>
                        update(index, "profileUrl", event.target.value)
                      }
                      placeholder={placeholder}
                      className="
                          h-12
                          w-full
                          rounded-full
                          border
                          border-gray-200
                          bg-white
                          px-5
                          text-lg
                          font-normal
                          text-gray-800
                          outline-none
                          transition
                          placeholder:text-gray-400
                          hover:border-gray-300
                          focus:border-primary-600
                          focus:ring-2
                          focus:ring-primary-100
                        "
                    />
                  </label>

                  {/* =====================================
                        DISPLAY ORDER
                    ====================================== */}

                  <label className="block min-w-0">
                    <span
                      className="
                          mb-2
                          block
                          text-lg
                          font-normal
                          text-gray-700
                        "
                    >
                      Display order
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={link.displayOrder}
                      onChange={(event) =>
                        update(index, "displayOrder", event.target.value)
                      }
                      placeholder="1"
                      className="
                          h-12
                          w-full
                          rounded-full
                          border
                          border-gray-200
                          bg-white
                          px-5
                          text-lg
                          font-normal
                          text-gray-800
                          outline-none
                          transition
                          placeholder:text-gray-400
                          hover:border-gray-300
                          focus:border-primary-600
                          focus:ring-2
                          focus:ring-primary-100
                        "
                    />
                  </label>

                  {/* =====================================
                        DELETE
                    ====================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        links.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="Remove social link"
                    title="លុប Social link"
                    className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-red-100
                        bg-white
                        text-red-500
                        transition
                        hover:bg-red-50
                        hover:text-red-600
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-100
                      "
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {error && (
                  <p className="mt-3 text-lg font-normal text-red-600">
                    {error}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
