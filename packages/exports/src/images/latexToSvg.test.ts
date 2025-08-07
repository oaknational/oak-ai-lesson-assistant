import { readFileSync } from "fs";

import { latexToSvg } from "./latexToSvg.js";

describe("latexToSvg", () => {
  it("converts simple equation", () => {
    const result = latexToSvg("x = 5");
    const expected = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );

    expect(result).toBe(expected);
  });

  it("converts quadratic formula", () => {
    const result = latexToSvg("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
    const expected = readFileSync(
      "src/images/fixtures/quadratic-formula.svg",
      "utf-8",
    );

    expect(result).toBe(expected);
  });

  it("converts fraction in display mode", () => {
    const result = latexToSvg("\\frac{1}{2}", true);
    const expected = readFileSync(
      "src/images/fixtures/fraction-display.svg",
      "utf-8",
    );

    expect(result).toBe(expected);
  });
});
