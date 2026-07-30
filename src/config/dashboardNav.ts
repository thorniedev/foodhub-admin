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
    href: "/", // dashboard content lives at root, not /dashboard
    icon: LayoutDashboard,
  },
  {
    label: "ហាង",
    href: "/dashboard/shops",
    icon: Store,
  },
  {
    label: "អ្នកប្រើប្រាស់",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "ប្រភេទអាហារ",
    icon: UtensilsCrossed,
    children: [
      { label: "ចំណីអាហារ", href: "/dashboard/food-types/dishes" },
      { label: "ភេសជ្ជៈ", href: "/dashboard/food-types/drinks" },
    ],
  },
];

export const dashboardFooterNav: NavItem[] = [
    {
    label: "មាតិកាដែលប្រែប្រួលជានិច្ច",
    icon: Globe,
    children: [
      { label: "រូបបេនណឺ", href: "/dashboard/dynamic-content/banners" },
      { label: "ស្លាកតម្រង", href: "/dashboard/dynamic-content/filters" },
      { label: "រូបអាហារតាមរដូវកាល", href: "/dashboard/dynamic-content/food-by-season" },
      { label: "រូបអាហារតាមតំបន់", href: "/dashboard/dynamic-content/food-by-area" },
    ],
  },

];

export const dashboardBottomNav: NavItem[] = [
  {
    label: "ការកំណត់",
    href: "/dashboard/settings",
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
  ...flatten(dashboardFooterNav),
  ...flatten(dashboardBottomNav),
};
