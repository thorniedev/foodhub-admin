import React from "react";
import Image from "next/image";
import {
  ClipboardList,
  LayoutGrid,
  Store,
  Users,
  Layers,
  Globe,
  SlidersHorizontal,
  Utensils,
  Bot,
  type LucideIcon,
} from "lucide-react";

export const AiRecommendationIcon: React.FC<{
  size?: number | string;
  className?: string;
}> = ({ size = 20, className = "" }) => {
  const s = Number(size) || 20;
  return React.createElement(Image, {
    src: "/Image/ai-recommendation.png",
    alt: "AI",
    width: s,
    height: s,
    className: `object-contain shrink-0 ${className}`,
  });
};

export interface NavItem {
  label: string;
  href?: string;
  icon?: LucideIcon | React.ComponentType<{ size?: number | string; className?: string }>;
  children?: NavItem[];
  requiredRole?: string;
}

export const dashboardNav: NavItem[] = [
  {
    label: "ផ្ទាំងគ្រប់គ្រង",
    icon: LayoutGrid,
    href: "/",
  },
  {
    label: "អនុសាសន៍ & សវនកម្ម AI",
    icon: Bot,
    href: "/admin/recommendations",
  },
  {
    label: "កំណត់ត្រាសវនកម្ម",
    icon: ClipboardList,
    href: "/audit-logs",
    requiredRole: "SUPER_ADMIN",
  },

  {
    label: "ហាង",
    icon: Store,
    href: "/shops",
  },
  {
    label: "ម៉ឺនុយ",
    icon: Utensils,
    href: "/menu-items",
  },
  {
    label: "អ្នកប្រើប្រាស់",
    icon: Users,
    href: "/users",
  },
  {
    label: "ម្ហូបអាហារ",
    icon: Layers,
    children: [
      {
        label: "ម្ហូប",
        href: "/food-catalog/foods",
      },
      {
        label: "ភេសជ្ជៈ",
        href: "/food-catalog/drinks",
      },
    ],
  },
  // {
  //   label: "ប្រភេទអាហារ",
  //   icon: Layers,
  //   children: [
  //     {
  //       label: "ចំណីអាហារ",
  //       href: "/food-types/dishes",
  //     },
  //     {
  //       label: "ភេសជ្ជៈ",
  //       href: "/food-types/drinks",
  //     },
  //     {
  //       label: "អាហាររូបត្ថម្ភ",
  //       href: "/food-types/nutritions",
  //     },
  //   ],
  // },
  {
    label: "មាតិកាដែលប្រែប្រួល",
    icon: Globe,
    children: [
      {
        label: "រូបបេណឺ",
        href: "/dynamic-content/banners",
      },
      // {
      //   label: "មតិកែលម្អ",
      //   href: "/dynamic-content/feedback",
      // },
    ],
  },
  {
    label: "ចម្រោះទិន្នន័យ",
    icon: SlidersHorizontal,
    children: [
      {
        label: "ប្រភេទម្ហូប",
        href: "/filter/food-categories",
      },
      {
        label: "ប្រភេទភេសជ្ជៈ",
        href: "/filter/drink-categories",
      },
      {
        label: "ម្ហូបតាមប្រទេស",
        href: "/filter/cuisines",
      },
      {
        label: "ពេលទទួលទាន",
        href: "/filter/meal-times",
      },
      {
        label: "របបអាហារ",
        href: "/filter/dietary-type",
      },
      {
        label: "ក្រុមអាយុ",
        href: "/filter/age-groups",
      },
      {
        label: "អាឡែស៊ី",
        href: "/filter/allergic",
      },
      {
        label: "ស្ថានភាពសុខភាព",
        href: "/filter/medical-conditions",
      },

      {
        label: "គ្រឿងផ្សំ",
        href: "/filter/ingredients",
      },
      {
        label: "រដូវកាល",
        href: "/filter/seasons",
      },
      {
        label: "ព្រឹត្តិការណ៍ / បុណ្យទាន",
        href: "/filter/events",
      },
      {
        label: "ស្ថានភាពអាកាសធាតុ",
        href: "/filter/weather-conditions",
      },
    ],
  },
];
