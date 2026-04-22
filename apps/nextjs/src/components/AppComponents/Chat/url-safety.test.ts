import { sanitiseUrl } from "./url-safety";

describe("sanitiseUrl", () => {
  describe("safe protocols", () => {
    it("allows https URLs", () => {
      expect(sanitiseUrl("https://example.com")).toBe("https://example.com");
    });

    it("allows http URLs", () => {
      expect(sanitiseUrl("http://example.com")).toBe("http://example.com");
    });

    it("allows mailto URLs", () => {
      expect(sanitiseUrl("mailto:user@example.com")).toBe(
        "mailto:user@example.com",
      );
    });

    it("allows the HubSpot rate limit form URL", () => {
      const url = "https://share.hsforms.com/118hyngR-QSS0J7vZEVlRSgbvumd";
      expect(sanitiseUrl(url)).toBe(url);
    });
  });

  describe("relative URLs", () => {
    it("allows absolute paths", () => {
      expect(sanitiseUrl("/aila")).toBe("/aila");
    });

    it("allows fragment-only URLs", () => {
      expect(sanitiseUrl("#section")).toBe("#section");
    });
  });

  describe("dangerous protocols", () => {
    it("blocks javascript: protocol", () => {
      expect(sanitiseUrl("javascript:alert(1)")).toBeUndefined();
    });

    it("blocks uppercase JAVASCRIPT: protocol", () => {
      expect(sanitiseUrl("JAVASCRIPT:alert(1)")).toBeUndefined();
    });

    it("blocks mixed-case JaVaScRiPt: protocol", () => {
      expect(sanitiseUrl("JaVaScRiPt:alert(1)")).toBeUndefined();
    });

    it("blocks data: URIs", () => {
      expect(
        sanitiseUrl("data:text/html,<script>alert(1)</script>"),
      ).toBeUndefined();
    });

    it("blocks vbscript: protocol", () => {
      expect(sanitiseUrl("vbscript:alert")).toBeUndefined();
    });

    it("blocks whitespace-prefixed javascript: URLs", () => {
      expect(sanitiseUrl("  javascript:alert(1)")).toBeUndefined();
    });

    it("blocks javascript: with embedded newline", () => {
      expect(sanitiseUrl("java\nscript:alert(1)")).toBeUndefined();
    });

    it("blocks file: protocol", () => {
      expect(sanitiseUrl("file:///etc/passwd")).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("returns undefined for undefined", () => {
      expect(sanitiseUrl(undefined)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(sanitiseUrl("")).toBeUndefined();
    });
  });
});
