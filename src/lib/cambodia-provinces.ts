export interface CambodiaProvince {
  code: string;
  nameKh: string;
  nameEn: string;
}

export const CAMBODIA_PROVINCES: CambodiaProvince[] = [
  { code: "PHNOM_PENH", nameKh: "រាជធានីភ្នំពេញ", nameEn: "Phnom Penh" },
  { code: "SIEM_REAP", nameKh: "សៀមរាប", nameEn: "Siem Reap" },
  { code: "BATTAMBANG", nameKh: "បាត់ដំបង", nameEn: "Battambang" },
  { code: "KANDAL", nameKh: "កណ្តាល", nameEn: "Kandal" },
  { code: "PREAH_SIHANOUK", nameKh: "ព្រះសីហនុ", nameEn: "Preah Sihanouk" },
  { code: "KAMPOT", nameKh: "កំពត", nameEn: "Kampot" },
  { code: "KAMPONG_CHAM", nameKh: "កំពង់ចាម", nameEn: "Kampong Cham" },
  { code: "KAMPONG_SPEU", nameKh: "កំពង់ស្ពឺ", nameEn: "Kampong Speu" },
  { code: "KAMPONG_THOM", nameKh: "កំពង់ធំ", nameEn: "Kampong Thom" },
  { code: "KAMPONG_CHHNANG", nameKh: "កំពង់ឆ្នាំង", nameEn: "Kampong Chhnang" },
  { code: "KEP", nameKh: "កែប", nameEn: "Kep" },
  { code: "KOH_KONG", nameKh: "កោះកុង", nameEn: "Koh Kong" },
  { code: "KRATIE", nameKh: "ក្រចេះ", nameEn: "Kratie" },
  { code: "PURSAT", nameKh: "ពោធិ៍សាត់", nameEn: "Pursat" },
  { code: "PREY_VENG", nameKh: "ព្រៃវែង", nameEn: "Prey Veng" },
  { code: "SVAY_RIENG", nameKh: "ស្វាយរៀង", nameEn: "Svay Rieng" },
  { code: "TAKEO", nameKh: "តាកែវ", nameEn: "Takeo" },
  { code: "BANTEAY_MEANCHEY", nameKh: "បន្ទាយមានជ័យ", nameEn: "Banteay Meanchey" },
  { code: "TBOUNG_KHMUM", nameKh: "ត្បូងឃ្មុំ", nameEn: "Tboung Khmum" },
  { code: "PREAH_VIHEAR", nameKh: "ព្រះវិហារ", nameEn: "Preah Vihear" },
  { code: "MONDULKIRI", nameKh: "មណ្ឌលគិរី", nameEn: "Mondulkiri" },
  { code: "RATANAKIRI", nameKh: "រតនគិរី", nameEn: "Ratanakiri" },
  { code: "STUNG_TRENG", nameKh: "ស្ទឹងត្រែង", nameEn: "Stung Treng" },
  { code: "ODDAR_MEANCHEY", nameKh: "ឧត្តរមានជ័យ", nameEn: "Oddar Meanchey" },
  { code: "PAILIN", nameKh: "ប៉ៃលិន", nameEn: "Pailin" },
];

export interface PopularGeoHub {
  nameKh: string;
  nameEn: string;
  lat: number;
  lng: number;
  city: string;
}

export const POPULAR_GEO_HUBS: PopularGeoHub[] = [
  {
    nameKh: "ភ្នំពេញ (កណ្តាលក្រុង)",
    nameEn: "Phnom Penh Center",
    lat: 11.5564,
    lng: 104.9282,
    city: "Phnom Penh",
  },
  {
    nameKh: "បឹងកេងកង ១ (BKK1)",
    nameEn: "Boeung Keng Kang 1",
    lat: 11.5529,
    lng: 104.9256,
    city: "Phnom Penh",
  },
  {
    nameKh: "ផ្សារទួលទំពូង (Russian Market)",
    nameEn: "Toul Tompoung",
    lat: 11.5408,
    lng: 104.9145,
    city: "Phnom Penh",
  },
  {
    nameKh: "ដូនពេញ / មាត់ទន្លេ (Riverside)",
    nameEn: "Daun Penh / Riverside",
    lat: 11.5683,
    lng: 104.9312,
    city: "Phnom Penh",
  },
  {
    nameKh: "ទួលគោក (Toul Kork)",
    nameEn: "Toul Kork",
    lat: 11.5738,
    lng: 104.8967,
    city: "Phnom Penh",
  },
  {
    nameKh: "សៀមរាប (កណ្តាលក្រុង)",
    nameEn: "Siem Reap Center",
    lat: 13.3671,
    lng: 103.8448,
    city: "Siem Reap",
  },
  {
    nameKh: "បាត់ដំបង (កណ្តាលក្រុង)",
    nameEn: "Battambang Center",
    lat: 13.0957,
    lng: 103.2022,
    city: "Battambang",
  },
];

/**
 * Normalizes text for lenient location matching (removes spaces, punctuation, lowercase).
 */
export function normalizeLocationKey(val?: string | null): string {
  if (!val) return "";
  return String(val)
    .toLowerCase()
    .replace(/[\s\-_,./]+/g, "")
    .trim();
}

/**
 * Returns all searchable alias tokens for a given province (English, Khmer with/without prefixes, code).
 */
export function getProvinceSearchAliases(province: CambodiaProvince): string[] {
  const cleanKh = province.nameKh
    .replace(/^រាជធានី\s*/, "")
    .replace(/^ខេត្ត\s*/, "")
    .replace(/^ក្រុង\s*/, "")
    .trim();

  const aliases: string[] = [
    province.code.toLowerCase(),
    province.nameEn.toLowerCase(),
    normalizeLocationKey(province.nameEn),
    province.nameKh,
    cleanKh,
    `ខេត្ត${cleanKh}`,
    `ខេត្ត ${cleanKh}`,
    `ក្រុង${cleanKh}`,
    `ក្រុង ${cleanKh}`,
    `រាជធានី${cleanKh}`,
    `រាជធានី ${cleanKh}`,
    `${province.nameEn.toLowerCase()} province`,
    `${province.nameEn.toLowerCase()} city`,
    `${province.nameEn.toLowerCase()} municipality`,
    `krong ${province.nameEn.toLowerCase()}`,
  ];
  return Array.from(new Set(aliases.filter(Boolean)));
}

/**
 * Checks if a store's location fields (province, city, district, commune, addressLine)
 * match the selected province or city filter.
 */
export function isStoreInProvinceOrCity(
  store: {
    province?: string | null;
    city?: string | null;
    district?: string | null;
    commune?: string | null;
    addressLine?: string | null;
  },
  filterValue: string,
): boolean {
  if (!filterValue || filterValue === "ALL") return true;

  const rawFilter = filterValue.trim();
  const normalizedFilter = normalizeLocationKey(rawFilter);

  // Find if filterValue corresponds to a known CambodiaProvince
  const matchedProvince = CAMBODIA_PROVINCES.find((p) => {
    const aliases = getProvinceSearchAliases(p);
    return (
      p.code.toLowerCase() === rawFilter.toLowerCase() ||
      p.nameEn.toLowerCase() === rawFilter.toLowerCase() ||
      normalizeLocationKey(p.nameEn) === normalizedFilter ||
      p.nameKh === rawFilter ||
      aliases.some(
        (alias) =>
          alias === rawFilter.toLowerCase() ||
          normalizeLocationKey(alias) === normalizedFilter,
      )
    );
  });

  const targetAliases = matchedProvince
    ? getProvinceSearchAliases(matchedProvince)
    : [rawFilter.toLowerCase(), normalizedFilter];

  // Extract all store location text
  const locationFields = [
    store.province,
    store.city,
    store.district,
    store.commune,
    store.addressLine,
  ].filter(Boolean) as string[];

  if (locationFields.length === 0) return false;

  const combinedRaw = locationFields.join(" ").toLowerCase();
  const combinedNormalized = normalizeLocationKey(locationFields.join(" "));

  return targetAliases.some((alias) => {
    const normAlias = normalizeLocationKey(alias);
    if (!alias && !normAlias) return false;
    return (
      combinedRaw.includes(alias) ||
      (normAlias.length >= 3 && combinedNormalized.includes(normAlias))
    );
  });
}

