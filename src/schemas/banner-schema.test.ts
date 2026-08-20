import { describe, expect, it } from "vitest";
import {
  BANNER_IMAGE_MAX_SIZE_BYTES,
  createBannerSchema,
  updateBannerSchema,
} from "./banner-schema";

function makeImageFile(
  options: { type?: string; sizeBytes?: number; name?: string } = {},
): File {
  const { type = "image/png", sizeBytes = 1024, name = "banner.png" } =
    options;
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

const baseValid = {
  category: "MAIN" as const,
  title: "Weekend Special",
  location: undefined,
  description: undefined,
};

describe("createBannerSchema", () => {
  it("accepts a valid MAIN banner", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "MAIN",
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid POPULAR banner", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "POPULAR",
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid SEASON banner", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "SEASON",
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("requires location for LOCATION category", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "LOCATION",
      location: undefined,
      image: makeImageFile(),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const locationIssue = result.error.issues.find(
        (issue) => issue.path[0] === "location",
      );
      expect(locationIssue).toBeDefined();
    }
  });

  it("accepts LOCATION category when location is provided", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "LOCATION",
      location: "Siem Reap",
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("permits a null/undefined location for non-LOCATION categories", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "MAIN",
      location: undefined,
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a blank (whitespace-only) title", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      title: "   ",
      image: makeImageFile(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a title over 255 characters", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      title: "a".repeat(256),
      image: makeImageFile(),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a title at exactly 255 characters", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      title: "a".repeat(255),
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a location over 100 characters", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      category: "LOCATION",
      location: "a".repeat(101),
      image: makeImageFile(),
    });
    expect(result.success).toBe(false);
  });

  it("requires an image on create", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      image: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported image MIME type", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      image: makeImageFile({ type: "image/svg+xml" }),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized image", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      image: makeImageFile({ sizeBytes: BANNER_IMAGE_MAX_SIZE_BYTES + 1 }),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty (zero-byte) file", () => {
    const result = createBannerSchema.safeParse({
      ...baseValid,
      image: makeImageFile({ sizeBytes: 0 }),
    });
    expect(result.success).toBe(false);
  });

  it("accepts every backend-supported image MIME type", () => {
    for (const type of ["image/png", "image/jpeg", "image/gif", "image/webp"]) {
      const result = createBannerSchema.safeParse({
        ...baseValid,
        image: makeImageFile({ type }),
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateBannerSchema", () => {
  it("does not require an image on update", () => {
    const result = updateBannerSchema.safeParse({
      ...baseValid,
      image: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("still requires location for LOCATION category on update", () => {
    const result = updateBannerSchema.safeParse({
      ...baseValid,
      category: "LOCATION",
      location: undefined,
      image: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a replacement image when provided", () => {
    const result = updateBannerSchema.safeParse({
      ...baseValid,
      image: makeImageFile(),
    });
    expect(result.success).toBe(true);
  });

  it("still rejects an unsupported MIME type when a replacement image is provided", () => {
    const result = updateBannerSchema.safeParse({
      ...baseValid,
      image: makeImageFile({ type: "application/pdf" }),
    });
    expect(result.success).toBe(false);
  });
});
