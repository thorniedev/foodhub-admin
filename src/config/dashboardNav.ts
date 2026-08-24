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
    label: "មីនុយ",
    icon: Utensils,
    href: "/menu-items",
  },
  {
    label: "គណនីអ្នកប្រើប្រាស់",
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
    label: "ចម្រោះទិន្នន័យ",
    icon: SlidersHorizontal,
    children: [
      {
        label: "អនុប្រភេទម្ហូប",
        href: "/filter/food-categories",
      },
      {
        label: "អនុប្រភេទភេសជ្ជៈ",
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
        label: "ពេលចម្អិន",
        href: "/filter/preparation-times",
      },
      {
        label: "ចម្ងាយ",
        href: "/filter/distances",
      },
      {
        label: "តំបន់",
        href: "/filter/regions",
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
