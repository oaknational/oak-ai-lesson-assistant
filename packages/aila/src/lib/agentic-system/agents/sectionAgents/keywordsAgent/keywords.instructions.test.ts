import {
  addOneKeywordInstructions,
  changeOneKeywordInstructions,
  keywordsInstructions,
} from "./keywords.instructions";

describe("keyword instruction variants", () => {
  it("asks for exactly one new keyword and preserves the existing ones", () => {
    expect(addOneKeywordInstructions).toMatch(/exactly ONE/i);
    expect(addOneKeywordInstructions).toMatch(
      /do not.*(output|modify|restate)/i,
    );
    expect(addOneKeywordInstructions).not.toEqual(keywordsInstructions);
  });

  it("rewrites only the keyword at the given position", () => {
    const instructions = changeOneKeywordInstructions(2);
    expect(instructions).toContain("2");
    expect(instructions).toMatch(/do not.*(modify|output)/i);
    expect(instructions).not.toEqual(keywordsInstructions);
  });
});
