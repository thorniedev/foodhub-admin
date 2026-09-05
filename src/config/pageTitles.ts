import { dashboardNav, type NavItem } from "./dashboardNav";

export interface PageTitleEntry {
  title: string;
  parent?: string;
  parentHref?: string;
}

const DEFAULT_TITLE: PageTitleEntry = { title: "ផ្ទាំងគ្រប់គ្រង" };

// Explicit sub-route overrides for create/detail pages
const SUB_ROUTE_TITLES: Record<string, PageTitleEntry> = {
  "/shops/create": { title: "បន្ថែមហាងថ្មី", parent: "ហាង", parentHref: "/shops" },
  "/users/create": { title: "បង្កើតអ្នកប្រើប្រាស់ថ្មី", parent: "អ្នកប្រើប្រាស់", parentHref: "/users" },
  "/filter/food-sub-categories": { title: "អនុប្រភេទម្ហូប", parent: "ចម្រោះទិន្នន័យ", parentHref: "/filter" },
  "/filter/drink-sub-categories": { title: "អនុប្រភេទភេសជ្ជៈ", parent: "ចម្រោះទិន្នន័យ", parentHref: "/filter" },
};

function buildNavLookup(): Record<string, PageTitleEntry> {
  const lookup: Record<string, PageTitleEntry> = {};

  function traverse(items: NavItem[], parentLabel?: string, parentLink?: string) {
    for (const item of items) {
      if (item.href) {
        lookup[item.href] = {
          title: item.label,
          ...(parentLabel ? { parent: parentLabel, parentHref: parentLink } : {}),
        };
      }

      if (item.children && item.children.length > 0) {
        traverse(item.children, item.label, item.href);
      }
    }
  }

  traverse(dashboardNav);
  return lookup;
}

export function getPageTitle(pathname: string): PageTitleEntry {
  if (!pathname) return DEFAULT_TITLE;

  // Clean pathname
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Check explicit sub-route overrides
  if (SUB_ROUTE_TITLES[cleanPath]) {
    return SUB_ROUTE_TITLES[cleanPath];
  }

  // Dynamic lookup generated from dashboardNav
  const navLookup = buildNavLookup();

  // Exact match
  if (navLookup[cleanPath]) {
    return navLookup[cleanPath];
  }

  // Match detail routes like /shops/[uuid], /users/[id], /users/[id]/profiles/[profileUuid]
  if (cleanPath.startsWith("/shops/")) {
    return { title: "ព័ត៌មានហាង", parent: "ហាង", parentHref: "/shops" };
  }

  if (cleanPath.startsWith("/users/")) {
    if (cleanPath.includes("/profiles/")) {
      return { title: "ព័ត៌មាន Profile", parent: "អ្នកប្រើប្រាស់", parentHref: "/users" };
    }
    return { title: "ព័ត៌មានអ្នកប្រើប្រាស់", parent: "អ្នកប្រើប្រាស់", parentHref: "/users" };
  }

  if (cleanPath.startsWith("/menu-items")) {
    return { title: "ម៉ឺនុយ" };
  }

  if (cleanPath.startsWith("/food-catalog")) {
    return { title: "ម្ហូបអាហារ" };
  }

  if (cleanPath.startsWith("/dynamic-content")) {
    const matched = Object.keys(navLookup)
      .filter((p) => p !== "/" && cleanPath.startsWith(p))
      .sort((a, b) => b.length - a.length);

    if (matched.length > 0) {
      return navLookup[matched[0]];
    }
    return { title: "មាតិកាដែលប្រែប្រួល" };
  }

  if (cleanPath.startsWith("/filter")) {
    const matched = Object.keys(navLookup)
      .filter((p) => p !== "/" && cleanPath.startsWith(p))
      .sort((a, b) => b.length - a.length);

    if (matched.length > 0) {
      return navLookup[matched[0]];
    }
    return { title: "ចម្រោះទិន្នន័យ" };
  }

  // Prefix matching across all nav items
  const matches = Object.keys(navLookup)
    .filter((path) => path !== "/" && cleanPath.startsWith(path))
    .sort((a, b) => b.length - a.length);

  if (matches.length > 0) {
    return navLookup[matches[0]];
  }

  return DEFAULT_TITLE;
}