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

  // Direct Root UUID checks
  if (
    category.parentCategoryUuid === "172b3ccf-9edd-4ef6-8a03-6af40bf6ba83" ||
    category.uuid === "172b3ccf-9edd-4ef6-8a03-6af40bf6ba83"
  ) {
    return true;
  }
  if (
    category.parentCategoryUuid === "834c39dc-67df-4544-a48d-816103115631" ||
    category.uuid === "834c39dc-67df-4544-a48d-816103115631"
  ) {
    return false;
  }

  // Check parent category name
  const parentName = (category.parentCategoryName ?? "").toLowerCase().trim();
  if (parentName) {
    if (parentName.includes("ភេសជ្ជៈ") || DRINK_KEYWORDS.some((kw) => parentName.includes(kw))) {
      return true;
    }
    if (parentName.includes("ម្ហូប") || parentName.includes("អាហារ")) {
      return false;
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

/**
 * Direct children of the category whose Khmer-normalized name exactly
 * matches `parentName` (e.g. the "ម្ហូបអាហារ" parent for the Create Food
 * form's category dropdown). Unlike isFoodSubCategory/isDrinkSubCategory,
 * this does not fall back to the DRINK_KEYWORDS heuristic — it only returns
 * categories actually declared under that named parent.
 */
export function findSubCategoriesByParentName(
  allCategories: FoodCategoryOption[],
  parentName: string,
): FoodCategoryOption[] {
  const target = extractKhmerOnlyName(parentName).trim();
  if (!target) return [];

  const parent = allCategories.find(
    (category) => extractKhmerOnlyName(category.name).trim() === target,
  );
  if (!parent) return [];

  return allCategories.filter(
    (category) => category.parentCategoryUuid === parent.uuid,
  );
}
