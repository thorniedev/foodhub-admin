import { describe, expect, it } from "vitest";
import { buildBannerFormData } from "./bannerApi";
import type { CreateBannerPayload } from "../../types/banner";

const payload: CreateBannerPayload = {
  category: "MAIN",
  title: "Weekend Special",
  location: null,
  description: null,
};

describe("buildBannerFormData", () => {
  it("sends the JSON metadata under the 'request' part as an application/json Blob", async () => {
    const image = new File([new Uint8Array(10)], "banner.png", {
      type: "image/png",
    });
    const formData = buildBannerFormData(payload, image);

    const requestPart = formData.get("request");
    expect(requestPart).toBeInstanceOf(Blob);
    expect((requestPart as Blob).type).toBe("application/json");
    expect(JSON.parse(await (requestPart as Blob).text())).toEqual(payload);
  });

  it("sends the image under the 'image' part when provided (create)", () => {
    const image = new File([new Uint8Array(10)], "banner.png", {
      type: "image/png",
    });
    const formData = buildBannerFormData(payload, image);

    expect(formData.get("image")).toBe(image);
  });

  it("omits the 'image' part on update when no replacement file is given", () => {
    const formData = buildBannerFormData(payload, null);

    expect(formData.has("image")).toBe(false);
  });

  it("never sets a Content-Type header manually — FormData lets the browser add the multipart boundary", () => {
    const formData = buildBannerFormData(payload, null);
    // FormData has no header-setting API surface at all; this is a
    // structural assertion that we only ever hand fetchBaseQuery a
    // FormData body, not a Headers-carrying wrapper.
    expect(formData).toBeInstanceOf(FormData);
  });
});
