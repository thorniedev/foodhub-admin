// import {
//   LayoutDashboard,
//   Store,
//   Users,
//   UtensilsCrossed,
//   Globe,
// } from "lucide-react";
// import { SidebarNavItem } from "../types/dashboard";

// export const dashboardNav: SidebarNavItem[] = [
//   {
//     label: "ផ្ទាំងគ្រប់គ្រង",
//     href: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     label: "ហាង",
//     href: "/dashboard/shops",
//     icon: Store,
//   },
//   {
//     label: "អ្នកប្រើប្រាស់",
//     icon: Users,
//     children: [
//       { label: "គណនីបុគ្គល", href: "/dashboard/users/individual" },
//       { label: "គណនីធ្វើ", href: "/dashboard/users/business" },
//       { label: "ព័ត៌មានអ្នកប្រើប្រាស់", href: "/dashboard/users/info" },
//     ],
//   },
//   {
//     label: "ប្រភេទអាហារ",
//     icon: UtensilsCrossed,
//     children: [
//       { label: "ចំណីអាហារ", href: "/dashboard/food-categories/meals" },
//       { label: "ភេសជ្ជៈ", href: "/dashboard/food-categories/drinks" },
//     ],
//   },
// ];

// export const dashboardFooterNav: SidebarNavItem[] = [
//   {
//     label: "មតិកែលែងផ្លាស់ប្តូរបានទិញ",
//     href: "/dashboard/feedback",
//     icon: Globe,
//   },
// ];

// export interface NavChildItem {
//   label: string;
//   href: string;
// }

// export interface NavItem {
//   label: string;
//   href?: string;
//   icon?: string;
//   children?: NavChildItem[];
// }

// export const navItems: NavItem[] = [
//   {
//     label: "ផ្ទាំងគ្រប់គ្រង",
//     href: "/dashboard",
//     icon: "LayoutDashboard",
//   },
//   {
//     label: "ហាង",
//     href: "/dashboard/shops",
//     icon: "Store",
//   },
//   {
//     label: "អ្នកប្រើប្រាស់",
//     icon: "Users",
//     children: [
//       { label: "គណនីអតិថិជន", href: "/dashboard/users/customers" },
//       { label: "គណនីម្ចាស់ហាង", href: "/dashboard/users/sellers" },
//       { label: "ព័ត៌មានអ្នកប្រើប្រាស់", href: "/dashboard/users/info" },
//     ],
//   },
//   {
//     label: "ប្រភេទអាហារ",
//     icon: "UtensilsCrossed",
//     children: [
//       { label: "ចំណីអាហារ", href: "/dashboard/food-types/dishes" },
//       { label: "ភេសជ្ជៈ", href: "/dashboard/food-types/drinks" },
//     ],
//   },
//   {
//     label: "មតិកែលម្អផ្សព្វផ្សាយទីផ្សារ",
//     href: "/dashboard/feedback",
//     icon: "Globe",
//   },
//   {
//     label: "ការកំណត់",
//     href: "/dashboard/settings",
//     icon: "Settings",
//   },
// ];

// import {
//   LayoutDashboard,
//   Store,
//   Users,
//   UtensilsCrossed,
//   Globe,
//   Settings,
//   type LucideIcon,
// } from "lucide-react";

// export interface NavChildItem {
//   label: string;
//   href: string;
// }

// export interface NavItem {
//   label: string;
//   href?: string;
//   icon: LucideIcon;
//   children?: NavChildItem[];
// }

// export const dashboardNav: NavItem[] = [
//   {
//     label: "ផ្ទាំងគ្រប់គ្រង",
//     href: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     label: "ហាង",
//     href: "/dashboard/shops",
//     icon: Store,
//   },
//   {
//     label: "អ្នកប្រើប្រាស់",
//     icon: Users,
//     children: [
//       { label: "គណនីអតិថិជន", href: "/dashboard/users/customers" },
//       { label: "គណនីម្ចាស់ហាង", href: "/dashboard/users/sellers" },
//       { label: "ព័ត៌មានអ្នកប្រើប្រាស់", href: "/dashboard/users/info" },
//     ],
//   },
//   {
//     label: "ប្រភេទអាហារ",
//     icon: UtensilsCrossed,
//     children: [
//       { label: "ចំណីអាហារ", href: "/dashboard/food-types/dishes" },
//       { label: "ភេសជ្ជៈ", href: "/dashboard/food-types/drinks" },
//     ],
//   },
// ];

// export const dashboardFooterNav: NavItem[] = [
//   {
//     label: "មតិកែលម្អផ្សព្វផ្សាយទីផ្សារ",
//     href: "/dashboard/feedback",
//     icon: Globe,
//   },
// ];

// export const dashboardBottomNav: NavItem[] = [
//   {
//     label: "ការកំណត់",
//     href: "/dashboard/settings",
//     icon: Settings,
//   },
// ];

// /**
//  * Flattened lookup: href -> label, built from ALL nav sources
//  * (top-level items, children, footer, bottom).
//  * This is what the dynamic [...slug] route uses to render a
//  * page automatically for any href you add above — no manual
//  * page.tsx needed per route.
//  */
// function flatten(items: NavItem[]) {
//   const map: Record<string, string> = {};
//   for (const item of items) {
//     if (item.href) map[item.href] = item.label;
//     item.children?.forEach((c) => {
//       map[c.href] = c.label;
//     });
//   }
//   return map;
// }

// export const navRouteMap: Record<string, string> = {
//   ...flatten(dashboardNav),
//   ...flatten(dashboardFooterNav),
//   ...flatten(dashboardBottomNav),
// };

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
  // {
  //   label: "អ្នកប្រើប្រាស់",
  //   icon: Users,
  //   children: [
  //     { label: "គណនីអតិថិជន", href: "/dashboard/users/customers" },
  //     { label: "គណនីម្ចាស់ហាង", href: "/dashboard/users/sellers" },
  //     { label: "ព័ត៌មានអ្នកប្រើប្រាស់", href: "/dashboard/users/info" },
  //   ],
  // },
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
    label: "មតិកែលម្អផ្សព្វផ្សាយទីផ្សារ",
    href: "/dashboard/feedback",
    icon: Globe,
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
