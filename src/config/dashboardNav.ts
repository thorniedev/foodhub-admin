import {
  LayoutGrid,
  Store,
  Users,
  Layers,
  Globe,
  SlidersHorizontal,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

export const dashboardNav: NavItem[] = [
  {
    label: "ផ្ទាំងគ្រប់គ្រង",
    icon: LayoutGrid,
    href: "/",
  },
  {
    label: "ហាង",
    icon: Store,
    href: "/shops",
  },
    {
    label: "ប្រភេទអាហារ",
    icon: Utensils,
    href: "/menu-items",
  },
  {
    label: "អ្នកប្រើប្រាស់",
    icon: Users,
    href: "/users",
  },
  {
    label: "ប្រភេទអាហារ",
    icon: Layers,
    children: [
      {
        label: "ចំណីអាហារ",
        href: "/food-types/dishes",
      },
      {
        label: "ភេសជ្ជៈ",
        href: "/food-types/drinks",
      },
      {
        label: "អាហាររូបត្ថម្ភ",
        href: "/food-types/nutritions",
      },
    ],
  },
  {
    label: "មាតិកាដែលប្រែប្រួល",
    icon: Globe,
    children: [
      {
        label: "រូបបេណឺ",
        href: "/dynamic-content/banners",
      },
      {
        label: "រូបអាហារតាមរដូវកាល",
        href: "/dynamic-content/food-by-season",
      },
      {
        label: "រូបអាហារតាមតំបន់",
        href: "/dynamic-content/food-by-area",
      },
      {
        label: "មតិកែលម្អ",
        href: "/dynamic-content/feedback",
      },
    ],
  },
  {
    label: "ស្លាកត្រង",
    icon: SlidersHorizontal,
    children: [
      {
        label: "ប្រភេទម្ហូប",
        href: "/filter-tags/food-categories",
      },
      {
        label: "ម្ហូបតាមប្រទេស",
        href: "/filter-tags/cuisines",
      },
      {
        label: "ពេលទទួលទាន",
        href: "/filter-tags/meal-times",
      },
      {
        label: "របបអាហារ",
        href: "/filter/dietary-type",
      },
      {
        label: "ក្រុមអាយុ",
        href: "/filter-tags/age-groups",
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
        label: "កម្រិតហឹរ",
        href: "/filter-tags/spice-levels",
      },
      {
        label: "ពេលចម្អិន",
        href: "/filter-tags/preparation-times",
      },
      {
        label: "ចម្ងាយ",
        href: "/filter-tags/distances",
      },
      {
        label: "វិធីចម្អិន",
        href: "/filter-tags/cooking-methods",
      },
      {
        label: "លក្ខណៈម្ហូប",
        href: "/filter-tags/food-styles",
      },
      {
        label: "គោលដៅសុខភាព",
        href: "/filter-tags/health-goals",
      },
      {
        label: "តំបន់",
        href: "/filter-tags/regions",
      },
      {
        label: "រសជាតិ",
        href: "/filter-tags/tastes",
      },
      {
        label: "វាយនភាព",
        href: "/filter-tags/textures",
      },
      {
        label: "គ្រឿងផ្សំ",
        href: "/filter-tags/ingredients",
      },
      {
        label: "សារធាតុចិញ្ចឹម",
        href: "/filter-tags/nutrition",
      },
      {
        label: "តម្លៃ",
        href: "/filter-tags/price-levels",
      },
      {
        label: "ការវាយតម្លៃ",
        href: "/filter-tags/ratings",
      },
      {
        label: "កម្រិតណែនាំ AI",
        href: "/filter-tags/ai-scores",
      },
    ],
  },
];
