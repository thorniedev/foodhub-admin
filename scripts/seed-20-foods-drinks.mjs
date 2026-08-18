import fs from "fs";

const API_BASE = "https://api.mhoubahar.store/api/v1";
const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3b0F5elVvREMyM3hhNmFhb2tDdWNZTE1ZTDViRFF0WHF0LWNtOGpoTlhzIn0.eyJleHAiOjE3ODcwOTA3OTksImlhdCI6MTc4NzA1NDgwMCwiYXV0aF90aW1lIjoxNzg3MDU0Nzk5LCJqdGkiOiJvbnJ0YWM6NTAwNjUwM2YtN2E4Yi01NmQwLWU3ODQtYWE1MmQxZTg2ZDU1IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLm1ob3ViYWhhci5zdG9yZS9yZWFsbXMvZm9vZGh1YiIsImF1ZCI6InJlYWxtLW1hbmFnZW1lbnQiLCJzdWIiOiI0MTMzNDYxYi1mZjU2LTQ2YWEtYjU5MC1iMWUxNDQ5ZTdiZDgiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJtaG91YmFoYXItYWRtaW4iLCJzaWQiOiJMQl9VTUhDRzh5cFd0ZmN0WEdaZDV0ZmYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYWRtaW4ubWhvdWJhaGFyLnN0b3JlIiwiaHR0cDovL2xvY2FsaG9zdDozMDAxIiwiaHR0cHM6Ly9mb29kaHViLWFkbWluLW9uZS52ZXJjZWwuYXBwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJDVVNUT01FUiIsIkFETUlOIiwiVVNFUiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJlYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsidmlldy1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LXJlYWxtIiwibWFuYWdlLWlkZW50aXR5LXByb3ZpZGVycyIsImltcGVyc29uYXRpb24iLCJyZWFsbS1hZG1pbiIsImNyZWF0ZS1jbGllbnQiLCJtYW5hZ2UtdXNlcnMiLCJxdWVyeS1yZWFsbXMiLCJ2aWV3LWF1dGhvcml6YXRpb24iLCJxdWVyeS1jbGllbnRzIiwicXVlcnktdXNlcnMiLCJtYW5hZ2UtZXZlbnRzIiwibWFuYWdlLXJlYWxtIiwidmlldy1ldmVudHMiLCJ2aWV3LXVzZXJzIiwidmlldy1jbGllbnRzIiwibWFuYWdlLWF1dGhvcml6YXRpb24iLCJtYW5hZ2UtY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkZvb2RIdWIgQWRtaW5pc3RyYXRvciIsInByZWZlcnJlZF91c2VybmFtZSI6ImtpbWNoYW50aG9uNDZAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkZvb2RIdWIiLCJmYW1pbHlfbmFtZSI6IkFkbWluaXN0cmF0b3IiLCJlbWFpbCI6ImtpbWNoYW50aG9uNDZAZ21haWwuY29tIn0.XStqumPixbkpeOebowYM1jsrvf4KzmzVmJT3WMSlLPAxw92GzBX-i9JjgYwQurvff5jI-yoa0JKh348pm1GdefwllZ_TY6crNSTNco5cI_PNN4kjR9Kj_QdPffasdLs-2YDhZOPMx75PuILDit2DOClsQhGuK4mYgkgydBbKk4hCU4mjRNCeg0mmJ98z_tPxtL89TdUEEvLQpkUsatwvApjxFkV-WbuBGaiuvnbZdx836JfvWFPrpzRFkncmjGES7BfbNqE9TFpiVUrkFB2mnDoNwL-dzMBOW2_YcuIXG64ww6dHNHKkeA7MCzKw7OK2EN1hkZSN6eeJY41YfOvt-g";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    console.error(`Failed to fetch ${path}:`, res.status, await res.text());
    return [];
  }
  const json = await res.json();
  return json?.data ?? json?.content ?? json ?? [];
}

async function createFood(payload) {
  const res = await fetch(`${API_BASE}/admin/foods`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, ok: res.ok, data: json, raw: text };
}

async function main() {
  console.log("=== Fetching Reference Catalogs ===");
  const [
    categoriesRaw,
    cuisinesRaw,
    mealTypesRaw,
    ageGroupsRaw,
    dietaryTypesRaw,
    seasonsRaw,
    eventsRaw,
    weatherRaw,
  ] = await Promise.all([
    get("/food-categories?includeInactive=false&size=100"),
    get("/cuisines?size=100"),
    get("/meal-types?size=100"),
    get("/age-groups?size=100"),
    get("/dietary-types?size=100"),
    get("/dynamic-content/seasons?size=100"),
    get("/dynamic-content/events?size=100"),
    get("/weather-conditions?size=100"),
  ]);

  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : categoriesRaw?.content ?? [];
  const cuisines = Array.isArray(cuisinesRaw) ? cuisinesRaw : cuisinesRaw?.content ?? [];
  const mealTypes = Array.isArray(mealTypesRaw) ? mealTypesRaw : mealTypesRaw?.content ?? [];
  const ageGroups = Array.isArray(ageGroupsRaw) ? ageGroupsRaw : ageGroupsRaw?.content ?? [];
  const dietaryTypes = Array.isArray(dietaryTypesRaw) ? dietaryTypesRaw : dietaryTypesRaw?.content ?? [];
  const seasons = Array.isArray(seasonsRaw) ? seasonsRaw : seasonsRaw?.content ?? [];
  const events = Array.isArray(eventsRaw) ? eventsRaw : eventsRaw?.content ?? [];
  const weather = Array.isArray(weatherRaw) ? weatherRaw : weatherRaw?.content ?? [];

  console.log(`Loaded:
  - Categories: ${categories.length}
  - Cuisines: ${cuisines.length}
  - Meal Types: ${mealTypes.length}
  - Age Groups: ${ageGroups.length}
  - Dietary Types: ${dietaryTypes.length}
  - Seasons: ${seasons.length}
  - Events: ${events.length}
  - Weather: ${weather.length}
  `);

  // Helper selectors
  const findCuisine = (codeOrName) =>
    cuisines.find(
      (c) =>
        c.code?.toLowerCase() === codeOrName.toLowerCase() ||
        c.name?.toLowerCase().includes(codeOrName.toLowerCase()) ||
        c.localName?.toLowerCase().includes(codeOrName.toLowerCase())
    )?.uuid || cuisines[0]?.uuid;

  const khmerCuisineUuid = findCuisine("khmer") || findCuisine("cambodia") || cuisines[0]?.uuid;
  const chineseCuisineUuid = findCuisine("chinese") || cuisines[0]?.uuid;
  const thaiCuisineUuid = findCuisine("thai") || cuisines[0]?.uuid;
  const vietnameseCuisineUuid = findCuisine("vietnamese") || cuisines[0]?.uuid;

  const breakfastMeal = mealTypes.find((m) => m.code?.includes("BREAKFAST") || m.name?.toLowerCase().includes("breakfast"))?.uuid;
  const lunchMeal = mealTypes.find((m) => m.code?.includes("LUNCH") || m.name?.toLowerCase().includes("lunch"))?.uuid;
  const dinnerMeal = mealTypes.find((m) => m.code?.includes("DINNER") || m.name?.toLowerCase().includes("dinner"))?.uuid;

  const allAdultAge = ageGroups.find((a) => a.code?.includes("ADULT") || a.name?.toLowerCase().includes("adult"))?.uuid || ageGroups[0]?.uuid;

  const rainySeasonUuid = seasons.find((s) => s.code?.includes("RAINY") || s.name?.toLowerCase().includes("rainy") || s.localName?.includes("វស្សា"))?.uuid || seasons[0]?.uuid;
  const drySeasonUuid = seasons.find((s) => s.code?.includes("DRY") || s.name?.toLowerCase().includes("dry") || s.localName?.includes("ប្រាំង"))?.uuid || seasons[1]?.uuid;

  const pchumBenEventUuid = events.find((e) => e.name?.includes("Pchum") || e.localName?.includes("ភ្ជុំ"))?.uuid || events[0]?.uuid;
  const khmerNewYearEventUuid = events.find((e) => e.name?.includes("New Year") || e.localName?.includes("ចូលឆ្នាំ"))?.uuid || events[1]?.uuid;

  const hotWeatherUuid = weather.find((w) => w.code?.includes("HOT") || w.name?.toLowerCase().includes("hot") || w.localName?.includes("ក្ដៅ"))?.uuid || weather[0]?.uuid;

  // Filter only subcategories
  const subCategories = categories.filter((c) => Boolean(c.parentCategoryUuid));
  const candidateCategories = subCategories.length > 0 ? subCategories : categories;

  const getCat = (keywords) => {
    for (const kw of keywords) {
      const match = candidateCategories.find((c) =>
        (c.name && c.name.toLowerCase().includes(kw.toLowerCase())) ||
        (c.code && c.code.toLowerCase().includes(kw.toLowerCase()))
      );
      if (match) return match.uuid;
    }
    return candidateCategories[0]?.uuid;
  };

  // 20 Authentic Foods
  const foodsList = [
    {
      canonicalName: "Samlor Korko",
      localName: "សម្លកកូរខ្មែរ",
      description: "សម្លប្រពៃណីខ្មែរដ៏ល្បីល្បាញ សម្បូរទៅដោយបន្លែចម្រុះ សាច់ត្រីស្រស់ ឬសាច់មាន់ស្រែ និងអង្ករលីងឈ្ងុយឆ្ងាញ់។",
      categoryKeywords: ["សម្ល", "soup", "curry", "tradition", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 320, proteinGrams: 24, carbohydrateGrams: 28, fatGrams: 12, fiberGrams: 6 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Fish Amok",
      localName: "អាម៉ុកត្រី",
      description: "អាម៉ុកត្រីដំរី ឬត្រីរ៉ស់ ជាមួយគ្រឿងខ្ទិះដូងស្លឹកញ ខ្ចប់ស្លឹកចេកចំហុយយ៉ាងឈ្ងុយឆ្ងាញ់។",
      categoryKeywords: ["ចំហុយ", "amok", "specialty", "seafood", "fish", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 380, proteinGrams: 28, carbohydrateGrams: 14, fatGrams: 24, fiberGrams: 3 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Kuyteav Phnom Penh",
      localName: "គុយទាវភ្នំពេញពិសេស",
      description: "គុយទាវទឹកស៊ុបឆ្អឹងជ្រូកផ្អែមឆ្ងាញ់ ជាមួយប្រហិត ប្រហិតថ្លើម បង្គាស្រស់ និងសាច់ចិញ្ច្រាំ។",
      categoryKeywords: ["គុយទាវ", "noodle", "kuyteav", "soup", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 450, proteinGrams: 26, carbohydrateGrams: 62, fatGrams: 10, fiberGrams: 2 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Beef Lok Lak",
      localName: "ឡុកឡាក់សាច់គោ",
      description: "សាច់គោផុយទន់ឆាជាមួយទឹកជ្រលក់ឡុកឡាក់ ញ៉ាំជាមួយអំបិលម្រេចក្រូចឆ្មារ ប៉េងប៉ោះ និងខ្ទឹមបារាំង។",
      categoryKeywords: ["ឆា", "stir", "beef", "meat", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 420, proteinGrams: 34, carbohydrateGrams: 12, fatGrams: 26, fiberGrams: 2 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Nom Banh Chok Samlor Khmer",
      localName: "នំបញ្ចុកសម្លខ្មែរ (ប្រហើរ)",
      description: "នំបញ្ចុកស្រស់ស្រូបសម្លប្រហើរត្រីរ៉ស់ខ្ទិះដូង ឬត្រីអាំង ញ៉ាំជាមួយបន្លែស្រស់ចម្រុះ និងផ្កាកំប្លោក។",
      categoryKeywords: ["នំបញ្ចុក", "noodle", "traditional", "nom banh chok", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 360, proteinGrams: 20, carbohydrateGrams: 55, fatGrams: 8, fiberGrams: 5 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Bai Sach Chrouk",
      localName: "បាយសាច់ជ្រូកអាំង",
      description: "បាយសាច់ជ្រូកអាំងជាមួយទឹកត្រីផ្អែម ត្រសក់ ជ្រក់ឆៃថាវ និងទឹកស៊ុបក្តៅៗ។",
      categoryKeywords: ["បាយ", "rice", "pork", "breakfast", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 480, proteinGrams: 22, carbohydrateGrams: 68, fatGrams: 14, fiberGrams: 2 },
      mealUuids: [breakfastMeal].filter(Boolean),
    },
    {
      canonicalName: "Samlor Machu Kreung Beef",
      localName: "សម្លម្ជូរគ្រឿងសាច់គោ",
      description: "សម្លម្ជូរគ្រឿងស្លឹកគ្រៃ រមៀត រំដេង ជាមួយសាច់គោផុយ និងត្រកួន ឬព្រលិត។",
      categoryKeywords: ["ម្ជូរ", "sour", "soup", "kreung", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 2,
      nutrition: { calories: 340, proteinGrams: 26, carbohydrateGrams: 16, fatGrams: 18, fiberGrams: 4 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Spicy Chicken Stir Fry with Lemongrass",
      localName: "ឆាក្តៅសាច់មាន់ស្រែ",
      description: "សាច់មាន់ស្រែឆាក្តៅជាមួយស្លឹកគ្រៃ ម្ទេសហឹរ ស្លឹកកំភ្លាញ និងម្រះព្រៅឈ្ងុយហឹរ។",
      categoryKeywords: ["ឆា", "stir", "spicy", "chicken", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 4,
      nutrition: { calories: 390, proteinGrams: 32, carbohydrateGrams: 10, fatGrams: 24, fiberGrams: 2 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Khmer Chicken Curry",
      localName: "សម្លការីសាច់មាន់",
      description: "សម្លការីក្រហមខ្មែរ ជាមួយដំឡូងជ្វា ដំឡូងបារាំង ការ៉ុត ខ្ទិះដូង ញ៉ាំជាមួយនំប៉័ង ឬនំបញ្ចុក។",
      categoryKeywords: ["ការី", "curry", "soup", "chicken", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 2,
      nutrition: { calories: 520, proteinGrams: 28, carbohydrateGrams: 42, fatGrams: 28, fiberGrams: 5 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Deep Fried Spring Rolls",
      localName: "ណែមចៀនស្រួយ",
      description: "ណែមចៀនស្នូលសាច់ជ្រូកចិញ្ច្រាំ ត្រចៀកកណ្តុរ មីសួ និងការ៉ុត ជ្រលក់ទឹកត្រីផ្អែម។",
      categoryKeywords: ["ចៀន", "snack", "fried", "appetizer", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 290, proteinGrams: 12, carbohydrateGrams: 24, fatGrams: 16, fiberGrams: 2 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Twa Ko Grilled Sausage",
      localName: "ត្វាហ្វាគោ (សាច់ក្រកគោអាំង)",
      description: "សាច់ក្រកគោប្រពៃណីខ្មែររសជាតិជូរស្រាល ផ្អែមឈ្ងុយ អាំងលើភ្លើងធ្យូង ញ៉ាំជាមួយស្ពៃជ្រក់។",
      categoryKeywords: ["អាំង", "grilled", "sausage", "meat", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 350, proteinGrams: 18, carbohydrateGrams: 8, fatGrams: 28, fiberGrams: 1 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Prahok Ktis",
      localName: "ប្រហុកខ្ទិះជ្រលក់បន្លែស្រស់",
      description: "ប្រហុកសាច់ជ្រូកចិញ្ច្រាំរម្ងាស់ជាមួយខ្ទិះដូង ម្ទេស គល់ស្លឹកគ្រៃ និងសណ្តែកដី ញ៉ាំជាមួយបន្លែស្រស់ចម្រុះ។",
      categoryKeywords: ["ប្រហុក", "prahok", "traditional", "dip", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 3,
      nutrition: { calories: 310, proteinGrams: 16, carbohydrateGrams: 12, fatGrams: 22, fiberGrams: 4 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Pork Rib Rice Porridge",
      localName: "បបរគ្រឿងឆ្អឹងជំនីជ្រូក",
      description: "បបរក្តៅៗរម្ងាស់ជាមួយឆ្អឹងជំនីជ្រូកផុយ សណ្តែកបណ្តុះ ខ្ទឹមលីង ស្លឹកខ្ទឹម និងខ្ញីឈ្ងុយឆ្ងាញ់។",
      categoryKeywords: ["បបរ", "porridge", "rice", "soup", "breakfast", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 340, proteinGrams: 18, carbohydrateGrams: 48, fatGrams: 8, fiberGrams: 2 },
      mealUuids: [breakfastMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Banh Chao Crispy Crepe",
      localName: "នំបាញ់ឆែវខ្មែរ",
      description: "នំបាញ់ឆែវសំបកស្រួយពណ៌លឿងរមៀត ស្នូលសាច់ជ្រូកចិញ្ច្រាំ សណ្តែកបណ្តុះ ញ៉ាំជាមួយស្លឹកសាឡាដ និងទឹកត្រីផ្អែម។",
      categoryKeywords: ["នំ", "crepe", "fried", "snack", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 410, proteinGrams: 16, carbohydrateGrams: 45, fatGrams: 18, fiberGrams: 3 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Steamed Fish with Soy Sauce & Ginger",
      localName: "ត្រីចំហុយស៊ីអ៊ីវខ្ញី",
      description: "ត្រីស្រស់ចំហុយជាមួយទឹកស៊ីអ៊ីវពិសេស ខ្ញីសរសៃ ស្លឹកខ្ទឹម និងប្រេងល្ងរសជាតិផ្អែមប្រៃល្មម។",
      categoryKeywords: ["ចំហុយ", "steamed", "fish", "seafood", "food"],
      cuisineUuid: chineseCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 280, proteinGrams: 32, carbohydrateGrams: 8, fatGrams: 12, fiberGrams: 1 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Pad Thai Kung",
      localName: "ផាត់ថៃបង្គាស្រស់",
      description: "គុយទាវផាត់ថៃឆាជាមួយបង្គាធំៗ ពងទា តៅហ៊ូ សណ្តែកដីបុក និងក្រូចឆ្មារ។",
      categoryKeywords: ["ឆា", "noodle", "pad thai", "seafood", "food"],
      cuisineUuid: thaiCuisineUuid,
      defaultSpiceLevel: 2,
      nutrition: { calories: 460, proteinGrams: 22, carbohydrateGrams: 58, fatGrams: 16, fiberGrams: 3 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Pho Bo Vietnamese Noodle Soup",
      localName: "ហ្វើសាច់គោពិសេស",
      description: "ហ្វើសាច់គោស្រស់ និងសាច់គោផុយ ក្នុងទឹកស៊ុបឱសថឈ្ងុយឆ្ងាញ់ ញ៉ាំជាមួយជីរ និងម្ទេសស្រស់។",
      categoryKeywords: ["គុយទាវ", "pho", "noodle", "soup", "beef", "food"],
      cuisineUuid: vietnameseCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 440, proteinGrams: 28, carbohydrateGrams: 56, fatGrams: 12, fiberGrams: 2 },
      mealUuids: [breakfastMeal, lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Morning Glory Stir Fry with Oyster Sauce",
      localName: "ឆាត្រកួនប្រេងខ្យង",
      description: "ត្រកួនបៃតងស្រស់ឆាភ្លើងខ្លាំងជាមួយប្រេងខ្យង ខ្ទឹមស និងម្ទេសស្រស់ ស្រួយឆ្ងាញ់។",
      categoryKeywords: ["ឆា", "vegetable", "stir", "healthy", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 140, proteinGrams: 4, carbohydrateGrams: 8, fatGrams: 10, fiberGrams: 4 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Grilled River Prawns with Koh Kong Sauce",
      localName: "បង្គាទន្លេអាំងទឹកត្រីកោះកុង",
      description: "បង្គាទន្លេស្រស់ៗអាំងលើភ្លើងធ្យូង មានខ្លាញ់ក្បាលបង្គាឈ្ងុយ ញ៉ាំជាមួយទឹកជ្រលក់កោះកុងហឹរជូរផ្អែម។",
      categoryKeywords: ["អាំង", "grilled", "seafood", "prawn", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 3,
      nutrition: { calories: 320, proteinGrams: 36, carbohydrateGrams: 6, fatGrams: 16, fiberGrams: 1 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Sour Soup with River Fish & Water Spinach",
      localName: "សម្លម្ជូរព្រលិតត្រីរ៉ស់",
      description: "សម្លម្ជូរត្រីរ៉ស់ស្រស់ ជាមួយដើមព្រលិត និងម្ជូរសណ្តាន់ ឬអំពិលទុំ រសជាតិជូរស្រាលស្រួលញ៉ាំ។",
      categoryKeywords: ["ម្ជូរ", "sour", "soup", "fish", "food"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 1,
      nutrition: { calories: 260, proteinGrams: 24, carbohydrateGrams: 14, fatGrams: 10, fiberGrams: 3 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
  ];

  // 20 Authentic Drinks
  const drinksList = [
    {
      canonicalName: "Iced Condensed Milk Coffee",
      localName: "កាហ្វេទឹកដោះគោទឹកកក",
      description: "កាហ្វេខ្មែរឆុងបែបប្រពៃណី ឈ្ងុយខាប់ ជាមួយទឹកដោះគោខាប់ផ្អែមឆ្ងាញ់ និងទឹកកកត្រជាក់ស្រេង។",
      categoryKeywords: ["កាហ្វេ", "coffee", "drink", "khmer coffee"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 180, proteinGrams: 4, carbohydrateGrams: 28, fatGrams: 6, fiberGrams: 0 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Iced Black Coffee",
      localName: "កាហ្វេខ្មៅទឹកកក",
      description: "កាហ្វេខ្មៅសុទ្ធរសជាតិឈ្ងុយក្រអូប ជូរលាយចត់តិចៗ ផ្តល់ថាមពលស្រស់ស្រាយពេញមួយថ្ងៃ។",
      categoryKeywords: ["កាហ្វេ", "coffee", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 15, proteinGrams: 1, carbohydrateGrams: 3, fatGrams: 0, fiberGrams: 0 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Iced Lemon Tea",
      localName: "តែក្រូចឆ្មារទឹកកក",
      description: "តែក្រហមឆុងលាយទឹកក្រូចឆ្មារស្រស់ និងទឹកស្ករ ជូរអែមត្រជាក់ចិត្ត បំបាត់ការស្រេកទឹក។",
      categoryKeywords: ["តែ", "tea", "drink", "herbal"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 110, proteinGrams: 0, carbohydrateGrams: 26, fatGrams: 0, fiberGrams: 0 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Sugar Cane Juice",
      localName: "ទឹកអំពៅស្រស់",
      description: "ទឹកអំពៅកិនស្រស់ៗលាយផ្លែកន្ទួត ឬក្រូចឆ្មារតិចៗ ផ្អែមត្រជាក់បែបធម្មជាតិ។",
      categoryKeywords: ["អំពៅ", "cane", "juice", "fresh", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 150, proteinGrams: 1, carbohydrateGrams: 38, fatGrams: 0, fiberGrams: 1 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Green Coconut Juice",
      localName: "ទឹកដូងក្រអូបស្រស់",
      description: "ទឹកដូងខ្ចីក្រអូបធម្មជាតិ ផ្អែមត្រជាក់ និងសាច់ដូងទន់ៗឆ្ងាញ់ពិសា។",
      categoryKeywords: ["ផ្លែឈើ", "juice", "coconut", "drink", "fresh"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 90, proteinGrams: 2, carbohydrateGrams: 20, fatGrams: 1, fiberGrams: 2 },
      mealUuids: [breakfastMeal, lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Avocado Smoothie",
      localName: "ផ្លែប៊ឺក្រឡុកទឹកដោះគោ",
      description: "ផ្លែប៊ឺមណ្ឌលគិរីក្រឡុកជាមួយទឹកដោះគោស្រស់ និងទឹកដោះគោខាប់ ឈ្ងុយខាប់ម៉ត់រលោង។",
      categoryKeywords: ["ក្រឡុក", "smoothie", "shake", "juice", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 290, proteinGrams: 5, carbohydrateGrams: 32, fatGrams: 16, fiberGrams: 6 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Ripe Mango Smoothie",
      localName: "ស្វាយទុំក្រឡុក",
      description: "ស្វាយកែវរមៀតទុំផ្អែមក្រឡុកជាមួយទឹកកកម៉ត់ និងទឹកដោះគោ រសជាតិផ្អែមក្រអូបឈ្ងុយ។",
      categoryKeywords: ["ក្រឡុក", "smoothie", "mango", "juice", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 210, proteinGrams: 2, carbohydrateGrams: 48, fatGrams: 2, fiberGrams: 3 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Thai Green Milk Tea",
      localName: "តែបៃតងទឹកដោះគោ",
      description: "តែបៃតងទឹកដោះគោឈ្ងុយពិសេស លាយទឹកដោះគោខាប់ និងទឹកដោះគោស្រស់ផ្អែមល្មម។",
      categoryKeywords: ["តែ", "milk tea", "tea", "drink"],
      cuisineUuid: thaiCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 230, proteinGrams: 4, carbohydrateGrams: 36, fatGrams: 8, fiberGrams: 0 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Thai Red Milk Tea",
      localName: "តែក្រហមទឹកដោះគោ",
      description: "តែក្រហមថៃរសជាតិដើម ឈ្ងុយស្លឹកតែ លាយទឹកដោះគោត្រជាក់ចិត្ត។",
      categoryKeywords: ["តែ", "milk tea", "tea", "drink"],
      cuisineUuid: thaiCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 240, proteinGrams: 4, carbohydrateGrams: 38, fatGrams: 8, fiberGrams: 0 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Passion Fruit Soda",
      localName: "ផាសិនសូដា",
      description: "ទឹកផ្លែផាសិនស្រស់លាយទឹកសូដា និងទឹកកក ជូរផ្អែមឆួលត្រជាក់បំពង់ក។",
      categoryKeywords: ["កំប៉ុង", "soda", "juice", "drink", "refreshment"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 130, proteinGrams: 1, carbohydrateGrams: 32, fatGrams: 0, fiberGrams: 2 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Soybean Milk",
      localName: "ទឹកសណ្ដែកសៀងក្តៅ/ត្រជាក់",
      description: "ទឹកសណ្តែកសៀងស្រស់កិនធម្មជាតិ សម្បូរប្រូតេអ៊ីន ផ្អែមស្រាលល្អចំពោះសុខភាព។",
      categoryKeywords: ["តែ", "soya", "healthy", "drink", "milk"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 120, proteinGrams: 7, carbohydrateGrams: 14, fatGrams: 4, fiberGrams: 1 },
      mealUuids: [breakfastMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Dragonfruit Smoothie",
      localName: "ផ្លែស្រកានាគក្រឡុក",
      description: "ស្រកានាគក្រហមស្រស់ក្រឡុកពណ៌ស្អាតទាក់ទាញ ត្រជាក់ផ្អែមស្រទន់ សម្បូរជីវជាតិ។",
      categoryKeywords: ["ក្រឡុក", "smoothie", "juice", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 170, proteinGrams: 2, carbohydrateGrams: 38, fatGrams: 1, fiberGrams: 5 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Hot Jasmine Herbal Tea",
      localName: "តែផ្កាម្លិះក្តៅ",
      description: "តែបៃតងលាយផ្កាម្លិះក្រអូបស្រាល ក្តៅឧណ្ហៗ ជួយបន្ធូរអារម្មណ៍ និងរំលាយអាហារ។",
      categoryKeywords: ["តែ", "tea", "herbal", "hot", "drink"],
      cuisineUuid: chineseCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 5, proteinGrams: 0, carbohydrateGrams: 1, fatGrams: 0, fiberGrams: 0 },
      mealUuids: [breakfastMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Iced Matcha Latte",
      localName: "ម៉ាត់ឆាឡាតេទឹកកក",
      description: "ម្សៅតែបៃតងម៉ាត់ឆាជប៉ុនគុណភាពខ្ពស់ ឆុងជាមួយទឹកដោះគោស្រស់ ឈ្ងុយចត់តិចៗលាយផ្អែម។",
      categoryKeywords: ["តែ", "matcha", "latte", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 190, proteinGrams: 5, carbohydrateGrams: 24, fatGrams: 7, fiberGrams: 1 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Orange Juice",
      localName: "ទឹកក្រូចពោធិ៍សាត់ច្របាច់ស្រស់",
      description: "ក្រូចពោធិ៍សាត់ធម្មជាតិច្របាច់ស្រស់ៗ ផ្អែមឆ្ងាញ់បែបធម្មជាតិ សម្បូរវីតាមីន C។",
      categoryKeywords: ["ផ្លែឈើ", "juice", "orange", "fresh", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 120, proteinGrams: 2, carbohydrateGrams: 28, fatGrams: 0, fiberGrams: 1 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Chrysanthemum Herbal Drink",
      localName: "ទឹកតែផ្កាកេសរ",
      description: "ទឹកតែផ្កាកេសរត្រជាក់ ជួយកាត់បន្ថយកម្តៅក្នុងខ្លួន ផ្អែមត្រជាក់ជាប់មាត់។",
      categoryKeywords: ["តែ", "herbal", "tea", "drink"],
      cuisineUuid: chineseCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 80, proteinGrams: 0, carbohydrateGrams: 20, fatGrams: 0, fiberGrams: 0 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Iced Cappuccino",
      localName: "កាពូឈីណូទឹកកក",
      description: "កាហ្វេ Espresso ជាមួយពពុះទឹកដោះគោក្រាស់ទន់ និងម្សៅកាកាវរោយពីលើ។",
      categoryKeywords: ["កាហ្វេ", "coffee", "cappuccino", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 160, proteinGrams: 5, carbohydrateGrams: 18, fatGrams: 6, fiberGrams: 0 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Watermelon Smoothie",
      localName: "ឪឡឹកក្រឡុកត្រជាក់",
      description: "ផ្លែឪឡឹកក្រហមផ្អែមស្រស់ក្រឡុកជាមួយទឹកកក ស្រស់ស្រាយបំបាត់ការស្រេកទឹកក្នុងថ្ងៃក្តៅ។",
      categoryKeywords: ["ក្រឡុក", "smoothie", "watermelon", "juice", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 110, proteinGrams: 2, carbohydrateGrams: 26, fatGrams: 0, fiberGrams: 1 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
    {
      canonicalName: "Iced Caramel Macchiato",
      localName: "ខារ៉ាមែលម៉ាគីអាតូ",
      description: "កាហ្វេលាយទឹកដោះគោស្រស់ ស្រោបដោយទឹកស៊ីរ៉ូខារ៉ាមែលក្រអូបផ្អែមឈ្ងុយ។",
      categoryKeywords: ["កាហ្វេ", "coffee", "caramel", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 230, proteinGrams: 6, carbohydrateGrams: 32, fatGrams: 8, fiberGrams: 0 },
      mealUuids: [breakfastMeal, lunchMeal].filter(Boolean),
    },
    {
      canonicalName: "Fresh Pennywort Drink",
      localName: "ទឹកត្រចៀកកាំ / ត្រកៀតបៃតងស្រស់",
      description: "ទឹកស្លឹកត្រចៀកកាំបៃតងស្រស់កិនធម្មជាតិ ផ្អែមត្រជាក់ ជួយត្រជាក់ក្នុងខ្លួន និងជំនួយសុខភាព។",
      categoryKeywords: ["តែ", "herbal", "pennywort", "healthy", "drink"],
      cuisineUuid: khmerCuisineUuid,
      defaultSpiceLevel: 0,
      nutrition: { calories: 95, proteinGrams: 1, carbohydrateGrams: 22, fatGrams: 0, fiberGrams: 1 },
      mealUuids: [lunchMeal, dinnerMeal].filter(Boolean),
    },
  ];

  console.log("\n=== Starting Creation of 20 Foods ===");
  let createdFoods = 0;
  for (const f of foodsList) {
    const categoryUuid = getCat(f.categoryKeywords);
    const payload = {
      canonicalName: f.canonicalName,
      localName: f.localName,
      description: f.description,
      categoryUuid,
      cuisineUuid: f.cuisineUuid,
      defaultSpiceLevel: f.defaultSpiceLevel,
      nutritionData: f.nutrition,
      isActive: true,
      mealTypes: f.mealUuids.map((mUuid) => ({
        mealTypeUuid: mUuid,
        suitabilityScore: 1.0,
      })),
      ageRules: [
        {
          ageGroupUuid: allAdultAge,
          ruleResult: "ALLOWED",
          reasonText: "សាកសមសម្រាប់មនុស្សពេញវ័យ",
        },
      ],
      seasons: [
        {
          seasonUuid: rainySeasonUuid,
          suitabilityScore: 0.9,
          reasonText: "សាកសមគ្រប់រដូវកាល",
        },
      ],
      events: [
        {
          eventUuid: pchumBenEventUuid,
          relevanceScore: 0.9,
          reasonText: "ពេញនិយមក្នុងពិធីបុណ្យទាន",
        },
      ],
      suitableWeather: [
        {
          weatherConditionUuid: hotWeatherUuid,
          suitabilityScore: 0.9,
          reasonText: "សាកសមគ្រប់អាកាសធាតុ",
        },
      ],
    };

    const res = await createFood(payload);
    if (res.ok) {
      createdFoods++;
      console.log(`[FOOD ${createdFoods}/20] Created: "${f.localName}" (${f.canonicalName})`);
    } else {
      console.error(`[FOOD FAILED] "${f.localName}":`, res.status, res.raw);
    }
  }

  console.log("\n=== Starting Creation of 20 Drinks ===");
  let createdDrinks = 0;
  for (const d of drinksList) {
    const categoryUuid = getCat(d.categoryKeywords);
    const payload = {
      canonicalName: d.canonicalName,
      localName: d.localName,
      description: d.description,
      categoryUuid,
      cuisineUuid: d.cuisineUuid,
      defaultSpiceLevel: d.defaultSpiceLevel,
      nutritionData: d.nutrition,
      isActive: true,
      mealTypes: d.mealUuids.map((mUuid) => ({
        mealTypeUuid: mUuid,
        suitabilityScore: 1.0,
      })),
      ageRules: [
        {
          ageGroupUuid: allAdultAge,
          ruleResult: "ALLOWED",
          reasonText: "សាកសមសម្រាប់មនុស្សគ្រប់វ័យ",
        },
      ],
      seasons: [
        {
          seasonUuid: drySeasonUuid,
          suitabilityScore: 0.95,
          reasonText: "ពេញនិយមបំផុតនៅរដូវក្តៅ",
        },
      ],
      events: [
        {
          eventUuid: khmerNewYearEventUuid,
          relevanceScore: 0.95,
          reasonText: "ពេញនិយមក្នុងកម្មវិធីជួបជុំ",
        },
      ],
      suitableWeather: [
        {
          weatherConditionUuid: hotWeatherUuid,
          suitabilityScore: 0.95,
          reasonText: "ជួយបំបាត់ការស្រេកទឹកក្នុងអាកាសធាតុក្តៅ",
        },
      ],
    };

    const res = await createFood(payload);
    if (res.ok) {
      createdDrinks++;
      console.log(`[DRINK ${createdDrinks}/20] Created: "${d.localName}" (${d.canonicalName})`);
    } else {
      console.error(`[DRINK FAILED] "${d.localName}":`, res.status, res.raw);
    }
  }

  console.log(`\n🎉 COMPLETED: Successfully created ${createdFoods}/20 Foods and ${createdDrinks}/20 Drinks!`);
}

main().catch(console.error);
