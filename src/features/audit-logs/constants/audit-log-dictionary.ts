import { ActionCodeMetadata, BadgeColor, EntityType } from "../types/audit-log.types";

export interface EntityTypeConfig {
  type: EntityType;
  label: string;
  badgeClass: string;
  iconName: string;
  description: string;
}

export const ENTITY_TYPE_CONFIGS: Record<EntityType, EntityTypeConfig> = {
  STORE: {
    type: "STORE",
    label: "Store",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    iconName: "Store",
    description: "Store profile, hours, location, and account status",
  },
  FOOD: {
    type: "FOOD",
    label: "Food Dish",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconName: "Utensils",
    description: "Food menu dish, ingredients, and tags",
  },
  FOOD_CATEGORY: {
    type: "FOOD_CATEGORY",
    label: "Food Category",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    iconName: "Layers",
    description: "Classification categories for food items",
  },
  CUISINE: {
    type: "CUISINE",
    label: "Cuisine",
    badgeClass: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    iconName: "Globe",
    description: "Cuisine country and cultural origin",
  },
  INGREDIENT: {
    type: "INGREDIENT",
    label: "Ingredient",
    badgeClass: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    iconName: "Wheat",
    description: "Raw ingredients and recipe components",
  },
  ALLERGEN: {
    type: "ALLERGEN",
    label: "Allergen",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    iconName: "ShieldAlert",
    description: "Food allergen safety entries",
  },
  DIETARY_TYPE: {
    type: "DIETARY_TYPE",
    label: "Dietary Type",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    iconName: "Leaf",
    description: "Dietary preferences (Vegan, Halal, Kosher, etc.)",
  },
  MEDICAL_CONDITION: {
    type: "MEDICAL_CONDITION",
    label: "Medical Condition",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    iconName: "HeartPulse",
    description: "Health constraints and medical safety diets",
  },
};

export const ACTION_CODE_DICTIONARY: Record<string, ActionCodeMetadata> = {
  // STORE
  STORE_CREATED: {
    code: "STORE_CREATED",
    entityType: "STORE",
    color: "blue",
    label: "Store Created",
    description: "New store registered / submitted",
  },
  STORE_APPROVED: {
    code: "STORE_APPROVED",
    entityType: "STORE",
    color: "green",
    label: "Store Approved",
    description: "Store approved by admin",
  },
  STORE_REJECTED: {
    code: "STORE_REJECTED",
    entityType: "STORE",
    color: "red",
    label: "Store Rejected",
    description: "Store rejected by admin",
  },
  STORE_UPDATED: {
    code: "STORE_UPDATED",
    entityType: "STORE",
    color: "blue",
    label: "Store Updated",
    description: "Store profile / details updated",
  },
  STORE_ACCOUNT_STATUS_UPDATED: {
    code: "STORE_ACCOUNT_STATUS_UPDATED",
    entityType: "STORE",
    color: "amber",
    label: "Account Status Updated",
    description: "Store account suspended / reactivated",
  },
  STORE_OPERATING_STATUS_UPDATED: {
    code: "STORE_OPERATING_STATUS_UPDATED",
    entityType: "STORE",
    color: "amber",
    label: "Operating Status Updated",
    description: "Store operating status updated (Open/Closed)",
  },
  STORE_HOURS_UPDATED: {
    code: "STORE_HOURS_UPDATED",
    entityType: "STORE",
    color: "blue",
    label: "Store Hours Updated",
    description: "Store business hours changed",
  },
  STORE_MEDIA_UPDATED: {
    code: "STORE_MEDIA_UPDATED",
    entityType: "STORE",
    color: "purple",
    label: "Store Media Updated",
    description: "Store logo / cover photo modified",
  },
  STORE_LOCATION_UPDATED: {
    code: "STORE_LOCATION_UPDATED",
    entityType: "STORE",
    color: "cyan",
    label: "Store Location Updated",
    description: "Store location / GPS coordinates adjusted",
  },
  STORE_DELETED: {
    code: "STORE_DELETED",
    entityType: "STORE",
    color: "red",
    label: "Store Deleted",
    description: "Store soft deleted",
  },

  // FOOD
  FOOD_CREATED: {
    code: "FOOD_CREATED",
    entityType: "FOOD",
    color: "blue",
    label: "Food Created",
    description: "New canonical food added",
  },
  FOOD_UPDATED: {
    code: "FOOD_UPDATED",
    entityType: "FOOD",
    color: "blue",
    label: "Food Updated",
    description: "Food details / tags updated",
  },
  FOOD_ACTIVATED: {
    code: "FOOD_ACTIVATED",
    entityType: "FOOD",
    color: "green",
    label: "Food Activated",
    description: "Food activated in catalog",
  },
  FOOD_DEACTIVATED: {
    code: "FOOD_DEACTIVATED",
    entityType: "FOOD",
    color: "red",
    label: "Food Deactivated",
    description: "Food deactivated from catalog",
  },

  // FOOD_CATEGORY
  FOOD_CATEGORY_CREATED: {
    code: "FOOD_CATEGORY_CREATED",
    entityType: "FOOD_CATEGORY",
    color: "blue",
    label: "Category Created",
    description: "Category created",
  },
  FOOD_CATEGORY_UPDATED: {
    code: "FOOD_CATEGORY_UPDATED",
    entityType: "FOOD_CATEGORY",
    color: "blue",
    label: "Category Updated",
    description: "Category updated",
  },
  FOOD_CATEGORY_ACTIVATED: {
    code: "FOOD_CATEGORY_ACTIVATED",
    entityType: "FOOD_CATEGORY",
    color: "green",
    label: "Category Activated",
    description: "Category activated",
  },
  FOOD_CATEGORY_DEACTIVATED: {
    code: "FOOD_CATEGORY_DEACTIVATED",
    entityType: "FOOD_CATEGORY",
    color: "red",
    label: "Category Deactivated",
    description: "Category deactivated",
  },

  // CUISINE
  CUISINE_CREATED: {
    code: "CUISINE_CREATED",
    entityType: "CUISINE",
    color: "blue",
    label: "Cuisine Created",
    description: "Cuisine created",
  },
  CUISINE_UPDATED: {
    code: "CUISINE_UPDATED",
    entityType: "CUISINE",
    color: "blue",
    label: "Cuisine Updated",
    description: "Cuisine updated",
  },
  CUISINE_ACTIVATED: {
    code: "CUISINE_ACTIVATED",
    entityType: "CUISINE",
    color: "green",
    label: "Cuisine Activated",
    description: "Cuisine activated",
  },
  CUISINE_DEACTIVATED: {
    code: "CUISINE_DEACTIVATED",
    entityType: "CUISINE",
    color: "red",
    label: "Cuisine Deactivated",
    description: "Cuisine deactivated",
  },

  // INGREDIENT
  INGREDIENT_CREATED: {
    code: "INGREDIENT_CREATED",
    entityType: "INGREDIENT",
    color: "blue",
    label: "Ingredient Created",
    description: "Ingredient created",
  },
  INGREDIENT_UPDATED: {
    code: "INGREDIENT_UPDATED",
    entityType: "INGREDIENT",
    color: "blue",
    label: "Ingredient Updated",
    description: "Ingredient updated",
  },
  INGREDIENT_ACTIVATED: {
    code: "INGREDIENT_ACTIVATED",
    entityType: "INGREDIENT",
    color: "green",
    label: "Ingredient Activated",
    description: "Ingredient activated",
  },
  INGREDIENT_DEACTIVATED: {
    code: "INGREDIENT_DEACTIVATED",
    entityType: "INGREDIENT",
    color: "red",
    label: "Ingredient Deactivated",
    description: "Ingredient deactivated",
  },

  // ALLERGEN
  ALLERGEN_CREATED: {
    code: "ALLERGEN_CREATED",
    entityType: "ALLERGEN",
    color: "blue",
    label: "Allergen Created",
    description: "Allergen dictionary item created",
  },
  ALLERGEN_UPDATED: {
    code: "ALLERGEN_UPDATED",
    entityType: "ALLERGEN",
    color: "blue",
    label: "Allergen Updated",
    description: "Allergen modified",
  },
  ALLERGEN_ACTIVATED: {
    code: "ALLERGEN_ACTIVATED",
    entityType: "ALLERGEN",
    color: "green",
    label: "Allergen Activated",
    description: "Allergen restored / activated",
  },
  ALLERGEN_DEACTIVATED: {
    code: "ALLERGEN_DEACTIVATED",
    entityType: "ALLERGEN",
    color: "amber",
    label: "Allergen Deactivated",
    description: "Allergen deactivated",
  },
  ALLERGEN_DELETED: {
    code: "ALLERGEN_DELETED",
    entityType: "ALLERGEN",
    color: "red",
    label: "Allergen Deleted",
    description: "Allergen permanently deleted",
  },

  // DIETARY_TYPE
  DIETARY_TYPE_CREATED: {
    code: "DIETARY_TYPE_CREATED",
    entityType: "DIETARY_TYPE",
    color: "blue",
    label: "Dietary Type Created",
    description: "Dietary type created",
  },
  DIETARY_TYPE_UPDATED: {
    code: "DIETARY_TYPE_UPDATED",
    entityType: "DIETARY_TYPE",
    color: "blue",
    label: "Dietary Type Updated",
    description: "Dietary type modified",
  },
  DIETARY_TYPE_ACTIVATED: {
    code: "DIETARY_TYPE_ACTIVATED",
    entityType: "DIETARY_TYPE",
    color: "green",
    label: "Dietary Type Activated",
    description: "Dietary type restored / activated",
  },
  DIETARY_TYPE_DEACTIVATED: {
    code: "DIETARY_TYPE_DEACTIVATED",
    entityType: "DIETARY_TYPE",
    color: "amber",
    label: "Dietary Type Deactivated",
    description: "Dietary type deactivated",
  },
  DIETARY_TYPE_DELETED: {
    code: "DIETARY_TYPE_DELETED",
    entityType: "DIETARY_TYPE",
    color: "red",
    label: "Dietary Type Deleted",
    description: "Dietary type permanently deleted",
  },

  // MEDICAL_CONDITION
  MEDICAL_CONDITION_CREATED: {
    code: "MEDICAL_CONDITION_CREATED",
    entityType: "MEDICAL_CONDITION",
    color: "blue",
    label: "Condition Created",
    description: "Medical condition created",
  },
  MEDICAL_CONDITION_UPDATED: {
    code: "MEDICAL_CONDITION_UPDATED",
    entityType: "MEDICAL_CONDITION",
    color: "blue",
    label: "Condition Updated",
    description: "Medical condition modified",
  },
  MEDICAL_CONDITION_ACTIVATED: {
    code: "MEDICAL_CONDITION_ACTIVATED",
    entityType: "MEDICAL_CONDITION",
    color: "green",
    label: "Condition Activated",
    description: "Medical condition restored",
  },
  MEDICAL_CONDITION_DEACTIVATED: {
    code: "MEDICAL_CONDITION_DEACTIVATED",
    entityType: "MEDICAL_CONDITION",
    color: "amber",
    label: "Condition Deactivated",
    description: "Medical condition deactivated",
  },
  MEDICAL_CONDITION_DELETED: {
    code: "MEDICAL_CONDITION_DELETED",
    entityType: "MEDICAL_CONDITION",
    color: "red",
    label: "Condition Deleted",
    description: "Medical condition permanently deleted",
  },
};

export const BADGE_COLOR_STYLES: Record<BadgeColor, { bg: string; text: string; border: string; dot: string }> = {
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  red: {
    bg: "bg-rose-50 dark:bg-rose-950/60",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/60",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/60",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    dot: "bg-cyan-500",
  },
};

/**
 * Fallback action code metadata generator for unknown or custom backend action codes.
 */
export function getActionMetadata(
  actionCode: string,
  entityType?: string,
): ActionCodeMetadata {
  if (ACTION_CODE_DICTIONARY[actionCode]) {
    return ACTION_CODE_DICTIONARY[actionCode];
  }

  // Heuristic color assignment for unlisted action codes
  let color: BadgeColor = "blue";
  const upper = (actionCode || "").toUpperCase();

  if (
    upper.endsWith("_CREATED") ||
    upper.endsWith("_APPROVED") ||
    upper.endsWith("_ACTIVATED") ||
    upper.endsWith("_RESTORED")
  ) {
    color = "green";
  } else if (
    upper.endsWith("_DEACTIVATED") ||
    upper.endsWith("_STATUS_UPDATED") ||
    upper.endsWith("_HOURS_UPDATED")
  ) {
    color = "amber";
  } else if (
    upper.endsWith("_REJECTED") ||
    upper.endsWith("_DELETED") ||
    upper.endsWith("_REMOVED")
  ) {
    color = "red";
  } else if (upper.includes("_MEDIA_")) {
    color = "purple";
  } else if (upper.includes("_LOCATION_")) {
    color = "cyan";
  }

  // Format label from SNAKE_CASE
  const formattedLabel = upper
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  return {
    code: actionCode,
    entityType: (entityType as EntityType) || "STORE",
    color,
    label: formattedLabel || actionCode,
    description: `Action ${actionCode}`,
  };
}

export function getActionsForEntityType(entityType?: string): ActionCodeMetadata[] {
  if (!entityType || entityType === "ALL") {
    return Object.values(ACTION_CODE_DICTIONARY);
  }
  return Object.values(ACTION_CODE_DICTIONARY).filter(
    (item) => item.entityType === entityType,
  );
}
