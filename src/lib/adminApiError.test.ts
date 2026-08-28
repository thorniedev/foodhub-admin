import { describe, expect, it } from "vitest";

import { isEndpointUnavailable } from "./adminApiError";

describe("adminApiError", () => {
  it("treats RTK parsing errors with a 404 backend status as unavailable", () => {
    expect(
      isEndpointUnavailable({
        status: "PARSING_ERROR",
        originalStatus: 404,
        data: "Resource has not been found",
      }),
    ).toBe(true);
  });

  it("treats backend 404 messages as unavailable even when the wrapper is opaque", () => {
    expect(
      isEndpointUnavailable({
        status: 500,
        data: { message: "Resource has not been found" },
      }),
    ).toBe(true);
  });
});
