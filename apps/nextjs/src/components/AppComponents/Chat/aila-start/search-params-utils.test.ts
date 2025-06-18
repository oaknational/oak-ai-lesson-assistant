import { createStartingPromptFromSearchParams } from "./search-params-utils";

describe("createStartingPromptFromSearchParams", () => {
  it("creates basic prompt with no parameters", () => {
    const result = createStartingPromptFromSearchParams();
    expect(result).toBe("Create a lesson plan on [insert title here].");
  });

  it("creates prompt with only keyStage", () => {
    const result = createStartingPromptFromSearchParams("ks3");
    expect(result).toBe("Create a lesson plan on [insert title here] for KS3.");
  });

  it("creates prompt with only subject", () => {
    const result = createStartingPromptFromSearchParams(undefined, "english");
    expect(result).toBe(
      "Create a lesson plan on [insert title here] for English.",
    );
  });

  it("creates prompt with only unitTitle", () => {
    const result = createStartingPromptFromSearchParams(
      undefined,
      undefined,
      "Medieval England",
    );
    expect(result).toBe(
      'Create a lesson plan on [insert title here] for the unit "Medieval England".',
    );
  });

  it("creates prompt with only searchExpression", () => {
    const result = createStartingPromptFromSearchParams(
      undefined,
      undefined,
      undefined,
      "The Black Death",
    );
    expect(result).toBe("Create a lesson plan on The Black Death.");
  });

  it("creates prompt with keyStage and subject", () => {
    const result = createStartingPromptFromSearchParams("ks3", "history");
    expect(result).toBe(
      "Create a lesson plan on [insert title here] for KS3 History.",
    );
  });

  it("creates prompt with keyStage, subject, and unitTitle", () => {
    const result = createStartingPromptFromSearchParams(
      "ks3",
      "history",
      "Medieval England",
    );
    expect(result).toBe(
      'Create a lesson plan on [insert title here] for KS3 History unit "Medieval England".',
    );
  });

  it("creates prompt with all parameters", () => {
    const result = createStartingPromptFromSearchParams(
      "ks3",
      "history",
      "Medieval England",
      "The Black Death",
    );
    expect(result).toBe(
      'Create a lesson plan on The Black Death for KS3 History unit "Medieval England".',
    );
  });

  it("handles empty strings as undefined", () => {
    const result = createStartingPromptFromSearchParams("", "", "", "");
    expect(result).toBe("Create a lesson plan on [insert title here].");
  });

  it("handles mixed empty and filled parameters", () => {
    const result = createStartingPromptFromSearchParams(
      "",
      "science",
      "",
      "Photosynthesis",
    );
    expect(result).toBe("Create a lesson plan on Photosynthesis for Science.");
  });

  it("handles special characters in parameters", () => {
    const result = createStartingPromptFromSearchParams(
      "ks2",
      "english",
      "Shakespeare's Works",
      "Romeo & Juliet - Act 1",
    );
    expect(result).toBe(
      'Create a lesson plan on Romeo & Juliet - Act 1 for KS2 English unit "Shakespeare\'s Works".',
    );
  });

  it("handles parameters with quotes", () => {
    const result = createStartingPromptFromSearchParams(
      "ks4",
      "english",
      'Analysis of "To Kill a Mockingbird"',
      'Chapter 1: "Maycomb County"',
    );
    expect(result).toBe(
      'Create a lesson plan on Chapter 1: "Maycomb County" for KS4 English unit "Analysis of "To Kill a Mockingbird"".',
    );
  });
});
