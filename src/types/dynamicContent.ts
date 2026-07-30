export type FilterGroupKey =
  | "sort"
  | "time"
  | "distance"
  | "category"
  | "diet"
  | "price"
  | "age";

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
  { key: "time", label: "ពេលវេលាញាំ", description: "ស្លាកពេលវេលានៃថ្ងៃ" },
  { key: "distance", label: "ចម្ងាយ", description: "ចម្ងាយពីទីតាំងអតិថិជន" },
  { key: "category", label: "ប្រភេទចំណីអាហារ", description: "ប្រភេទម្ហូបនានា" },
  { key: "diet", label: "របបអាហារ", description: "ស្លាករបបអាហារពិសេស" },
  { key: "price", label: "តម្លៃ", description: "កម្រិតតម្លៃ" },
  { key: "age", label: "អាហារតាមវ័យ", description: "ក្រុមអាយុគោលដៅ" },
];
