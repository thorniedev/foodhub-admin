export interface PageTitleEntry {
  title: string;
  parent?: string;
}

// Keyed by exact pathname (no /dashboard prefix, since routes now live
// directly under the (dashboard) route group).
export const PAGE_TITLES: Record<string, PageTitleEntry> = {
  "/": { title: "ផ្ទាំងគ្រប់គ្រង" },

  "/shops": { title: "ការគ្រប់គ្រងហាង" },
  "/shops/create": { title: "បន្ថែមហាងថ្មី", parent: "ហាង" },

  "/users": { title: "អ្នកប្រើប្រាស់" },

  "/food-types/dishes": { title: "អាហារ", parent: "ប្រភេទអាហារ" },
  "/food-types/drinks": { title: "ភេសជ្ជៈ:", parent: "ប្រភេទអាហារ" },
  "/food-types/create": { title: "បន្ថែមអាហារថ្មី", parent: "ប្រភេទអាហារ" },
  "/food-types/drinks/create": {
    title: "បន្ថែមភេសជ្ជៈថ្មី",
    parent: "ប្រភេទអាហារ",
  },

  "/dynamic-content": { title: "មាតិកាថាមវន្ត" },
  "/dynamic-content/banners": {
    title: "រូបភេណី",
    parent: "មាតិកាថាមវន្ត",
  },
  "/dynamic-content/food-by-season": {
    title: "រូបអាហារតាមរដូវកាល",
    parent: "មាតិកាថាមវន្ត",
  },
  "/dynamic-content/food-by-area": {
    title: "រូបអាហារតាមតំបន់",
    parent: "មាតិកាថាមវន្ត",
  },
};

const DEFAULT_TITLE: PageTitleEntry = { title: "ផ្ទាំងគ្រប់គ្រង" };

export function getPageTitle(pathname: string): PageTitleEntry {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Fallback: match the longest known prefix, so unlisted nested routes
  // (e.g. a future /shops/edit/123) still get a sensible title instead
  // of falling back to the dashboard default.
  const matches = Object.keys(PAGE_TITLES)
    .filter((path) => path !== "/" && pathname.startsWith(path))
    .sort((a, b) => b.length - a.length);

  if (matches.length > 0) return PAGE_TITLES[matches[0]];

  return DEFAULT_TITLE;
}