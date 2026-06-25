import { parseSubjectsForRagSearch } from "./parseSubjectsForRagSearch";

describe("parseSubjectsForRagSearch", () => {
  it("expands a mapped subject into its related slugs", () => {
    expect(parseSubjectsForRagSearch("science")).toEqual([
      "biology",
      "chemistry",
      "physics",
      "science",
      "combined-science",
    ]);
  });

  it("matches regardless of casing", () => {
    expect(parseSubjectsForRagSearch("Science")).toEqual(
      parseSubjectsForRagSearch("science"),
    );
  });

  it("matches spaced sentence-case subjects against slug keys", () => {
    expect(parseSubjectsForRagSearch("Combined Science")).toEqual(
      parseSubjectsForRagSearch("combined-science"),
    );
  });

  it("returns the subject as a slug when unmapped", () => {
    expect(parseSubjectsForRagSearch("Religious Education")).toEqual([
      "religious-education",
    ]);
  });
});
