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
