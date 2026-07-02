import {
  addOneKeywordInstructions,
  changeOneKeywordInstructions,
  keywordsInstructions,
} from "./keywords.instructions";

describe("keyword instruction variants", () => {
  it("asks for exactly one new keyword and preserves the existing ones", () => {
    const instructions = addOneKeywordInstructions("key-stage-2");
    expect(instructions).toMatch(/exactly ONE/i);
    expect(instructions).toMatch(/do not.*(output|modify|restate)/i);
    expect(instructions).not.toEqual(keywordsInstructions("key-stage-2"));
  });

  it("rewrites only the keyword at the given position", () => {
    const instructions = changeOneKeywordInstructions(2, "key-stage-2");
    expect(instructions).toContain("2");
    expect(instructions).toMatch(/do not.*(modify|output)/i);
    expect(instructions).not.toEqual(keywordsInstructions("key-stage-2"));
  });
});
