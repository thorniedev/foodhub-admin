const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = KHMER_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = KHMER_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatDateKhmer(value: string | null | undefined): string {
  return formatDateOnly(value);
}

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;

  const birthDate = new Date(
    dateOfBirth.includes("T") ? dateOfBirth : `${dateOfBirth}T00:00:00`,
  );
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function displayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback: string,
): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatRelationshipKhmer(rel: string | null | undefined): string {
  if (!rel) return "—";
  const normalized = rel.toUpperCase().trim();
  const map: Record<string, string> = {
    SELF: "ខ្លួនឯង",
    PARENT: "ឪពុកម្តាយ",
    CHILD: "កូន",
    SPOUSE: "ប្តី/ប្រពន្ធ",
    SIBLING: "បងប្អូន",
    FRIEND: "មិត្តភក្តិ",
    OTHER: "ផ្សេងទៀត",
  };
  return map[normalized] || humanizeEnum(rel);
}

export function formatGenderKhmer(gender: string | null | undefined): string {
  if (!gender) return "—";
  const normalized = gender.toUpperCase().trim();
  const map: Record<string, string> = {
    MALE: "ប្រុស",
    FEMALE: "ស្រី",
    OTHER: "ផ្សេងទៀត",
  };
  return map[normalized] || humanizeEnum(gender);
}

export function formatLanguageKhmer(lang: string | null | undefined): string {
  if (!lang) return "—";
  const normalized = lang.toUpperCase().trim();
  const map: Record<string, string> = {
    KM: "ភាសាខ្មែរ",
    KHMER: "ភាសាខ្មែរ",
    EN: "ភាសាអង់គ្លេស",
    ENGLISH: "ភាសាអង់គ្លេស",
    ZH: "ភាសាចិន",
    CHINESE: "ភាសាចិន",
  };
  return map[normalized] || lang.toUpperCase();
}

export function formatSeverityKhmer(severity: string | null | undefined): string {
  if (!severity) return "—";
  const normalized = severity.toUpperCase().trim();
  const map: Record<string, string> = {
    MILD: "កម្រិតស្រាល",
    MODERATE: "កម្រិតមធ្យម",
    SEVERE: "កម្រិតធ្ងន់ធ្ងរ",
  };
  return map[normalized] || humanizeEnum(severity);
}

export function formatEnforcementLevelKhmer(level: string | null | undefined): string {
  if (!level) return "—";
  const normalized = level.toUpperCase().trim();
  const map: Record<string, string> = {
    REQUIRED: "តម្រូវការដាច់ខាត",
    PREFERRED: "ចំណង់ចំណូលចិត្ត",
  };
  return map[normalized] || humanizeEnum(level);
}

export function formatAvoidLevelKhmer(level: string | null | undefined): string {
  if (!level) return "—";
  const normalized = level.toUpperCase().trim();
  const map: Record<string, string> = {
    STRICT_BLOCK: "ហាមឃាត់ដាច់ខាត",
    PREFERRED_AVOID: "ជៀសវាង",
  };
  return map[normalized] || humanizeEnum(level);
}

export function formatDietaryCategoryKhmer(cat: string | null | undefined): string {
  if (!cat) return "—";
  const normalized = cat.toUpperCase().trim();
  const map: Record<string, string> = {
    RELIGIOUS: "សាសនា",
    MEDICAL: "វេជ្ជសាស្ត្រ",
    LIFESTYLE: "របៀបរស់នៅ",
  };
  return map[normalized] || humanizeEnum(cat);
}

export function formatSpiceLevelKhmer(spice: string | null | undefined): string {
  if (!spice) return "—";
  const normalized = spice.toUpperCase().trim();
  const map: Record<string, string> = {
    NONE: "មិនហិរ",
    MILD: "ហិរតិចតួច",
    MEDIUM: "ហិរមធ្យម",
    HOT: "ហិរខ្លាំង",
    HIGH: "ហិរខ្លាំង",
    EXTRA_HOT: "ហិរខ្លាំងណាស់",
  };
  return map[normalized] || humanizeEnum(spice);
}

export function formatAgeGroupKhmer(codeOrName: string | null | undefined): string {
  if (!codeOrName) return "—";
  const normalized = codeOrName.toUpperCase().trim();
  const map: Record<string, string> = {
    ADULT: "មនុស្សពេញវ័យ",
    TEEN: "យុវវ័យ",
    TEENAGER: "យុវវ័យ",
    CHILD: "កុមារ",
    TODDLER: "កុមារតូច",
    INFANT: "ទារក",
    BABY: "ទារក",
    SENIOR: "មនុស្សចាស់",
    ELDERLY: "មនុស្សចាស់",
  };
  return map[normalized] || codeOrName;
}
