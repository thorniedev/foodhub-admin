import fetch from "node-fetch";

const API_BASE = "https://api.mhoubahar.store/api/v1";
const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3b0F5elVvREMyM3hhNmFhb2tDdWNZTE1ZTDViRFF0WHF0LWNtOGpoTlhzIn0.eyJleHAiOjE3ODcwOTA3OTksImlhdCI6MTc4NzA1NDgwMCwiYXV0aF90aW1lIjoxNzg3MDU0Nzk5LCJqdGkiOiJvbnJ0YWM6NTAwNjUwM2YtN2E4Yi01NmQwLWU3ODQtYWE1MmQxZTg2ZDU1IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLm1ob3ViYWhhci5zdG9yZS9yZWFsbXMvZm9vZGh1YiIsImF1ZCI6InJlYWxtLW1hbmFnZW1lbnQiLCJzdWIiOiI0MTMzNDYxYi1mZjU2LTQ2YWEtYjU5MC1iMWUxNDQ5ZTdiZDgiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJtaG91YmFoYXItYWRtaW4iLCJzaWQiOiJMQl9VTUhDRzh5cFd0ZmN0WEdaZDV0ZmYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYWRtaW4ubWhvdWJhaGFyLnN0b3JlIiwiaHR0cDovL2xvY2FsaG9zdDozMDAxIiwiaHR0cHM6Ly9mb29kaHViLWFkbWluLW9uZS52ZXJjZWwuYXBwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJDVVNUT01FUiIsIkFETUlOIiwiVVNFUiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJlYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsidmlldy1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LXJlYWxtIiwibWFuYWdlLWlkZW50aXR5LXByb3ZpZGVycyIsImltcGVyc29uYXRpb24iLCJyZWFsbS1hZG1pbiIsImNyZWF0ZS1jbGllbnQiLCJtYW5hZ2UtdXNlcnMiLCJxdWVyeS1yZWFsbXMiLCJ2aWV3LWF1dGhvcml6YXRpb24iLCJxdWVyeS1jbGllbnRzIiwicXVlcnktdXNlcnMiLCJtYW5hZ2UtZXZlbnRzIiwibWFuYWdlLXJlYWxtIiwidmlldy1ldmVudHMiLCJ2aWV3LXVzZXJzIiwidmlldy1jbGllbnRzIiwibWFuYWdlLWF1dGhvcml6YXRpb24iLCJtYW5hZ2UtY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkZvb2RIdWIgQWRtaW5pc3RyYXRvciIsInByZWZlcnJlZF91c2VybmFtZSI6ImtpbWNoYW50aG9uNDZAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkZvb2RIdWIiLCJmYW1pbHlfbmFtZSI6IkFkbWluaXN0cmF0b3IiLCJlbWFpbCI6ImtpbWNoYW50aG9uNDZAZ21haWwuY29tIn0.XStqumPixbkpeOebowYM1jsrvf4KzmzVmJT3WMSlLPAxw92GzBX-i9JjgYwQurvff5jI-yoa0JKh348pm1GdefwllZ_TY6crNSTNco5cI_PNN4kjR9Kj_QdPffasdLs-2YDhZOPMx75PuILDit2DOClsQhGuK4mYgkgydBbKk4hCU4mjRNCeg0mmJ98z_tPxtL89TdUEEvLQpkUsatwvApjxFkV-WbuBGaiuvnbZdx836JfvWFPrpzRFkncmjGES7BfbNqE9TFpiVUrkFB2mnDoNwL-dzMBOW2_YcuIXG64ww6dHNHKkeA7MCzKw7OK2EN1hkZSN6eeJY41YfOvt-g";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// Cuisines map
const CUISINE_MAP = {
  KHMER: "df84599d-6378-4849-a923-94a5243f6ab5",
  AMERICAN: "80f97481-3570-4e84-868b-0eace836d99a",
  ITALIAN: "63ebd317-052f-4e62-9203-1d04047e5440",
  JAPANESE: "5b506b7c-c29e-4ce3-9b61-c967f0451d3a",
  KOREAN: "379174ff-d3eb-4071-81c4-0dca3d7e7361",
  CHINESE: "33734aca-2976-4cf7-b710-510ebeb50fcc",
  FRENCH: "66cb8a06-8264-49fb-8dac-66a09686629b",
  ASIAN: "10d1ef69-f251-4195-889b-e253bc97a255"
};

// Comprehensive Master Food Catalog for Phnom Penh
const ALL_MASTER_RECIPES = [
  // --- JUICES, SHAKES & FRUITS ---
  {
    canonicalName: "Fresh Pursat Orange Juice",
    localName: "ទឹកក្រូចពោធិ៍សាត់ច្របាច់ស្រស់",
    description: "ក្រូចពោធិ៍សាត់ធម្មជាតិច្របាច់ស្រស់ៗ ផ្អែមឆ្ងាញ់បែបធម្មជាតិ សម្បូរវីតាមីន C",
    categoryCode: "DRINK_FRESH_JUICE_SHAKES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.00,
  },
  {
    canonicalName: "Fresh Dragon Fruit Smoothie",
    localName: "ផ្លែស្រកានាគក្រឡុក",
    description: "ស្រកានាគក្រហមស្រស់ក្រឡុកពណ៌ស្អាតទាក់ទាញ ត្រជាក់ផ្អែមស្រទន់ សម្បូរជីវជាតិ",
    categoryCode: "DRINK_FRESH_JUICE_SHAKES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.50,
  },
  {
    canonicalName: "Fresh Ripe Mango Smoothie",
    localName: "ស្វាយទុំក្រឡុក",
    description: "ស្វាយកែវរមៀតទុំផ្អែមក្រឡុកជាមួយទឹកកកម៉ត់ និងទឹកដោះគោ រសជាតិផ្អែមក្រអូបឈ្ងុយ",
    categoryCode: "DRINK_FRESH_JUICE_SHAKES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.50,
  },
  {
    canonicalName: "Fresh Sugar Cane Juice (Teuk Ampov)",
    localName: "ទឹកអំពៅស្រស់",
    description: "ទឹកអំពៅកិនស្រស់ៗលាយផ្លែកន្ទួត ឬក្រូចឆ្មារតិចៗ ផ្អែមត្រជាក់បែបធម្មជាតិ",
    categoryCode: "DRINK_FRESH_JUICE_SHAKES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.25,
  },
  {
    canonicalName: "Fresh Watermelon Smoothie",
    localName: "ឪឡឹកក្រឡុកត្រជាក់",
    description: "ផ្លែឪឡឹកក្រហមផ្អែមស្រស់ក្រឡុកជាមួយទឹកកក ស្រស់ស្រាយបំបាត់ការស្រេកទឹក",
    categoryCode: "DRINK_FRESH_JUICE_SHAKES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.00,
  },
  {
    canonicalName: "Fresh Passion Fruit Soda",
    localName: "ផាសិនសូដា",
    description: "ទឹកផ្លែផាសិនស្រស់លាយទឹកសូដា និងទឹកកក ជូរផ្អែមឆួលត្រជាក់បំពង់ក",
    categoryCode: "DRINK_SOFT_SODA",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.00,
  },
  {
    canonicalName: "Fresh Soybean Milk",
    localName: "ទឹកសណ្ដែកសៀងក្តៅ/ត្រជាក់",
    description: "ទឹកសណ្តែកសៀងស្រស់កិនធម្មជាតិ សម្បូរប្រូតេអ៊ីន ផ្អែមស្រាលល្អចំពោះសុខភាព",
    categoryCode: "DRINK_MILK_TEA_HERBAL",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.25,
  },
  {
    canonicalName: "Fresh Pennywort Herbal Drink",
    localName: "ទឹកត្រចៀកកាំ / ត្រកៀតបៃតងស្រស់",
    description: "ទឹកស្លឹកត្រចៀកកាំបៃតងស្រស់កិនធម្មជាតិ ផ្អែមត្រជាក់ ជួយត្រជាក់ក្នុងខ្លួន",
    categoryCode: "DRINK_MILK_TEA_HERBAL",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.50,
  },

  // --- COFFEES & CAFES ---
  {
    canonicalName: "Iced Black Coffee (Cafe Khmao)",
    localName: "កាហ្វេខ្មៅទឹកកក",
    description: "កាហ្វេខ្មៅសុទ្ធរសជាតិឈ្ងុយក្រអូប ជូរលាយចត់តិចៗ ផ្តល់ថាមពលស្រស់ស្រាយ",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.50,
  },
  {
    canonicalName: "Iced Milk Coffee (Cafe Teuk Dah Koh)",
    localName: "កាហ្វេទឹកដោះគោទឹកកក",
    description: "កាហ្វេខ្មែរឆុងឈ្ងុយលាយទឹកដោះគោខាប់ និងទឹកកក ផ្អែមខាប់ឈ្ងុយឆ្ងាញ់",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.75,
  },
  {
    canonicalName: "Brown Signature Iced Latte",
    localName: "កាហ្វេឡាតេប្រោន ទឹកកក",
    description: "Espresso គ្រាប់កាហ្វេពិសេសប្រោន លាយទឹកដោះគោស្រស់ និងទឹកកក",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 3.45,
  },
  {
    canonicalName: "Brown Palm Sugar Coffee",
    localName: "កាហ្វេស្ករត្នោតប្រោន",
    description: "កាហ្វេលាយស្ករត្នោតធម្មជាតិខ្មែរ ឈ្ងុយផ្អែមស្រទន់បែបប្រណិត",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 3.25,
  },
  {
    canonicalName: "Iced Cappuccino",
    localName: "កាពូឈីណូទឹកកក",
    description: "កាហ្វេ Espresso ជាមួយពពុះទឹកដោះគោក្រាស់ទន់ និងម្សៅកាកាវរោយពីលើ",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.ITALIAN,
    spice: 0,
    price: 2.80,
  },
  {
    canonicalName: "Iced Caramel Macchiato",
    localName: "ខារ៉ាមែល ម៉ាគីយ៉ាតូ ទឹកកក",
    description: "Espresso ស្រស់ ទឹកដោះគោស្រស់ និងទឹកស៊ីរ៉ូខារ៉ាមែលផ្អែមឈ្ងុយ",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.AMERICAN,
    spice: 0,
    price: 3.80,
  },
  {
    canonicalName: "Special Tube Coffee Ice",
    localName: "កាហ្វេធូបពិសេស ទឹកកក",
    description: "កាហ្វេទឹកដោះគោខាប់ Tube រសជាតិដិតឈ្ងុយឆ្ងាញ់ពេញនិយម",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.80,
  },
  {
    canonicalName: "Tube Passion Milk Cheese",
    localName: "ផាសិនទឹកដោះគោក្រែមឈីស ធូប",
    description: "ទឹកផាសិនស្រស់លាយទឹកដោះគោ និងមានក្រែមឈីសពីលើ",
    categoryCode: "DRINK_FRESH_JUICE_SHAKES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.20,
  },
  {
    canonicalName: "Amazon Iced Espresso",
    localName: "អាម៉ាហ្សូន អេសប្រេសសូ ទឹកកក",
    description: "កាហ្វេអេសប្រេសសូ Amazon រសជាតិដិតឈ្ងុយឆ្ងាញ់ជាប់ចិត្ត",
    categoryCode: "DRINK_KHMER_COFFEE",
    cuisineCode: CUISINE_MAP.ASIAN,
    spice: 0,
    price: 2.20,
  },
  {
    canonicalName: "Amazon Black Tea Honey Lime",
    localName: "តែខ្មៅក្រូចឆ្មារទឹកឃ្មុំ អាម៉ាហ្សូន",
    description: "តែខ្មៅក្រអូបលាយទឹកឃ្មុំព្រៃ និងក្រូចឆ្មារស្រស់ ជូរផ្អែមស្រស់ស្រាយ",
    categoryCode: "DRINK_MILK_TEA_HERBAL",
    cuisineCode: CUISINE_MAP.ASIAN,
    spice: 0,
    price: 2.40,
  },

  // --- BOBA & TEAS ---
  {
    canonicalName: "KOI Golden Bubble Milk Tea",
    localName: "តែទឹកដោះគោគុជមាស KOI",
    description: "តែទឹកដោះគោគុជមាសតៃវ៉ាន់ រសជាតិដើម គុជស្វិតទន់ឈ្ងុយឆ្ងាញ់",
    categoryCode: "DRINK_MILK_TEA_HERBAL",
    cuisineCode: CUISINE_MAP.ASIAN,
    spice: 0,
    price: 2.80,
  },
  {
    canonicalName: "KOI Brown Sugar Fresh Milk",
    localName: "ទឹកដោះគោស្រស់ស្ករត្នោតគុជខ្មៅ KOI",
    description: "ទឹកដោះគោស្រស់ធម្មជាតិ លាយស្ករត្នោតខាប់ និងគុជខ្មៅក្តៅឧណ្ហៗ",
    categoryCode: "DRINK_MILK_TEA_HERBAL",
    cuisineCode: CUISINE_MAP.ASIAN,
    spice: 0,
    price: 3.20,
  },
  {
    canonicalName: "Gong Cha Milk Foam Green Tea",
    localName: "តែបៃតងពពុះទឹកដោះគោ Gong Cha",
    description: "តែបៃតងផ្កាម្លិះស្រស់ ស្រោបដោយពពុះទឹកដោះគោប្រៃផ្អែមឈ្ងុយ",
    categoryCode: "DRINK_MILK_TEA_HERBAL",
    cuisineCode: CUISINE_MAP.ASIAN,
    spice: 0,
    price: 2.70,
  },

  // --- BAKERIES & DESSERTS ---
  {
    canonicalName: "Bayon Pork Floss Mayo Bun",
    localName: "នំប៉័ងសាច់ជ្រូកផាត់ម៉ាយូណេស បាយ័ន",
    description: "នំប៉័ងទន់លាយទឹកក្រែមម៉ាយូណេស រោយសាច់ជ្រូកផាត់ឈ្ងុយ",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.60,
  },
  {
    canonicalName: "Bayon Fresh Coconut Sweet Bread",
    localName: "នំប៉័ងស្នូលដូងផ្អែម បាយ័ន",
    description: "នំប៉័ងសាច់ទន់ ស្នូលសាច់ដូងកោសលាយស្ករត្នោតឈ្ងុយឆ្ងាញ់",
    categoryCode: "FOOD_DESSERT_SWEETS",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 1.30,
  },
  {
    canonicalName: "French Butter Croissant",
    localName: "នំខ្វាសង់បឺរបារាំង",
    description: "នំ Croissant សំបកស្រួយស្រទាប់ៗ ប្រើបឺរស្រស់បារាំងឈ្ងុយឆ្ងាញ់",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.FRENCH,
    spice: 0,
    price: 1.80,
  },
  {
    canonicalName: "Almond Chocolate Croissant",
    localName: "នំខ្វាសង់អាល់ម៉ុនសូកូឡា",
    description: "នំ Croissant សំបកស្រួយ ស្នូលសូកូឡា រោយគ្រាប់អាល់ម៉ុនបំពង",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.FRENCH,
    spice: 0,
    price: 2.50,
  },
  {
    canonicalName: "Basque Burnt Cheesecake Slice",
    localName: "នំខេកឈីសបាស្ក៍ដុត",
    description: "នំខេកឈីសដុតផ្ទៃខាងលើក្រៀម សាច់ខាងក្នុងទន់រលោងឈ្ងុយឈីស",
    categoryCode: "FOOD_DESSERT_SWEETS",
    cuisineCode: CUISINE_MAP.AMERICAN,
    spice: 0,
    price: 3.80,
  },

  // --- BURGERS & FAST FOOD ---
  {
    canonicalName: "Whopper Double Beef with Cheese",
    localName: "ប៊ឺហ្គឺវ៉ុបភើរសាច់គោពីរជាន់",
    description: "សាច់គោអាំងភ្លើង ២ បន្ទះ ឈីស Cheddar ប៉េងប៉ោះ សាឡាដ និងទឹកជ្រលក់",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.AMERICAN,
    spice: 0,
    price: 6.50,
  },
  {
    canonicalName: "Crispy French Fries Large",
    localName: "ដំឡូងបារាំងបំពងស្រួយ (ធំ)",
    description: "ដំឡូងបារាំងបំពងពណ៌មាសស្រួយស្រួយ រោយអំបិលម៉ត់ ញ៉ាំជាមួយទឹកប៉េងប៉ោះ",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.AMERICAN,
    spice: 0,
    price: 2.20,
  },
  {
    canonicalName: "Bonchon Soy Garlic Chicken Wings",
    localName: "ស្លាបមាន់បំពងស្រួយសណ្តែកសៀងខ្ទឹមស Bonchon",
    description: "ស្លាបមាន់បំពងស្រួយបែបកូរ៉េ ស្រោបទឹកជ្រលក់ Soy Garlic ឈ្ងុយផ្អែម",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.KOREAN,
    spice: 0,
    price: 7.90,
  },
  {
    canonicalName: "Bonchon Spicy Crunchy Drumsticks",
    localName: "ភ្លៅមាន់បំពងហឹរស្រួយ Bonchon",
    description: "ភ្លៅមាន់បំពងស្រួយស្រោបទឹកជ្រលក់ម្ទេសកូរ៉េហឹរឆ្ងាញ់ជាប់ចិត្ត",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.KOREAN,
    spice: 2,
    price: 8.50,
  },

  // --- PIZZA & PASTA ---
  {
    canonicalName: "The Pizza Company Super Deluxe",
    localName: "ភីហ្សាស៊ូពើដឺលុច្ស ភីហ្សាខមភេនី",
    description: "ភីហ្សាមុខពេញ Pepperoni សាច់ក្រកជ្រូក ផ្សិត ម្ទេសប្លោក និងឈីស Mozzarella",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.ITALIAN,
    spice: 0,
    price: 13.50,
  },
  {
    canonicalName: "Seafood Cocktail Pan Pizza",
    localName: "ភីហ្សាគ្រឿងសមុទ្រស្រស់សំបកក្រាស់",
    description: "ភីហ្សាបង្គា មឹក ក្តាម ទឹកជ្រលក់ Thousand Island និងឈីសរលាយ",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.ITALIAN,
    spice: 0,
    price: 14.50,
  },
  {
    canonicalName: "Spaghetti Bolognese Beef Sauce",
    localName: "ស្ប៉ាហ្គេទីសាច់គោទឹកប៉េងប៉ោះ",
    description: "មីស្ប៉ាហ្គេទីអ៊ីតាលី ឆាជាមួយទឹកជ្រលក់សាច់គោចិញ្ច្រាំ និងប៉េងប៉ោះស្រស់",
    categoryCode: "FOOD_NOODLES_KUYTEAV",
    cuisineCode: CUISINE_MAP.ITALIAN,
    spice: 0,
    price: 5.80,
  },

  // --- KHMER NOODLES & TRADITIONAL ---
  {
    canonicalName: "Phnom Penh Kuyteav Special",
    localName: "គុយទាវភ្នំពេញពិសេសទឹកស៊ុបឆ្អឹង",
    description: "គុយទាវសរសៃស្រស់ ទឹកស៊ុបឆ្អឹងជ្រូកផ្អែមឈ្ងុយ ប្រហិត សាច់ជ្រូក ថ្លើម និងបង្គា",
    categoryCode: "FOOD_NOODLES_KUYTEAV",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 3.50,
  },
  {
    canonicalName: "Kuyteav Beef Shank & Tendon",
    localName: "គុយទាវសាច់គោប្រហិត និងសរសៃពួរ",
    description: "គុយទាវទឹកស៊ុបសាច់គោខាប់ មានសាច់គោស្រស់ សរសៃពួរផុយ និងប្រហិតសាច់គោ",
    categoryCode: "FOOD_NOODLES_KUYTEAV",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 3.80,
  },
  {
    canonicalName: "Bai Sach Chrouk Charcoal Grilled",
    localName: "បាយសាច់ជ្រូកអាំងធ្យូង ពងទាចៀន",
    description: "បាយក្តៅៗ សាច់ជ្រូកប្រឡាក់ខ្ទិះដូងអាំងលើភ្លើងធ្យូង ពងទាចៀន និងជ្រក់ត្រសក់",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.25,
  },
  {
    canonicalName: "Beef Lok Lak Kampot Pepper",
    localName: "ឡុកឡាក់សាច់គោម្រេចខ្មៅកំពត",
    description: "សាច់គោផុយឆាទឹកជ្រលក់ឡុកឡាក់ ញ៉ាំជាមួយបាយឆាពងមាន់ និងទឹកម្រេចក្រូចឆ្មា",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 5.50,
  },
  {
    canonicalName: "Steamed River Fish Amok",
    localName: "អាម៉ុកត្រីរ៉ស់ស្លឹកញរខ្ទិះដូង",
    description: "អាម៉ុកត្រីរ៉ស់ខ្ទិះដូងគ្រឿងការីខ្មែរ ចំហុយក្នុងកន្ទោងស្លឹកចេក ឈ្ងុយឆ្ងាញ់ជាប់មាត់",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 1,
    price: 5.00,
  },
  {
    canonicalName: "Samlor Machu Kroeung Beef Soup",
    localName: "សម្លម្ជូរគ្រឿងសាច់គោត្រកួន",
    description: "សម្លម្ជូរគ្រឿងបុកខ្មែរ សាច់គោទន់ ត្រកួនស្រស់ ទឹកសម្លជូរអែមឈ្ងុយស្លឹកក្រូចសើច",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 1,
    price: 4.50,
  },
  {
    canonicalName: "Traditional Samlor Korko",
    localName: "សម្លកកូរខ្មែរដើមទ្រូង",
    description: "សម្លកកូរចម្រុះបន្លែស្រស់ៗ សាច់ត្រី និងសាច់ជ្រូកបីជាន់ ឈ្ងុយអង្ករលីង និងប្រហុកខ្មែរ",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 4.50,
  },
  {
    canonicalName: "Banh Chao Khmer Crispy Crepe",
    localName: "នំបាញ់ឆែវស្រួយខ្មែរ",
    description: "នំបាញ់ឆែវសំបកស្រួយពណ៌លឿងរមៀត ស្នូលសាច់ជ្រូក សណ្តែកបណ្តុះ ញ៉ាំជាមួយបន្លែស្រស់",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 0,
    price: 2.80,
  },

  // --- JAPANESE & KOREAN ---
  {
    canonicalName: "Fresh Salmon Sashimi Box",
    localName: "សាម៉ុនស្រស់ណ័រវេស ៥ ដុំ",
    description: "សាច់ត្រីសាម៉ុនស្រស់បន្ទះក្រាស់ ញ៉ាំជាមួយទឹកស៊ីអ៊ីវជប៉ុន និងវ៉ាសាប៊ី",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.JAPANESE,
    spice: 0,
    price: 6.50,
  },
  {
    canonicalName: "Tonkotsu Rich Pork Ramen",
    localName: "រ៉ាមេនទឹកស៊ុបឆ្អឹងជ្រូកតុងខុតស៊ូ",
    description: "មីរ៉ាមេនជប៉ុន ទឹកស៊ុបខាប់ មានសាច់ជ្រូកចាស្យូផុយ ស៊ុតជប៉ុន និងសារ៉ាយ",
    categoryCode: "FOOD_NOODLES_KUYTEAV",
    cuisineCode: CUISINE_MAP.JAPANESE,
    spice: 0,
    price: 5.80,
  },
  {
    canonicalName: "Korean Pork Belly BBQ Set",
    localName: "ឈុតសាច់ជ្រូកបីជាន់អាំងបែបកូរ៉េ (Samgyeopsal)",
    description: "សាច់ជ្រូកបីជាន់អាំងស្រួយ ញ៉ាំជាមួយស្លឹកសាឡាដ គីមឈី និងទឹកជ្រលក់ Ssamjang",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.KOREAN,
    spice: 0,
    price: 11.50,
  },
  {
    canonicalName: "Kimchi Jjigae Pork Stew",
    localName: "ស៊ុបគីមឈីសាច់ជ្រូកក្តៅហុយៗ",
    description: "ស៊ុបគីមឈីរសជាតិដិត មានសាច់ជ្រូក តៅហ៊ូទន់ ញ៉ាំជាមួយបាយក្តៅៗ",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KOREAN,
    spice: 2,
    price: 5.50,
  },

  // --- SEAFOOD & GRILL ---
  {
    canonicalName: "Charcoal Grilled River Lobster",
    localName: "បង្កងប៉ាកទន្លេអាំងទឹកត្រីកោះកុង",
    description: "បង្កងប៉ាកទន្លេស្រស់អាំងភ្លើងធ្យូង មានខ្លាញ់ក្បាលឈ្ងុយ ញ៉ាំជាមួយទឹកជ្រលក់កោះកុង",
    categoryCode: "FOOD_STREET_BITES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 3,
    price: 14.00,
  },
  {
    canonicalName: "Stir-Fried Squid Green Peppercorn",
    localName: "មឹកស្រស់ឆាម្រេចខ្ចីកំពត",
    description: "មឹកសមុទ្រស្រស់សាច់ស្រួយ ឆាជាមួយម្រេចខ្ចីកំពតឈ្ងុយហឹរស្រទន់",
    categoryCode: "FOOD_RICE_DISHES",
    cuisineCode: CUISINE_MAP.KHMER,
    spice: 1,
    price: 6.50,
  }
];

async function seedCleanRealisticStoreMenus() {
  console.log("🚀 Starting clean, category-tailored real menu seeding for Phnom Penh...");

  // 1. Fetch all existing foods across all pages
  const foodMap = new Map();
  let foodPage = 0;
  while (true) {
    const res = await fetch(`${API_BASE}/foods?page=${foodPage}&size=50`, { headers }).then(r => r.json());
    const list = res.contents || res.content || [];
    if (list.length === 0) break;
    for (const f of list) {
      foodMap.set(f.canonicalName.toLowerCase(), f);
    }
    foodPage++;
    if (foodPage >= (res.totalPages || 1)) break;
  }
  console.log(`Food Catalog contains ${foodMap.size} recipes.`);

  // 2. Ensure all ALL_MASTER_RECIPES exist
  for (const item of ALL_MASTER_RECIPES) {
    const key = item.canonicalName.toLowerCase();
    if (!foodMap.has(key)) {
      try {
        const createRes = await fetch(`${API_BASE}/admin/foods`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            canonicalName: item.canonicalName,
            localName: item.localName,
            description: item.description,
            categoryCode: item.categoryCode,
            cuisineCode: item.cuisineCode,
            defaultSpiceLevel: item.spice || 0,
            active: true
          })
        }).then(r => r.json());

        if (createRes.uuid) {
          foodMap.set(key, createRes);
          console.log(`+ Created Master Food: "${item.canonicalName}" (${createRes.uuid})`);
        }
      } catch (err) {
        console.error("Error creating food:", item.canonicalName, err.message);
      }
    }
  }

  // 3. Load all stores
  let allStores = [];
  let storePage = 0;
  while (true) {
    const sRes = await fetch(`${API_BASE}/admin/stores?page=${storePage}&size=100`, { headers }).then(r => r.json());
    const stores = sRes.contents || sRes.content || [];
    if (stores.length === 0) break;
    allStores.push(...stores);
    storePage++;
    if (storePage >= (sRes.totalPages || 10)) break;
  }
  console.log(`Loaded ${allStores.length} stores.`);

  // 4. For each store, clean up existing duplicates and seed pure realistic items
  let totalCreated = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < allStores.length; i += BATCH_SIZE) {
    const batch = allStores.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (store) => {
      const nameLower = (store.storeName || store.name || "").toLowerCase();

      // Check current items on this store
      let currentItems = [];
      try {
        const searchRes = await fetch(`${API_BASE}/discovery/menu-items/search?page=0&size=100`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeUuid: store.uuid })
        }).then(r => r.json());
        currentItems = searchRes.contents || [];
      } catch (e) {
        // ignore
      }

      // If store has duplicate items (more than 1 item with same name), delete all duplicates
      if (currentItems.length > 0) {
        const seenNames = new Set();
        for (const item of currentItems) {
          if (seenNames.has(item.name)) {
            // delete duplicate
            try {
              await fetch(`${API_BASE}/admin/menu-items/${item.menuItemUuid}`, {
                method: "DELETE",
                headers
              });
            } catch (e) {}
          } else {
            seenNames.add(item.name);
          }
        }
      }

      // Determine the exact shop category & select appropriate items
      let targetList = [];

      if (nameLower.includes("fruit") || nameLower.includes("juice") || nameLower.includes("smoothie") || nameLower.includes("ផ្លែឈើ")) {
        // Pure Juice & Fruit Shop
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.categoryCode === "DRINK_FRESH_JUICE_SHAKES" ||
          r.categoryCode === "DRINK_SOFT_SODA" ||
          r.canonicalName.includes("Smoothie") ||
          r.canonicalName.includes("Juice")
        );
      } else if (nameLower.includes("brown") || nameLower.includes("starbucks") || nameLower.includes("amazon") || nameLower.includes("tube") || nameLower.includes("coffee") || nameLower.includes("cafe") || nameLower.includes("កាហ្វេ")) {
        // Cafe & Coffee Shop
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.categoryCode === "DRINK_KHMER_COFFEE" ||
          r.canonicalName.includes("Croissant") ||
          r.canonicalName.includes("Cheesecake") ||
          r.canonicalName.includes("Latte") ||
          r.canonicalName.includes("Coffee")
        );
      } else if (nameLower.includes("koi") || nameLower.includes("gong cha") || nameLower.includes("gongcha") || nameLower.includes("tea") || nameLower.includes("cha") || nameLower.includes("តែ")) {
        // Boba & Tea Shop
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.categoryCode === "DRINK_MILK_TEA_HERBAL" ||
          r.canonicalName.includes("Tea")
        );
      } else if (nameLower.includes("bayon") || nameLower.includes("breadtalk") || nameLower.includes("tous") || nameLower.includes("bakery") || nameLower.includes("cake") || nameLower.includes("នំប៉័ង")) {
        // Bakery & Pastry Shop
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.categoryCode === "FOOD_DESSERT_SWEETS" ||
          r.canonicalName.includes("Bun") ||
          r.canonicalName.includes("Croissant") ||
          r.canonicalName.includes("Cheesecake") ||
          r.canonicalName.includes("Bread")
        );
      } else if (nameLower.includes("burger")) {
        // Burger Shop
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.canonicalName.includes("Burger") ||
          r.canonicalName.includes("Fries")
        );
      } else if (nameLower.includes("pizza") || nameLower.includes("spaghetti") || nameLower.includes("pasta")) {
        // Pizza & Western
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.canonicalName.includes("Pizza") ||
          r.canonicalName.includes("Spaghetti")
        );
      } else if (nameLower.includes("kuyteav") || nameLower.includes("គុយទាវ") || nameLower.includes("noodle") || nameLower.includes("soup") || nameLower.includes("pho")) {
        // Kuyteav & Noodle Shop
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.categoryCode === "FOOD_NOODLES_KUYTEAV" ||
          r.canonicalName.includes("Kuyteav") ||
          r.canonicalName.includes("Tea")
        );
      } else if (nameLower.includes("bbq") || nameLower.includes("អាំង") || nameLower.includes("grill") || nameLower.includes("seafood") || nameLower.includes("គ្រឿងសមុទ្រ")) {
        // Seafood & BBQ Grill
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.canonicalName.includes("Lobster") ||
          r.canonicalName.includes("Squid") ||
          r.canonicalName.includes("Prawn") ||
          r.canonicalName.includes("Lok Lak") ||
          r.canonicalName.includes("BBQ")
        );
      } else if (nameLower.includes("sushi") || nameLower.includes("ramen") || nameLower.includes("japanese")) {
        // Japanese
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.canonicalName.includes("Salmon") ||
          r.canonicalName.includes("Ramen")
        );
      } else if (nameLower.includes("bonchon") || nameLower.includes("chicken") || nameLower.includes("korean")) {
        // Korean
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.canonicalName.includes("Bonchon") ||
          r.canonicalName.includes("Korean") ||
          r.canonicalName.includes("Kimchi")
        );
      } else {
        // Traditional Khmer Restaurant
        targetList = ALL_MASTER_RECIPES.filter(r =>
          r.cuisineCode === CUISINE_MAP.KHMER &&
          (r.categoryCode === "FOOD_RICE_DISHES" || r.categoryCode === "FOOD_NOODLES_KUYTEAV" || r.categoryCode === "FOOD_STREET_BITES")
        );
      }

      // If store currently has 0 or few items, add all target recipes
      const existingNames = new Set(currentItems.map(it => it.name?.toLowerCase()));
      for (const recipe of targetList) {
        const itemFullName = `${recipe.localName} (${recipe.canonicalName})`;
        if (!existingNames.has(itemFullName.toLowerCase())) {
          const food = foodMap.get(recipe.canonicalName.toLowerCase());
          if (food && food.uuid) {
            try {
              await fetch(`${API_BASE}/admin/stores/${store.uuid}/menu-items`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  foodUuid: food.uuid,
                  menuItem: {
                    name: itemFullName,
                    description: recipe.description,
                    price: recipe.price,
                    currencyCode: "USD",
                    preparationTimeMinutes: 10,
                    availabilityStatus: "AVAILABLE",
                    ingredientDataStatus: "COMPLETE",
                    isFeatured: Math.random() > 0.6,
                    source: "MANUAL"
                  }
                })
              });
              totalCreated++;
            } catch (e) {}
          }
        }
      }
    }));

    const progress = Math.min(i + BATCH_SIZE, allStores.length);
    if (progress % 50 === 0 || progress === allStores.length) {
      console.log(`[Progress ${progress}/${allStores.length}] Seeded unique items: ${totalCreated}`);
    }
  }

  console.log("=========================================");
  console.log("🎉 REAL MENU SEEDING COMPLETED!");
  console.log(`Total Unique Menu Items Added: ${totalCreated}`);
  console.log("=========================================");
}

seedCleanRealisticStoreMenus().catch(console.error);
