import {
  LayoutGrid,
  Store,
  Users,
  Layers,
  Globe,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

export const dashboardNav: NavItem[] = [
  { label: "ផ្ទាំងគ្រប់គ្រង", icon: LayoutGrid, href: "/" },
  { label: "ហាង", icon: Store, href: "/shops" },
  { label: "អ្នកប្រើប្រាស់", icon: Users, href: "/users" },
  {
    label: "ប្រភេទអាហារ",
    icon: Layers,
    children: [
      { label: "ចំណីអាហារ", href: "/food-types/dishes" },
      { label: "ភេសជ្ជៈ", href: "/food-types/drinks" },
    ],
  },
  {
    label: "មាតិកាដែលប្រែប្រួល",
    icon: Globe,
    children: [
      { label: "រូបបេណឺ", href: "/dynamic-content/banners" },
      { label: "ស្លាកត្រង", href: "/dynamic-content/filters" },
      { label: "រូបអាហារតាមរដូវកាល", href: "/dynamic-content/food-by-season" },
      { label: "រូបអាហារតាមតំបន់", href: "/dynamic-content/food-by-area" },
    ],
  },
];