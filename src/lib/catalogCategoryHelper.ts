import type { FoodCategoryOption } from "@/src/types/menu-management";

export const DRINK_KEYWORDS = [
  "drink",
  "beverage",
  "coffee",
  "tea",
  "juice",
  "smoothie",
  "soda",
  "cocktail",
  "beer",
  "wine",
  "water",
  "milk",
  "shake",
  "boba",
  "ភេសជ្ជៈ",
  "កាហ្វេ",
  "តែ",
  "ទឹកផ្លែឈើ",
  "ទឹកក្រឡុក",
  "ទឹកដោះគោ",
];

export function isDrinkCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  if (!category) return false;

  // 1. Check direct parent category name
  const parentName = (category.parentCategoryName ?? "").toLowerCase().trim();
  if (parentName) {
    if (DRINK_KEYWORDS.some((kw) => parentName.includes(kw))) {
      return true;
    }
  }

  // 2. Check parent category object if parentCategoryUuid is set
  if (category.parentCategoryUuid) {
    const parent = allCategories.find((c) => c.uuid === category.parentCategoryUuid);
    if (parent) {
      const pName = (parent.name ?? "").toLowerCase();
      const pCode = (parent.code ?? "").toLowerCase();
      if (DRINK_KEYWORDS.some((kw) => pName.includes(kw) || pCode.includes(kw))) {
        return true;
      }
    }
  }

  // 3. Check category own name and code
  const name = (category.name ?? "").toLowerCase().trim();
  const code = (category.code ?? "").toLowerCase().trim();

  return DRINK_KEYWORDS.some((kw) => name.includes(kw) || code.includes(kw));
}

export function isFoodCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  return !isDrinkCategory(category, allCategories);
}
