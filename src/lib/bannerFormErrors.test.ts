import { describe, expect, it } from "vitest";
import { resolveBannerFormError } from "./bannerFormErrors";

describe("resolveBannerFormError", () => {
  it("maps backend fieldErrors onto matching form fields", () => {
    const error = {
      status: 400,
      data: {
        status: 400,
        errorCode: "VALIDATION_FAILED",
        message: "Request validation failed",
        fieldErrors: {
          title: "Banner title is required",
          location: "Location must not exceed 100 characters",
        },
      },
    };

    const result = resolveBannerFormError(error);

    expect(result.fieldErrors.title).toBe("Banner title is required");
    expect(result.fieldErrors.location).toBe(
      "Location must not exceed 100 characters",
    );
  });

  it("ignores fieldErrors keys that are not real form fields", () => {
    const error = {
      status: 400,
      data: {
        message: "Request validation failed",
        fieldErrors: { someUnrelatedField: "nope" },
      },
    };

    const result = resolveBannerFormError(error);

    expect(Object.keys(result.fieldErrors)).toHaveLength(0);
  });

  it("best-effort maps a plain BadRequestException message to the location field", () => {
    const error = {
      status: 400,
      data: { message: "Location is required for LOCATION banner" },
    };

    const result = resolveBannerFormError(error);

    expect(result.fieldErrors.location).toBe(
      "Location is required for LOCATION banner",
    );
  });

  it("best-effort maps a plain BadRequestException message to the image field", () => {
    const error = {
      status: 400,
      data: { message: "Image is required for MAIN banner" },
    };

    const result = resolveBannerFormError(error);

    expect(result.fieldErrors.image).toBe("Image is required for MAIN banner");
  });

  it("always returns a human-readable form-level message", () => {
    const error = { status: 500, data: { message: "Unexpected server error" } };

    const result = resolveBannerFormError(error);

    expect(result.formMessage).toBeTruthy();
  });
});
