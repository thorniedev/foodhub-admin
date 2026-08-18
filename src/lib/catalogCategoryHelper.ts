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

export function extractKhmerOnlyName(name: string): string {
  if (!name) return "";

  // 1. Remove text inside parentheses (e.g. "(Khmer Coffee)", "(Drink)", "(Food)")
  const withoutParens = name.replace(/\s*\([^)]*\)/g, "").trim();

  // 2. Extract Khmer character segments if present
  const khmerRegex = /[\u1780-\u17FF\u19E0-\u19FF\s&,]+/g;
  const khmerMatches = withoutParens.match(khmerRegex);
  if (khmerMatches && khmerMatches.length > 0) {
    const khmerText = khmerMatches.join(" ").replace(/\s+/g, " ").trim();
    if (khmerText.length > 0) {
      return khmerText;
    }
  }

  return withoutParens || name.trim();
}

export function isParentCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  if (!category) return false;

  // A category without parentCategoryUuid is a top-level parent
  if (!category.parentCategoryUuid) {
    return true;
  }

  const code = (category.code ?? "").toUpperCase().trim();
  if (code === "DRINK" || code === "FOOD" || code === "ROOT") {
    return true;
  }

  // If other categories declare this category as their parent
  const hasChildren = allCategories.some(
    (c) => c.uuid !== category.uuid && c.parentCategoryUuid === category.uuid,
  );
  if (hasChildren) {
    return true;
  }

  return false;
}

export function isSubCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  return !isParentCategory(category, allCategories);
}

export function isDrinkCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  if (!category) return false;

  const code = (category.code ?? "").toUpperCase().trim();
  if (code.startsWith("DRINK")) return true;
  if (code.startsWith("FOOD")) return false;

  // Check parent category name
  const parentName = (category.parentCategoryName ?? "").toLowerCase().trim();
  if (parentName) {
    if (DRINK_KEYWORDS.some((kw) => parentName.includes(kw))) {
      return true;
    }
  }

  // Check parent category object in list
  if (category.parentCategoryUuid) {
    const parent = allCategories.find((c) => c.uuid === category.parentCategoryUuid);
    if (parent) {
      const pName = (parent.name ?? "").toLowerCase();
      const pCode = (parent.code ?? "").toUpperCase();
      if (pCode.startsWith("DRINK") || DRINK_KEYWORDS.some((kw) => pName.includes(kw))) {
        return true;
      }
      if (pCode.startsWith("FOOD")) {
        return false;
      }
    }
  }

  const name = (category.name ?? "").toLowerCase().trim();
  return DRINK_KEYWORDS.some((kw) => name.includes(kw));
}

export function isFoodCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  return !isDrinkCategory(category, allCategories);
}

export function isDrinkSubCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  return isSubCategory(category, allCategories) && isDrinkCategory(category, allCategories);
}

export function isFoodSubCategory(
  category: FoodCategoryOption,
  allCategories: FoodCategoryOption[] = [],
): boolean {
  return isSubCategory(category, allCategories) && isFoodCategory(category, allCategories);
}
