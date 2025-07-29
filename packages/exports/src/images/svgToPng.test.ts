import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { svgToPng } from "./svgToPng.js";

function comparePngWithFixture(
  actualPng: Buffer,
  expectedPng: Buffer,
  testName: string,
): void {
  try {
    expect(actualPng).toEqual(expectedPng);
  } catch (error) {
    // Save the actual PNG for inspection
    const outputPath = join("src/images/fixtures", `${testName}-actual.png`);
    writeFileSync(outputPath, actualPng);
    console.error(`PNG mismatch! Actual PNG saved to: ${outputPath}`);
    throw error;
  }
}

describe("svgToPng", () => {
  it("converts simple equation SVG to PNG", () => {
    const svg = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );
    const expectedPng = readFileSync("src/images/fixtures/simple-equation.png");

    const result = svgToPng(svg, { width: 600 });

    expect(result).toBeInstanceOf(Buffer);
    comparePngWithFixture(result, expectedPng, "simple-equation");
  });

  it("converts quadratic formula SVG to PNG", () => {
    const svg = readFileSync(
      "src/images/fixtures/quadratic-formula.svg",
      "utf-8",
    );
    const expectedPng = readFileSync(
      "src/images/fixtures/quadratic-formula.png",
    );

    const result = svgToPng(svg, { width: 600 });

    expect(result).toBeInstanceOf(Buffer);
    comparePngWithFixture(result, expectedPng, "quadratic-formula");
  });

  it("converts display mode fraction SVG to PNG", () => {
    const svg = readFileSync(
      "src/images/fixtures/fraction-display.svg",
      "utf-8",
    );
    const expectedPng = readFileSync(
      "src/images/fixtures/fraction-display.png",
    );

    const result = svgToPng(svg, { width: 600 });

    expect(result).toBeInstanceOf(Buffer);
    comparePngWithFixture(result, expectedPng, "fraction-display");
  });

  it("respects width option", () => {
    const svg = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );

    const smallPng = svgToPng(svg, { width: 300 });
    const largePng = svgToPng(svg, { width: 600 });

    // Different widths should produce different size buffers
    expect(smallPng.length).toBeLessThan(largePng.length);
  });
});
