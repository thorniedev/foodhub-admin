import type { GooglePlaceResult, Store, StoreHour } from "@/src/types/shop";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const IMAGE_EXTENSION_REGEX = /\.(avif|gif|jpe?g|png|svg|webp)([?#].*)?$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUsableImageCandidate(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return (
    UUID_REGEX.test(trimmed) ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("api/") ||
    IMAGE_EXTENSION_REGEX.test(trimmed)
  );
}

function firstImageCandidate(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (isUsableImageCandidate(trimmed)) return trimmed;
      continue;
    }

    if (Array.isArray(value)) {
      const nested = firstImageCandidate(...value);
      if (nested) return nested;
      continue;
    }

    if (!isRecord(value)) continue;

    const nested = firstImageCandidate(
      value.url,
      value.accessUrl,
      value.fileUrl,
      value.downloadUrl,
      value.previewUrl,
      value.imageUrl,
      value.thumbnailUrl,
      value.mediaUrl,
      value.uuid,
      value.mediaUuid,
      value.image,
      value.media,
    );

    if (nested) return nested;
  }

  return null;
}

export function displayStoreLocation(store: Store): string {
  return [store.addressLine, store.commune, store.district, store.city, store.province]
    .filter(Boolean)
    .join(", ");
}

export function storeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ST");
}

export function formatRating(value: number | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : "—";
}

export function formatPriceLevel(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "មិនបានកំណត់";
  const n = Number(value);
  switch (n) {
    case 1:
      return "កម្រិតទាប (ថោក)";
    case 2:
      return "កម្រិតមធ្យម (សមរម្យ)";
    case 3:
      return "កម្រិតខ្ពស់ (ថ្លៃ)";
    case 4:
      return "កម្រិតប្រណិត (ថ្លៃខ្លាំង)";
    default:
      return String(value);
  }
}

export function formatDayOfWeek(day: number | null | undefined): string {
  return ({1:"Monday",2:"Tuesday",3:"Wednesday",4:"Thursday",5:"Friday",6:"Saturday",7:"Sunday"} as Record<number,string>)[day ?? 0] ?? "—";
}

export function formatStoreHour(hour: StoreHour): string {
  return hour.isClosed ? "Closed" : `${hour.openingTime ?? "—"} – ${hour.closingTime ?? "—"}`;
}

export function imageUrlOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

export function storeLogoCandidate(store: Store): string | null {
  const record = store as Store & Record<string, unknown>;

  return firstImageCandidate(
    store.logoMediaUuid,
    store.logoUrl,
    record.logo,
    record.logoUrl,
    record.logoMedia,
    record.logoMediaUuid,
    record.profileImageUrl,
    record.profileImage,
    record.profilePicture,
    record.thumbnailMediaUuid,
    record.thumbnailUrl,
    record.thumbnail,
    record.avatarMediaUuid,
    record.avatarUrl,
    record.avatar,
    record.imageUrl,
    record.image,
    record.images,
    record.primaryMediaUuid,
    record.primaryMediaUuids,
    record.primaryMediaUrls,
    record.media,
    record.mediaFiles,
    store.coverMediaUuid,
    store.coverImageUrl,
    record.cover,
    record.coverMedia,
    isRecord(store.externalSource) ? store.externalSource.photos : null,
    isRecord(store.externalSource) ? store.externalSource.photoUrls : null,
  );
}

export function storeCoverCandidate(store: Store): string | null {
  const record = store as Store & Record<string, unknown>;

  return firstImageCandidate(
    store.coverMediaUuid,
    store.coverImageUrl,
    record.cover,
    record.coverUrl,
    record.coverMedia,
    record.coverMediaUuid,
    record.bannerMediaUuid,
    record.bannerUrl,
    record.imageUrl,
    record.image,
    record.images,
    record.primaryMediaUuid,
    record.primaryMediaUuids,
    record.primaryMediaUrls,
    record.media,
    record.mediaFiles,
    isRecord(store.externalSource) ? store.externalSource.photos : null,
    isRecord(store.externalSource) ? store.externalSource.photoUrls : null,
    store.logoMediaUuid,
    store.logoUrl,
    record.logo,
    record.logoMedia,
  );
}

export interface StoreLiveStatusInfo {
  status: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED" | "PERMANENTLY_CLOSED" | "UNKNOWN";
  label: string;
  note: string;
  isPositive: boolean;
  isWarning: boolean;
  isDanger: boolean;
  colorClass: string;
  bgClass: string;
}

export function getStoreLiveStatus(store?: {
  isOpenNow?: boolean | null;
  operatingStatus?: string | null;
} | null): StoreLiveStatusInfo {
  if (!store) {
    return {
      status: "UNKNOWN",
      label: "មិនមានទិន្នន័យ",
      note: "មិនទាន់កំណត់",
      isPositive: false,
      isWarning: false,
      isDanger: false,
      colorClass: "text-gray-500",
      bgClass: "bg-gray-50",
    };
  }

  const op = String(store.operatingStatus || "").toUpperCase();

  if (op === "PERMANENTLY_CLOSED") {
    return {
      status: "PERMANENTLY_CLOSED",
      label: "បិទជាអចិន្ត្រៃយ៍",
      note: "ហាងបានបិទដំណើរការជាអចិន្ត្រៃយ៍",
      isPositive: false,
      isWarning: false,
      isDanger: true,
      colorClass: "text-red-700",
      bgClass: "bg-red-50",
    };
  }

  if (op === "TEMPORARILY_CLOSED") {
    return {
      status: "TEMPORARILY_CLOSED",
      label: "បិទបណ្តោះអាសន្ន",
      note: "ហាងបិទជាបណ្តោះអាសន្ន",
      isPositive: false,
      isWarning: true,
      isDanger: false,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
    };
  }

  if (op === "CLOSED") {
    return {
      status: "CLOSED",
      label: "បានបិទ",
      note: "ហាងបានបិទដំណើរការ",
      isPositive: false,
      isWarning: false,
      isDanger: true,
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
    };
  }

  if (op === "OPEN") {
    if (store.isOpenNow === false) {
      return {
        status: "CLOSED",
        label: "បិទពេលនេះ",
        note: "ក្រៅម៉ោងដំណើរការ (បើកតាមកាលវិភាគ)",
        isPositive: false,
        isWarning: true,
        isDanger: false,
        colorClass: "text-amber-600",
        bgClass: "bg-amber-50",
      };
    }

    if (store.isOpenNow === true) {
      return {
        status: "OPEN",
        label: "កំពុងបើកដំណើរការ",
        note: "ហាងកំពុងបើកទទួលការកម្ម៉ង់",
        isPositive: true,
        isWarning: false,
        isDanger: false,
        colorClass: "text-[#137A3D]",
        bgClass: "bg-emerald-50",
      };
    }

    return {
      status: "OPEN",
      label: "បើកដំណើរការ",
      note: "ហាងបើកដំណើរការធម្មតា",
      isPositive: true,
      isWarning: false,
      isDanger: false,
      colorClass: "text-[#137A3D]",
      bgClass: "bg-emerald-50",
    };
  }

  return {
    status: "UNKNOWN",
    label: "មិនមានទិន្នន័យ",
    note: "មិនទាន់កំណត់",
    isPositive: false,
    isWarning: false,
    isDanger: false,
    colorClass: "text-gray-500",
    bgClass: "bg-gray-50",
  };
}

export function getStoreReviewStatus(reviewStatus?: string | null): {
  status: string;
  label: string;
  note: string;
  isPositive: boolean;
  isWarning: boolean;
  isDanger: boolean;
  colorClass: string;
  bgClass: string;
} {
  const rv = String(reviewStatus || "").toUpperCase().trim();

  if (rv === "REJECTED" || rv === "REJECT") {
    return {
      status: "REJECTED",
      label: "បានបដិសេធ",
      note: "ពាក្យស្នើសុំត្រូវបានបដិសេធ",
      isPositive: false,
      isWarning: false,
      isDanger: true,
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
    };
  }

  if (rv === "PENDING" || rv === "IN_REVIEW" || rv === "WAITING") {
    return {
      status: "PENDING",
      label: "រង់ចាំពិនិត្យ",
      note: "កំពុងរង់ចាំការពិនិត្យពី Admin",
      isPositive: false,
      isWarning: true,
      isDanger: false,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
    };
  }

  return {
    status: "APPROVED",
    label: "បានអនុម័ត",
    note: "បានអនុម័តដោយ Admin",
    isPositive: true,
    isWarning: false,
    isDanger: false,
    colorClass: "text-[#137A3D]",
    bgClass: "bg-emerald-50",
  };
}

export function getStoreAccountStatus(accountStatus?: string | null): {
  status: string;
  label: string;
  note: string;
  isPositive: boolean;
  isWarning: boolean;
  isDanger: boolean;
  colorClass: string;
  bgClass: string;
} {
  const ac = String(accountStatus || "").toUpperCase().trim();

  if (ac === "SUSPENDED" || ac === "SUSPEND") {
    return {
      status: "SUSPENDED",
      label: "ត្រូវបានផ្អាក",
      note: "គណនីត្រូវបានផ្អាកដោយ Admin",
      isPositive: false,
      isWarning: false,
      isDanger: true,
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
    };
  }

  if (ac === "ARCHIVED" || ac === "ARCHIVE" || ac === "INACTIVE") {
    return {
      status: "ARCHIVED",
      label: "ទុកក្នុងប័ណ្ណសារ",
      note: "គណនីត្រូវបានទុកក្នុងប័ណ្ណសារ",
      isPositive: false,
      isWarning: false,
      isDanger: false,
      colorClass: "text-gray-600",
      bgClass: "bg-gray-100",
    };
  }

  return {
    status: "ACTIVE",
    label: "សកម្ម",
    note: "គណនីកំពុងដំណើរការធម្មតា",
    isPositive: true,
    isWarning: false,
    isDanger: false,
    colorClass: "text-[#137A3D]",
    bgClass: "bg-emerald-50",
  };
}

export function extractGooglePlaceId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ["placeId", "place_id", "id"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return record.data && typeof record.data === "object"
    ? extractGooglePlaceId(record.data)
    : null;
}

export function googleResultTitle(value: GooglePlaceResult, index: number): string {
  for (const key of ["displayName", "name", "formattedAddress", "address"]) {
    const field = value[key];
    if (typeof field === "string" && field.trim()) return field.trim();
    if (field && typeof field === "object" && "text" in field) {
      const text = (field as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) return text.trim();
    }
  }
  return `Google result ${index + 1}`;
}
