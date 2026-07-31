// export type FilterGroupKey =
//   | "sort"
//   | "time"
//   | "distance"
//   | "category"
//   | "diet"
//   | "price"
//   | "age";

// export interface FilterOption {
//   id: string;
//   groupKey: FilterGroupKey;
//   label: string;
//   value: string;
//   order: number;
//   active: boolean;
// }

// export interface FilterGroupMeta {
//   key: FilterGroupKey;
//   label: string;
//   description: string;
// }

// export const FILTER_GROUPS: FilterGroupMeta[] = [
//   { key: "sort", label: "ការតម្រៀប", description: "ជម្រើសសម្រាប់តម្រៀបលទ្ធផល" },
//   { key: "time", label: "ពេលវេលាញាំ", description: "ស្លាកពេលវេលានៃថ្ងៃ" },
//   { key: "distance", label: "ចម្ងាយ", description: "ចម្ងាយពីទីតាំងអតិថិជន" },
//   { key: "category", label: "ប្រភេទចំណីអាហារ", description: "ប្រភេទម្ហូបនានា" },
//   { key: "diet", label: "របបអាហារ", description: "ស្លាករបបអាហារពិសេស" },
//   { key: "price", label: "តម្លៃ", description: "កម្រិតតម្លៃ" },
//   { key: "age", label: "អាហារតាមវ័យ", description: "ក្រុមអាយុគោលដៅ" },
// ];
export type FilterGroupKey =
  | "sort"
  | "time"
  | "distance"
  | "category"
  | "diet"
  | "price"
  | "age"
  | "cuisine"
  | "allergen"
  | "spice"
  | "prepTime"
  | "season"
  | "festival"
  | "popularProvince"
  | "weather"
  | "originProvince";

export interface FilterOption {
  id: string;
  groupKey: FilterGroupKey;
  label: string;
  value: string;
  order: number;
  active: boolean;
}

export interface FilterGroupMeta {
  key: FilterGroupKey;
  label: string;
  description: string;
}

export const FILTER_GROUPS: FilterGroupMeta[] = [
  { key: "sort", label: "ការតម្រៀប", description: "ជម្រើសសម្រាប់តម្រៀបលទ្ធផល" },
  { key: "time", label: "ពេលទទួលបាន", description: "ស្លាកពេលវេលានៃថ្ងៃ" },
  { key: "distance", label: "ចម្ងាយ", description: "ចម្ងាយពីទីតាំងអតិថិជន" },
  { key: "category", label: "ប្រភេទម្ហូប", description: "ប្រភេទម្ហូបនានា" },
  { key: "diet", label: "របបអាហារ", description: "ស្លាករបបអាហារពិសេស" },
  { key: "price", label: "តម្លៃ", description: "កម្រិតតម្លៃ" },
  { key: "age", label: "ក្រុមអាយុ", description: "ក្រុមអាយុគោលដៅ" },
  { key: "cuisine", label: "ម្ហូបតាមប្រទេស", description: "ប្រភេទម្ហូបតាមប្រទេសដើម" },
  { key: "allergen", label: "មិនរួមបញ្ចូលអាឡែស៊ី", description: "ស្លាកសម្រាប់ច្រោះអាឡែស៊ី" },
  { key: "spice", label: "កម្រិតហឹរ", description: "កម្រិតហឹរនៃម្ហូប" },
  { key: "prepTime", label: "ពេលរៀបចំ", description: "រយៈពេលរៀបចំ/ដឹកជញ្ជូនកម្រិត" },
  { key: "season", label: "រដូវកាលនៅកម្ពុជា", description: "ម្ហូបតាមរដូវកាលនៅកម្ពុជា" },
  { key: "festival", label: "ពិធីបុណ្យ និងព្រឹត្តិការណ៍", description: "ម្ហូបពិសេសសម្រាប់ពិធីបុណ្យ" },
  { key: "popularProvince", label: "ពេញនិយមតាមខេត្ត", description: "ម្ហូបពេញនិយមតាមខេត្តនីមួយៗ" },
  { key: "weather", label: "សមស្របតាមអាកាសធាតុ", description: "ម្ហូបសមស្របតាមអាកាសធាតុ" },
  { key: "originProvince", label: "ប្រភពដើមតាមខេត្ត", description: "ប្រភពដើមចម្ការ/ខេត្តរបស់ម្ហូប" },
];