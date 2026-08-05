import { MenuItem } from "../types/menuItem";

// GAP: no drink example exists in the sample data. This regex is a guess —
// replace with your real drink category codes once known.
const DRINK_CATEGORY_PATTERN = /DRINK|BEVERAGE|COFFEE|TEA|JUICE/i;

export function isDrinkItem(item: MenuItem): boolean {
  return DRINK_CATEGORY_PATTERN.test(item.food.category.code);
}

export function isFoodItem(item: MenuItem): boolean {
  return !isDrinkItem(item);
}