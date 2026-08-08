import type { GooglePlaceResult, Store, StoreHour } from "@/src/types/shop";

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
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 4 ? "$".repeat(n) : String(value);
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
