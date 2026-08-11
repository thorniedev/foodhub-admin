"use client";

import Link from "next/link";
import {
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import {
  usePathname,
} from "next/navigation";
import {
  useMemo,
  useState,
} from "react";

import {
  FILTER_GROUPS,
} from "@/src/config/filterCatalog";

const API_ROUTE_OVERRIDES: Record<string, string> = {
  ALLERGEN: "/filter/allergic",
  DIETARY_TYPE: "/filter/dietary-type",
  MEDICAL_CONDITION: "/filter/medical-conditions",
};

export default function FilterTagsSidebarSection() {
  const pathname =
    usePathname();

  const [
    open,
    setOpen,
  ] = useState(true);

  const items =
    useMemo(
      () =>
        FILTER_GROUPS.map(
          (group) => ({
            ...group,
            href:
              API_ROUTE_OVERRIDES[
                group.code
              ] ??
              `/filter-tags/${group.slug}`,
          }),
        ),
      [],
    );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#136C34] transition hover:bg-emerald-50"
      >
        <span className="inline-flex items-center gap-2 text-base font-bold">
          <SlidersHorizontal
            size={18}
          />
          ស្លាកត្រង
        </span>

        <ChevronDown
          size={17}
          className={`transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="max-h-[440px] space-y-1 overflow-y-auto pl-2 pr-1">
          {items.map(
            (item) => {
              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                );

              return (
                <Link
                  key={
                    item.code
                  }
                  href={
                    item.href
                  }
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[#136C34] text-white"
                      : "text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                  }`}
                >
                  {
                    item.labelKm
                  }
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
