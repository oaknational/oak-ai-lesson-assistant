import { containsLink } from "./link-validation";

describe("containsLink", () => {
  it("detects HTTP URL", () => {
    expect(containsLink("Visit http://example.com")).toBe(true);
  });

  it("detects HTTPS URL", () => {
    expect(containsLink("Check this out https://example.com")).toBe(true);
  });

  it("detects URL with path, query params and fragment", () => {
    expect(
      containsLink("Link: https://example.com/path?foo=bar&baz=qux#top"),
    ).toBe(true);
  });

  it("does not match bare domain without protocol", () => {
    expect(containsLink("Visit example.com")).toBe(false);
  });

  it("returns false for empty or whitespace input", () => {
    expect(containsLink("")).toBe(false);
    expect(containsLink("   ")).toBe(false);
    expect(containsLink("\n\n\n")).toBe(false);
  });

  it("returns false for lesson planning text without links", () => {
    expect(
      containsLink(
        "Create a lesson plan for key stage 3 history about Roman Britain",
      ),
    ).toBe(false);
  });

  it("detects link in lesson planning context", () => {
    expect(
      containsLink(
        "Create a lesson about https://www.example.com for key stage 2",
      ),
    ).toBe(true);
  });
});
