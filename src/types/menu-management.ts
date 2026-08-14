// // export type AvailabilityStatus =
// //   | "AVAILABLE"
// //   | "UNAVAILABLE"
// //   | "SOLD_OUT"
// //   | "HIDDEN";

// // export type IngredientDataStatus =
// //   | "UNKNOWN"
// //   | "PARTIAL"
// //   | "COMPLETE"
// //   | "VERIFIED";

// // export type MenuItemSource =
// //   | "MANUAL"
// //   | "IMPORT"
// //   | "AI"
// //   | string;

// // export interface ApiPage<T> {
// //   content: T[];
// //   number: number;
// //   size: number;
// //   numberOfElements: number;
// //   totalElements: number;
// //   totalPages: number;
// //   first: boolean;
// //   last: boolean;
// //   empty: boolean;
// // }

// // export interface FoodCategoryOption {
// //   uuid: string;
// //   code: string;
// //   name: string;
// //   parentCategoryUuid?: string | null;
// //   parentCategoryName?: string | null;
// //   isActive?: boolean;
// // }

// // export interface CuisineOption {
// //   uuid: string;
// //   code: string;
// //   name: string;
// //   description?: string | null;
// //   isActive?: boolean;
// // }

// // export interface IngredientOption {
// //   uuid: string;
// //   code: string;
// //   name: string;
// //   description?: string | null;
// //   isActive?: boolean;
// // }

// // export interface StoreOption {
// //   id?: number;
// //   uuid: string;
// //   storeName?: string | null;
// //   name?: string | null;
// //   localName?: string | null;
// //   city?: string | null;
// //   province?: string | null;
// //   accountStatus?: string | null;
// //   reviewStatus?: string | null;
// // }

// // export interface NutritionData {
// //   calories?: number | null;
// //   protein?: number | null;
// //   proteinGrams?: number | null;
// //   carbohydrate?: number | null;
// //   carbsGrams?: number | null;
// //   fat?: number | null;
// //   fatGrams?: number | null;
// // }

// // export interface FoodRecord {
// //   id?: number;
// //   uuid: string;
// //   canonicalName: string;
// //   localName?: string | null;
// //   name?: string | null;
// //   description?: string | null;

// //   categoryUuid?: string | null;
// //   categoryName?: string | null;
// //   category?: {
// //     uuid?: string;
// //     code?: string;
// //     name?: string;
// //   } | null;

// //   cuisineUuid?: string | null;
// //   cuisineName?: string | null;
// //   cuisine?: {
// //     uuid?: string;
// //     code?: string;
// //     name?: string;
// //   } | null;

// //   defaultSpiceLevel?: number | null;
// //   nutritionData?: NutritionData | null;

// //   primaryMediaUuids?: string[];
// //   primaryMediaUrls?: string[];
// //   gallery?: string[];
// //   thumbnail?: string | null;
// //   imageUrl?: string | null;

// //   mealTypes?: unknown[];
// //   ageRules?: unknown[];
// //   dietaryTypes?: unknown[];
// //   seasons?: unknown[];
// //   events?: unknown[];
// //   suitableWeather?: unknown[];

// //   isActive?: boolean;
// //   createdAt?: string | null;
// //   updatedAt?: string | null;
// // }

// // export interface MenuItemIngredientPayload {
// //   ingredientUuid: string;
// //   quantity?: number | null;
// //   unit?: string | null;
// //   isOptional: boolean;
// //   notes?: string | null;
// // }

// // export interface MenuItemIngredientRecord {
// //   uuid?: string;
// //   ingredientUuid?: string;
// //   code?: string;
// //   name?: string;
// //   quantity?: number | null;
// //   unit?: string | null;
// //   isOptional?: boolean;
// //   notes?: string | null;
// // }

// // export interface MenuItemRecord {
// //   id?: number;
// //   uuid: string;
// //   name: string;
// //   localName?: string | null;
// //   description?: string | null;

// //   price?: number | null;
// //   currencyCode?: string | null;
// //   preparationTimeMinutes?: number | null;
// //   availabilityStatus?: AvailabilityStatus | string;
// //   ingredientDataStatus?: IngredientDataStatus | string;
// //   isFeatured?: boolean;
// //   source?: MenuItemSource;

// //   primaryMediaUuids?: string[];
// //   primaryMediaUrls?: string[];
// //   gallery?: string[];
// //   thumbnail?: string | null;
// //   imageUrl?: string | null;

// //   storeUuid?: string | null;
// //   foodUuid?: string | null;

// //   store?: {
// //     id?: number;
// //     uuid?: string;
// //     name?: string | null;
// //     storeName?: string | null;
// //     localName?: string | null;
// //     city?: string | null;
// //     province?: string | null;
// //   } | null;

// //   food?: FoodRecord | null;

// //   ingredients?: MenuItemIngredientRecord[];
// //   dietaryTypes?: unknown[];
// //   allergenDeclarations?: unknown[];

// //   createdAt?: string | null;
// //   updatedAt?: string | null;
// // }

// // export interface FoodWritePayload {
// //   canonicalName: string;
// //   localName?: string | null;
// //   description?: string | null;
// //   categoryUuid: string;
// //   cuisineUuid?: string | null;
// //   primaryMediaUuids: string[];
// //   defaultSpiceLevel?: number | null;
// //   nutritionData?: NutritionData | null;
// //   mealTypes: unknown[];
// //   ageRules: unknown[];
// //   dietaryTypes?: unknown[];
// //   seasons?: unknown[];
// //   events?: unknown[];
// //   suitableWeather?: unknown[];
// //   isActive: boolean;
// // }

// // export interface MenuItemWritePayload {
// //   foodUuid: string;

// //   menuItem: {
// //     name: string;
// //     description?: string | null;
// //     price: number;
// //     currencyCode: string;
// //     preparationTimeMinutes?: number | null;
// //     availabilityStatus: AvailabilityStatus | string;
// //     ingredientDataStatus: IngredientDataStatus | string;
// //     isFeatured: boolean;
// //     source: MenuItemSource;
// //   };

// //   primaryMediaUuids?: string[];
// //   ingredients: MenuItemIngredientPayload[];
// //   dietaryTypes: unknown[];
// //   allergenDeclarations: unknown[];
// // }

// // export interface ListParams {
// //   page?: number;
// //   size?: number;
// //   sort?: string;
// //   query?: string;
// // }

// // export interface PublicMenuItemListParams extends ListParams {
// //   rootCategoryCode?: string;
// //   storeUuid?: string;
// //   foodUuid?: string;
// //   availabilityStatus?: string;
// //   featured?: boolean;
// // }


// export type AvailabilityStatus =
//   | "AVAILABLE"
//   | "UNAVAILABLE"
//   | "SOLD_OUT"
//   | "HIDDEN";

// export type IngredientDataStatus =
//   | "UNKNOWN"
//   | "PARTIAL"
//   | "COMPLETE"
//   | "VERIFIED";

// export type MenuItemSource =
//   | "MANUAL"
//   | "IMPORT"
//   | "AI"
//   | string;

// export interface ApiPage<T> {
//   content: T[];
//   number: number;
//   size: number;
//   numberOfElements: number;
//   totalElements: number;
//   totalPages: number;
//   first: boolean;
//   last: boolean;
//   empty: boolean;
// }

// export interface FoodCategoryOption {
//   uuid: string;
//   code: string;
//   name: string;
//   parentCategoryUuid?: string | null;
//   parentCategoryName?: string | null;
//   isActive?: boolean;
// }

// export interface CuisineOption {
//   uuid: string;
//   code: string;
//   name: string;
//   description?: string | null;
//   isActive?: boolean;
// }

// export interface IngredientOption {
//   uuid: string;
//   code: string;
//   name: string;
//   description?: string | null;
//   isActive?: boolean;
// }

// export interface StoreOption {
//   id?: number;
//   uuid: string;
//   storeName?: string | null;
//   name?: string | null;
//   localName?: string | null;
//   city?: string | null;
//   province?: string | null;
//   accountStatus?: string | null;
//   reviewStatus?: string | null;
// }

// export interface NutritionData {
//   calories?: number | null;
//   protein?: number | null;
//   proteinGrams?: number | null;
//   carbohydrate?: number | null;
//   carbsGrams?: number | null;
//   fat?: number | null;
//   fatGrams?: number | null;
// }

// export interface FoodRecord {
//   id?: number;
//   uuid: string;
//   canonicalName: string;
//   localName?: string | null;
//   name?: string | null;
//   description?: string | null;

//   categoryUuid?: string | null;
//   categoryName?: string | null;
//   category?: {
//     uuid?: string;
//     code?: string;
//     name?: string;
//   } | null;

//   cuisineUuid?: string | null;
//   cuisineName?: string | null;
//   cuisine?: {
//     uuid?: string;
//     code?: string;
//     name?: string;
//   } | null;

//   defaultSpiceLevel?: number | null;
//   nutritionData?: NutritionData | null;

//   primaryMediaUuids?: string[];
//   primaryMediaUrls?: string[];
//   gallery?: string[];
//   thumbnail?: string | null;
//   imageUrl?: string | null;

//   mealTypes?: unknown[];
//   ageRules?: unknown[];
//   dietaryTypes?: unknown[];
//   seasons?: unknown[];
//   events?: unknown[];
//   suitableWeather?: unknown[];

//   isActive?: boolean;
//   createdAt?: string | null;
//   updatedAt?: string | null;
// }

// export interface MenuItemIngredientPayload {
//   ingredientUuid: string;
//   quantity?: number | null;
//   unit?: string | null;
//   isOptional: boolean;
//   notes?: string | null;
// }

// export interface MenuItemIngredientRecord {
//   uuid?: string;
//   ingredientUuid?: string;
//   code?: string;
//   name?: string;
//   quantity?: number | null;
//   unit?: string | null;
//   isOptional?: boolean;
//   notes?: string | null;
// }

// export interface MenuItemRecord {
//   id?: number;
//   uuid: string;
//   name: string;
//   localName?: string | null;
//   description?: string | null;

//   price?: number | null;
//   currencyCode?: string | null;
//   preparationTimeMinutes?: number | null;
//   availabilityStatus?: AvailabilityStatus | string;
//   ingredientDataStatus?: IngredientDataStatus | string;
//   isFeatured?: boolean;
//   source?: MenuItemSource;

//   primaryMediaUuids?: string[];
//   primaryMediaUrls?: string[];
//   gallery?: string[];
//   thumbnail?: string | null;
//   imageUrl?: string | null;

//   storeUuid?: string | null;
//   foodUuid?: string | null;

//   store?: {
//     id?: number;
//     uuid?: string;
//     name?: string | null;
//     storeName?: string | null;
//     localName?: string | null;
//     city?: string | null;
//     province?: string | null;
//   } | null;

//   food?: FoodRecord | null;

//   ingredients?: MenuItemIngredientRecord[];
//   dietaryTypes?: unknown[];
//   allergenDeclarations?: unknown[];

//   createdAt?: string | null;
//   updatedAt?: string | null;
// }

// export interface FoodWritePayload {
//   canonicalName: string;
//   localName?: string | null;
//   description?: string | null;
//   categoryUuid: string;
//   cuisineUuid?: string | null;
//   primaryMediaUuids: string[];
//   defaultSpiceLevel?: number | null;
//   nutritionData?: NutritionData | null;
//   mealTypes: unknown[];
//   ageRules: unknown[];
//   dietaryTypes?: unknown[];
//   seasons?: unknown[];
//   events?: unknown[];
//   suitableWeather?: unknown[];
//   isActive: boolean;
// }

// export interface MenuItemWritePayload {
//   foodUuid: string;

//   menuItem: {
//     name: string;
//     description?: string | null;
//     price: number;
//     currencyCode: string;
//     preparationTimeMinutes?: number | null;
//     availabilityStatus: AvailabilityStatus | string;
//     ingredientDataStatus: IngredientDataStatus | string;
//     isFeatured: boolean;
//     source: MenuItemSource;
//   };

//   primaryMediaUuids?: string[];
//   ingredients: MenuItemIngredientPayload[];
//   dietaryTypes: unknown[];
//   allergenDeclarations: unknown[];
// }

// export interface ListParams {
//   page?: number;
//   size?: number;
//   sort?: string;
//   query?: string;
// }

// export interface PublicMenuItemListParams extends ListParams {
//   rootCategoryCode?: string;
//   storeUuid?: string;
//   foodUuid?: string;
//   availabilityStatus?: string;
//   featured?: boolean;
// }
export type AvailabilityStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "SOLD_OUT"
  | "HIDDEN";

export type IngredientDataStatus =
  | "UNKNOWN"
  | "PARTIAL"
  | "COMPLETE"
  | "VERIFIED";

export type MenuItemSource =
  | "MANUAL"
  | "IMPORT"
  | "AI"
  | string;

export interface ApiPage<T> {
  content: T[];
  number: number;
  size: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface FoodCategoryOption {
  uuid: string;
  code: string;
  name: string;
  parentCategoryUuid?: string | null;
  parentCategoryName?: string | null;
  isActive?: boolean;
}

export interface CuisineOption {
  uuid: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface IngredientOption {
  uuid: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface StoreOption {
  id?: number;
  uuid: string;
  storeName?: string | null;
  name?: string | null;
  localName?: string | null;
  city?: string | null;
  province?: string | null;
  accountStatus?: string | null;
  reviewStatus?: string | null;
}

export interface NutritionData {
  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
}

export interface FoodRecord {
  id?: number;
  uuid: string;
  canonicalName: string;
  localName?: string | null;
  name?: string | null;
  description?: string | null;

  categoryUuid?: string | null;
  categoryName?: string | null;
  category?: {
    uuid?: string;
    code?: string;
    name?: string;
  } | null;

  cuisineUuid?: string | null;
  cuisineName?: string | null;
  cuisine?: {
    uuid?: string;
    code?: string;
    name?: string;
  } | null;

  defaultSpiceLevel?: number | null;
  nutritionData?: NutritionData | null;

  primaryMediaUuids?: string[];
  primaryMediaUrls?: string[];
  gallery?: string[];
  thumbnail?: string | null;
  imageUrl?: string | null;

  mealTypes?: unknown[];
  ageRules?: unknown[];
  dietaryTypes?: unknown[];
  seasons?: unknown[];
  events?: unknown[];
  suitableWeather?: unknown[];

  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MenuItemIngredientPayload {
  ingredientUuid: string;
  quantity?: number | null;
  unit?: string | null;
  isOptional: boolean;
  notes?: string | null;
}

export interface MenuItemIngredientRecord {
  uuid?: string;
  ingredientUuid?: string;
  code?: string;
  name?: string;
  quantity?: number | null;
  unit?: string | null;
  isOptional?: boolean;
  notes?: string | null;
}

export interface MenuItemRecord {
  id?: number;
  uuid: string;
  name: string;
  localName?: string | null;
  description?: string | null;

  price?: number | null;
  currencyCode?: string | null;
  preparationTimeMinutes?: number | null;
  availabilityStatus?: AvailabilityStatus | string;
  ingredientDataStatus?: IngredientDataStatus | string;
  isFeatured?: boolean;
  source?: MenuItemSource;

  primaryMediaUuids?: string[];
  primaryMediaUrls?: string[];
  gallery?: string[];
  thumbnail?: string | null;
  imageUrl?: string | null;

  storeUuid?: string | null;
  foodUuid?: string | null;

  store?: {
    id?: number;
    uuid?: string;
    name?: string | null;
    storeName?: string | null;
    localName?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;

  food?: FoodRecord | null;

  ingredients?: MenuItemIngredientRecord[];
  dietaryTypes?: unknown[];
  allergenDeclarations?: unknown[];

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface FoodWritePayload {
  canonicalName: string;
  localName?: string | null;
  description?: string | null;
  categoryUuid: string;
  cuisineUuid?: string | null;
  primaryMediaUuids: string[];
  defaultSpiceLevel?: number | null;
  nutritionData?: NutritionData | null;
  mealTypes: unknown[];
  ageRules: unknown[];
  dietaryTypes?: unknown[];
  seasons?: unknown[];
  events?: unknown[];
  suitableWeather?: unknown[];
  isActive: boolean;
}

export interface MenuItemWritePayload {
  foodUuid: string;

  menuItem: {
    name: string;
    description?: string | null;
    price: number;
    currencyCode: string;
    preparationTimeMinutes?: number | null;
    availabilityStatus: AvailabilityStatus | string;
    ingredientDataStatus: IngredientDataStatus | string;
    isFeatured: boolean;
    source: MenuItemSource;
  };

  primaryMediaUuids?: string[];
  ingredients: MenuItemIngredientPayload[];
  dietaryTypes: unknown[];
  allergenDeclarations: unknown[];
}

export interface ListParams {
  page?: number;
  size?: number;
  sort?: string;
  query?: string;
}

export interface PublicMenuItemListParams extends ListParams {
  rootCategoryCode?: string;
  storeUuid?: string;
  foodUuid?: string;
  availabilityStatus?: string;
  featured?: boolean;
}
