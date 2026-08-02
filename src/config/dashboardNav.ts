import {
  LayoutDashboard,
  Store,
  Users,
  UtensilsCrossed,
  Globe,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavChildItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChildItem[];
}

export const dashboardNav: NavItem[] = [
  {
    label: "ផ្ទាំងគ្រប់គ្រង",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "ហាង",
    href: "/shops",
    icon: Store,
  },
  {
    label: "អ្នកប្រើប្រាស់",
    href: "/users",
    icon: Users,
  },
  {
    label: "ប្រភេទអាហារ",
    icon: UtensilsCrossed,
    children: [
      { label: "ចំណីអាហារ", href: "/food-types/dishes" },
      { label: "ភេសជ្ជៈ", href: "/food-types/drinks" },
    ],
  },
  {
    label: "មាតិកាដែលប្រែប្រួល  ",
    icon: Globe,
    children: [
      { label: "រូបបេនណឺ", href: "/dynamic-content/banners" },
      { label: "ស្លាកត្រង", href: "/dynamic-content/filters" },
      {
        label: "រូបអាហារតាមរដូវកាល",
        href: "/dynamic-content/food-by-season",
      },
      {
        label: "រូបអាហារតាមតំបន់",
        href: "/dynamic-content/food-by-area",
      },
    ],
  },
];

export const dashboardBottomNav: NavItem[] = [
  {
    label: "ការកំណត់",
    href: "/settings",
    icon: Settings,
  },
];

function flatten(items: NavItem[]) {
  const map: Record<string, string> = {};
  for (const item of items) {
    if (item.href) map[item.href] = item.label;
    item.children?.forEach((c) => {
      map[c.href] = c.label;
    });
  }
  return map;
}

export const navRouteMap: Record<string, string> = {
  ...flatten(dashboardNav),
  ...flatten(dashboardBottomNav),
};
