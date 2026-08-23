import type {
  FilterCatalogOption,
  FilterGroupDefinition,
} from "@/src/types/filterCatalog";

export const FILTER_GROUPS: FilterGroupDefinition[] = [
  {
    slug: "food-categories",
    code: "FOOD_CATEGORY",
    labelKm: "ប្រភេទម្ហូប",
    labelEn: "Food categories",
    descriptionKm: "គ្រប់គ្រងប្រភេទម្ហូបដែលអាចជ្រើសពេលបង្កើតម្ហូបថ្មី។",
    selectionMode: "SINGLE",
    source: "FOOD_CATEGORY_API",
  },
  {
    slug: "cuisines",
    code: "CUISINE",
    labelKm: "ម្ហូបតាមប្រទេស",
    labelEn: "Cuisines",
    descriptionKm: "គ្រប់គ្រងប្រភេទម្ហូបតាមប្រទេស ឬវប្បធម៌។",
    selectionMode: "SINGLE",
    source: "CUISINE_API",
  },
  {
    slug: "meal-times",
    code: "MEAL_TIME",
    labelKm: "ប្រភេទអាហារ",
    labelEn: "Meal types",
    descriptionKm: "Breakfast, Lunch, Dinner និងពេលទទួលទានផ្សេងៗ។",
    selectionMode: "MULTIPLE",
    source: "MEAL_TYPE_API",
  },
  {
    slug: "dietary-types",
    code: "DIETARY_TYPE",
    labelKm: "របបអាហារ",
    labelEn: "Dietary types",
    descriptionKm: "ទិន្នន័យនេះប្រើ API របបអាហារដែលមានស្រាប់។",
    selectionMode: "MULTIPLE",
    source: "DIETARY_TYPE_API",
  },
  {
    slug: "age-groups",
    code: "AGE_GROUP",
    labelKm: "ក្រុមអាយុ",
    labelEn: "Age groups",
    descriptionKm: "ក្រុមអាយុដែលសាកសមសម្រាប់ម្ហូប។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "allergens",
    code: "ALLERGEN",
    labelKm: "អាឡែស៊ី",
    labelEn: "Allergens",
    descriptionKm: "ទិន្នន័យនេះប្រើ API អាឡែស៊ីដែលមានស្រាប់។",
    selectionMode: "MULTIPLE",
    source: "ALLERGEN_API",
  },
  {
    slug: "medical-conditions",
    code: "MEDICAL_CONDITION",
    labelKm: "ស្ថានភាពសុខភាព",
    labelEn: "Medical conditions",
    descriptionKm: "ទិន្នន័យនេះប្រើ API ស្ថានភាពសុខភាពដែលមានស្រាប់។",
    selectionMode: "MULTIPLE",
    source: "MEDICAL_CONDITION_API",
  },
  {
    slug: "spice-levels",
    code: "SPICE_LEVEL",
    labelKm: "កម្រិតហឹរ",
    labelEn: "Spice levels",
    descriptionKm: "គ្រប់គ្រងកម្រិតហឹររបស់ម្ហូប។",
    selectionMode: "SINGLE",
    source: "LOCAL",
  },
  {
    slug: "preparation-times",
    code: "PREPARATION_TIME",
    labelKm: "ពេលចម្អិន",
    labelEn: "Preparation times",
    descriptionKm: "រយៈពេលរៀបចំម្ហូបជានាទី។",
    selectionMode: "SINGLE",
    source: "LOCAL",
  },
  {
    slug: "distances",
    code: "DISTANCE",
    labelKm: "ចម្ងាយ",
    labelEn: "Distances",
    descriptionKm: "ជម្រើសចម្ងាយសម្រាប់ការត្រង។",
    selectionMode: "SINGLE",
    source: "LOCAL",
  },
  {
    slug: "cooking-methods",
    code: "COOKING_METHOD",
    labelKm: "វិធីចម្អិន",
    labelEn: "Cooking methods",
    descriptionKm: "ចៀន អាំង ស្ងោរ ចំហុយ និងវិធីចម្អិនផ្សេងៗ។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "food-styles",
    code: "FOOD_STYLE",
    labelKm: "លក្ខណៈម្ហូប",
    labelEn: "Food styles",
    descriptionKm: "ស្លាកសម្គាល់លក្ខណៈម្ហូបសម្រាប់ការស្វែងរក និងត្រង។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "regions",
    code: "REGION",
    labelKm: "តំបន់",
    labelEn: "Regions",
    descriptionKm: "តំបន់ ឬខេត្តដែលអាចប្រើជាស្លាកត្រង។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "tastes",
    code: "TASTE",
    labelKm: "រសជាតិ",
    labelEn: "Tastes",
    descriptionKm: "ផ្អែម ប្រៃ ជូរ ហឹរ និងរសជាតិផ្សេងៗ។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "textures",
    code: "TEXTURE",
    labelKm: "វាយនភាព",
    labelEn: "Textures",
    descriptionKm: "Crispy, soft, chewy, creamy និងវាយនភាពផ្សេងៗ។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "ingredients",
    code: "INGREDIENT",
    labelKm: "គ្រឿងផ្សំ",
    labelEn: "Ingredients",
    descriptionKm: "គ្រឿងផ្សំដែលអាចជ្រើសនៅក្នុងម្ហូប។",
    selectionMode: "MULTIPLE",
    source: "LOCAL",
  },
  {
    slug: "seasons",
    code: "SEASON",
    labelKm: "រដូវកាល",
    labelEn: "Seasons",
    descriptionKm: "គ្រប់គ្រងរដូវកាលដូចជា រដូវវស្សា រដូវប្រាំង។",
    selectionMode: "MULTIPLE",
    source: "SEASON_API",
  },
  {
    slug: "events",
    code: "EVENT",
    labelKm: "ព្រឹត្តិការណ៍ / បុណ្យទាន",
    labelEn: "Events & Festivals",
    descriptionKm: "គ្រប់គ្រងពិធីបុណ្យ និងព្រឹត្តិការណ៍ផ្សេងៗ។",
    selectionMode: "MULTIPLE",
    source: "EVENT_API",
  },
  {
    slug: "weather-conditions",
    code: "WEATHER_CONDITION",
    labelKm: "ស្ថានភាពអាកាសធាតុ",
    labelEn: "Weather conditions",
    descriptionKm: "គ្រប់គ្រងស្ថានភាពអាកាសធាតុដូចជា ភ្លៀង ក្ដៅ ត្រជាក់។",
    selectionMode: "MULTIPLE",
    source: "WEATHER_CONDITION_API",
  },
];

function seed(
  groupCode: string,
  code: string,
  name: string,
  localName = name,
  numericValue: number | null = null,
  unit: string | null = null,
): FilterCatalogOption {
  const now = "2026-08-11T00:00:00.000Z";

  return {
    uuid: `seed-${groupCode.toLowerCase()}-${code.toLowerCase()}`,
    groupCode,
    code,
    name,
    localName,
    description: null,
    numericValue,
    unit,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

export const INITIAL_FILTER_OPTIONS: FilterCatalogOption[] = [
  seed("FOOD_CATEGORY", "CHINESE_FOOD", "Chinese Food"),
  seed("FOOD_CATEGORY", "FAST_FOOD", "Fast Food"),
  seed("FOOD_CATEGORY", "KHMER_FOOD", "Khmer Food"),

  seed("CUISINE", "CHINESE", "Chinese"),
  seed("CUISINE", "KHMER", "Khmer"),

  seed("MEAL_TIME", "BREAKFAST", "Breakfast"),
  seed("MEAL_TIME", "LUNCH", "Lunch"),
  seed("MEAL_TIME", "DINNER", "Dinner"),

  seed("AGE_GROUP", "ADULT", "Adult"),
  seed("AGE_GROUP", "CHILD", "Child"),
  seed("AGE_GROUP", "SENIOR", "Senior"),
  seed("AGE_GROUP", "TEEN", "Teen"),

  seed("SPICE_LEVEL", "NOT_SPICY", "Not spicy", "មិនហឹរ", 0, "LEVEL"),
  seed("SPICE_LEVEL", "MILD", "Mild", "ហឹរតិច", 1, "LEVEL"),
  seed("SPICE_LEVEL", "MEDIUM", "Medium", "ហឹរមធ្យម", 2, "LEVEL"),
  seed("SPICE_LEVEL", "HOT", "Hot", "ហឹរខ្លាំង", 3, "LEVEL"),

  seed(
    "PREPARATION_TIME",
    "PREP_10",
    "10 minutes",
    "ក្រោម 10 នាទី",
    10,
    "MINUTE",
  ),
  seed(
    "PREPARATION_TIME",
    "PREP_15",
    "15 minutes",
    "ក្រោម 15 នាទី",
    15,
    "MINUTE",
  ),
  seed(
    "PREPARATION_TIME",
    "PREP_20",
    "20 minutes",
    "ក្រោម 20 នាទី",
    20,
    "MINUTE",
  ),

  seed("DISTANCE", "DISTANCE_1KM", "1 km", "ក្រោម 1 km", 1, "KM"),
  seed("DISTANCE", "DISTANCE_2KM", "2 km", "ក្រោម 2 km", 2, "KM"),
  seed("DISTANCE", "DISTANCE_3KM", "3 km", "ក្រោម 3 km", 3, "KM"),

  seed("COOKING_METHOD", "FRIED", "Fried", "ចៀន"),
  seed("COOKING_METHOD", "GRILLED", "Grilled", "អាំង"),
  seed("COOKING_METHOD", "STEAMED", "Steamed", "ចំហុយ"),
  seed("COOKING_METHOD", "BOILED", "Boiled", "ស្ងោរ"),
  seed("COOKING_METHOD", "BAKED", "Baked", "ដុត"),

  seed("FOOD_STYLE", "TRADITIONAL", "Traditional", "ម្ហូបប្រពៃណី"),
  seed("FOOD_STYLE", "STREET_FOOD", "Street food", "អាហារតាមផ្លូវ"),
  seed("FOOD_STYLE", "HEALTHY", "Healthy", "អាហារសុខភាព"),

  seed("REGION", "PHNOM_PENH", "Phnom Penh", "ភ្នំពេញ"),
  seed("REGION", "SIEM_REAP", "Siem Reap", "សៀមរាប"),
  seed("REGION", "BATTAMBANG", "Battambang", "បាត់ដំបង"),
  seed("REGION", "KAMPOT", "Kampot", "កំពត"),
  seed("REGION", "TAKEO", "Takeo", "តាកែវ"),

  seed("TASTE", "SWEET", "Sweet", "ផ្អែម"),
  seed("TASTE", "SALTY", "Salty", "ប្រៃ"),
  seed("TASTE", "SOUR", "Sour", "ជូរ"),
  seed("TASTE", "SPICY", "Spicy", "ហឹរ"),
  seed("TASTE", "BITTER", "Bitter", "ល្វីង"),

  seed("TEXTURE", "CRISPY", "Crispy", "ស្រួយ"),
  seed("TEXTURE", "SOFT", "Soft", "ទន់"),
  seed("TEXTURE", "CHEWY", "Chewy", "ស្វិត"),
  seed("TEXTURE", "CREAMY", "Creamy", "ខាប់ទន់"),

  seed("INGREDIENT", "BANANA_LEAF", "Banana Leaf"),
  seed("INGREDIENT", "BEAN_SPROUTS", "Bean Sprouts"),
  seed("INGREDIENT", "BEEF", "Beef"),
];

export function getFilterGroupBySlug(slug: string) {
  return FILTER_GROUPS.find((group) => group.slug === slug);
}

export function getFilterGroupByCode(code: string) {
  return FILTER_GROUPS.find((group) => group.code === code);
}
