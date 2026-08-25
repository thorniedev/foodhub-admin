import { describe, expect, it } from "vitest";

import { resolveFoodHubCatalogImageUrl } from "./resolveFoodHubImageUrl";
import { storeCoverCandidate, storeLogoCandidate } from "./shopFormat";
import type { Store } from "@/src/types/shop";

const baseStore = {
  uuid: "store-1",
  storeName: "Sovann Kitchen",
  description: null,
  addressLine: "Street 360",
  commune: null,
  district: null,
  city: "Phnom Penh",
  province: null,
  countryCode: "KH",
  postalCode: null,
  timezone: "Asia/Phnom_Penh",
  latitude: 11.55,
  longitude: 104.92,
  phoneNumber: null,
  email: null,
  logoMediaUuid: null,
  coverMediaUuid: null,
  logoUrl: null,
  coverImageUrl: null,
  priceLevel: null,
  hygieneRating: null,
  averageRating: 0,
  totalReviews: 0,
  reviewStatus: "APPROVED",
  operatingStatus: "OPEN",
  accountStatus: "ACTIVE",
  isOpenNow: true,
  socialLinks: [],
  openingHours: [],
  externalSource: null,
} satisfies Store;

describe("store media helpers", () => {
  it("finds nested logo and cover media candidates", () => {
    const store = {
      ...baseStore,
      logoMedia: {
        accessUrl: "https://cdn.example.test/logo.webp",
      },
      coverMedia: {
        uuid: "11111111-1111-4111-8111-111111111111",
      },
    } as Store;

    expect(storeLogoCandidate(store)).toBe("https://cdn.example.test/logo.webp");
    expect(storeCoverCandidate(store)).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("resolves bare media UUIDs to the image file endpoint", () => {
    expect(
      resolveFoodHubCatalogImageUrl("22222222-2222-4222-8222-222222222222"),
    ).toBe("/api/media/22222222-2222-4222-8222-222222222222/file");
    expect(
      resolveFoodHubCatalogImageUrl("api/media/33333333-3333-4333-8333-333333333333"),
    ).toBe("/api/media/33333333-3333-4333-8333-333333333333/file");
  });
});
