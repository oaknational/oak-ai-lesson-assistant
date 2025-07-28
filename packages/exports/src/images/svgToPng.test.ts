import { readFileSync } from "fs";

import { svgToPng } from "./svgToPng.js";

describe("svgToPng", () => {
  it("converts simple equation SVG to PNG", () => {
    const svg = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );
    const expectedPng = readFileSync("src/images/fixtures/simple-equation.png");

    const result = svgToPng(svg, { width: 600, background: "white" });

    expect(result).toBeInstanceOf(Buffer);
    expect(result).toEqual(expectedPng);
  });

  it("converts quadratic formula SVG to PNG", () => {
    const svg = readFileSync(
      "src/images/fixtures/quadratic-formula.svg",
      "utf-8",
    );
    const expectedPng = readFileSync(
      "src/images/fixtures/quadratic-formula.png",
    );

    const result = svgToPng(svg, { width: 600, background: "white" });

    expect(result).toBeInstanceOf(Buffer);
    expect(result).toEqual(expectedPng);
  });

  it("converts display mode fraction SVG to PNG", () => {
    const svg = readFileSync(
      "src/images/fixtures/fraction-display.svg",
      "utf-8",
    );
    const expectedPng = readFileSync(
      "src/images/fixtures/fraction-display.png",
    );

    const result = svgToPng(svg, { width: 600, background: "white" });

    expect(result).toBeInstanceOf(Buffer);
    expect(result).toEqual(expectedPng);
  });

  it("respects width option", () => {
    const svg = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );

    const smallPng = svgToPng(svg, { width: 300, background: "white" });
    const largePng = svgToPng(svg, { width: 600, background: "white" });

    // Different widths should produce different size buffers
    expect(smallPng.length).toBeLessThan(largePng.length);
  });

  it("handles transparent background", () => {
    const svg = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );

    const transparentPng = svgToPng(svg, { width: 600 }); // No background specified
    const whitePng = svgToPng(svg, { width: 600, background: "white" });

    // Different backgrounds should produce different images
    expect(transparentPng).not.toEqual(whitePng);
  });
});
