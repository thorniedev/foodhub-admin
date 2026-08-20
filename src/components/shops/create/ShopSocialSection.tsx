import { Plus, Share2, Trash2 } from "lucide-react";

import type { StoreSocialLink } from "@/src/types/shop";

import StoreSocialLinksEditor from "../StoreSocialLinksEditor";

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
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      {/* =================================================
          SECTION HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary-50
              text-primary-800
            "
          >
            <Share2 size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-3xl font-semibold text-primary-800">
              Social links
            </p>

            <p className="mt-1 text-lg leading-7 text-gray-500">
              បន្ថែមបណ្ដាញសង្គមរបស់ហាងសម្រាប់បង្ហាញទៅកាន់គណនីអ្នកប្រើប្រាស់។
            </p>
          </div>
        </div>

        {/* ADD BUTTON */}

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
          className="
            inline-flex
            min-h-[48px]
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-full
            bg-primary-800
            px-5
            text-lg
            font-medium
            text-white
            transition
            hover:bg-primary-900
            focus:outline-none
            focus:ring-4
            focus:ring-primary-100
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
              rounded-2xl
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
                rounded-xl
                bg-primary-50
                text-primary-700
              "
            >
              <Share2 size={23} />
            </div>

            <p className="mt-3 text-lg font-medium text-gray-600">
              មិនមាន Social links
            </p>

            <p className="mt-1 text-lg leading-7 text-gray-400">
              ចុចប៊ូតុង បន្ថែម ដើម្បីបញ្ចូល Social link ថ្មី។
            </p>
          </div>
        ) : (
          links.map((link, index) => (
            <div
              key={`${link.platform}-${index}`}
              className="
                  rounded-2xl
                  border
                  border-gray-100
                  bg-gray-50/70
                  p-4
                  sm:p-5
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
                        font-medium
                        text-primary-800
                      "
                  >
                    Platform
                  </span>

                  <input
                    value={link.platform}
                    onChange={(event) =>
                      update(index, "platform", event.target.value)
                    }
                    placeholder="ឧ. FACEBOOK"
                    className="
                        h-[52px]
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        text-lg
                        text-gray-800
                        outline-none
                        transition
                        placeholder:text-gray-400
                        hover:border-gray-300
                        focus:border-primary-600
                        focus:ring-4
                        focus:ring-primary-100
                      "
                  />
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
                        font-medium
                        text-primary-800
                      "
                  >
                    Profile URL
                  </span>

                  <input
                    value={link.profileUrl}
                    onChange={(event) =>
                      update(index, "profileUrl", event.target.value)
                    }
                    placeholder="https://facebook.com/your-store"
                    className="
                        h-[52px]
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        text-lg
                        text-gray-800
                        outline-none
                        transition
                        placeholder:text-gray-400
                        hover:border-gray-300
                        focus:border-primary-600
                        focus:ring-4
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
                        font-medium
                        text-primary-800
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
                        h-[52px]
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        text-lg
                        text-gray-800
                        outline-none
                        transition
                        placeholder:text-gray-400
                        hover:border-gray-300
                        focus:border-primary-600
                        focus:ring-4
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
                      h-[52px]
                      w-full
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-red-100
                      bg-white
                      text-red-500
                      transition
                      hover:bg-red-50
                      hover:text-red-600
                      focus:outline-none
                      focus:ring-4
                      focus:ring-red-100
                      lg:w-[52px]
                    "
                >
                  <Trash2 size={21} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
