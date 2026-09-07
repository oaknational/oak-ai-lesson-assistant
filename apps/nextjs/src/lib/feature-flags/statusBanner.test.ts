import {
  DEFAULT_STATUS_BANNER_PAYLOAD,
  parseStatusBannerPayload,
} from "./statusBanner";

describe("parseStatusBannerPayload", () => {
  it("returns the default when the flag carries no payload", () => {
    expect(parseStatusBannerPayload(undefined)).toEqual(
      DEFAULT_STATUS_BANNER_PAYLOAD,
    );
    expect(parseStatusBannerPayload(null)).toEqual(
      DEFAULT_STATUS_BANNER_PAYLOAD,
    );
  });

  it("returns a valid payload unchanged", () => {
    const payload = {
      messageBefore: "Aila is having problems, check",
      linkText: "the status page",
      href: "https://status.thenational.academy/",
      messageAfter: "for updates.",
    };

    expect(parseStatusBannerPayload(payload)).toEqual(payload);
  });

  it("defaults messageAfter when it is omitted", () => {
    expect(
      parseStatusBannerPayload({
        messageBefore: "Something is wrong, see",
        linkText: "our status page",
        href: "https://status.thenational.academy/",
      }),
    ).toEqual({
      messageBefore: "Something is wrong, see",
      linkText: "our status page",
      href: "https://status.thenational.academy/",
      messageAfter: "",
    });
  });

  // Someone will edit this payload by hand while an incident is live. A mistake
  // should fall back to the default message, never hide the banner.
  it.each([
    ["a string instead of an object", "we are down"],
    ["a missing href", { messageBefore: "a", linkText: "b" }],
    [
      "an href that is not a URL",
      { messageBefore: "a", linkText: "b", href: "nope" },
    ],
    [
      "empty link text",
      { messageBefore: "a", linkText: "", href: "https://example.com" },
    ],
    ["an empty object", {}],
  ])("falls back to the default given %s", (_description, value) => {
    expect(parseStatusBannerPayload(value)).toEqual(
      DEFAULT_STATUS_BANNER_PAYLOAD,
    );
  });
});
