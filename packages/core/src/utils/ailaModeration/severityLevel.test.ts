import { getDisplayCategories } from "./severityLevel";

describe("getDisplayCategories", () => {
  it("returns full display category for an Oak Service category", () => {
    const result = getDisplayCategories({
      categories: ["l/discriminatory-language"],
    });
    expect(result).toEqual([
      {
        code: "l/discriminatory-language",
        shortDescription: "Discriminatory behaviour or language",
        longDescription:
          "This lesson contains depiction or discussion of discriminatory behaviour or language (including stereotypes or slurs). Some pupils may find this upsetting. Please check this content carefully.",
        severityLevel: "content-guidance",
      },
    ]);
  });

  it("falls back to legacy category with content-guidance severity", () => {
    const result = getDisplayCategories({ categories: ["l/strong-language"] });
    expect(result).toEqual([
      {
        code: "l/strong-language",
        shortDescription: "Strong Language",
        longDescription: "Contains strong language. Check content carefully.",
        severityLevel: "content-guidance",
      },
    ]);
  });

  it("returns empty array for an unknown slug", () => {
    expect(getDisplayCategories({ categories: ["unknown/category"] })).toEqual(
      [],
    );
  });

  it("returns empty array for no categories", () => {
    expect(getDisplayCategories({ categories: [] })).toEqual([]);
  });
});
