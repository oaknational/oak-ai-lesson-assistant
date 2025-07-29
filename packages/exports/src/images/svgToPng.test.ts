import { createHash } from "crypto";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { svgToPng } from "./svgToPng.js";

function getChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function comparePngWithFixture(
  actualPng: Buffer,
  expectedPng: Buffer,
  testName: string,
): void {
  const actualChecksum = getChecksum(actualPng);
  const expectedChecksum = getChecksum(expectedPng);

  if (actualChecksum !== expectedChecksum) {
    // Save the actual PNG for inspection
    const outputPath = join("src/images/fixtures", `${testName}-actual.png`);
    writeFileSync(outputPath, actualPng);

    // In CI, also save to a location that can be uploaded as an artifact
    if (process.env.CI) {
      const ciOutputPath = join(
        process.cwd(),
        "test-outputs",
        `${testName}-actual.png`,
      );
      mkdirSync(join(process.cwd(), "test-outputs"), { recursive: true });
      writeFileSync(ciOutputPath, actualPng);
      console.error(`CI: PNG saved to ${ciOutputPath} for artifact upload`);
    }

    console.error(`PNG mismatch for ${testName}!`);
    console.error(`Expected checksum: ${expectedChecksum}`);
    console.error(`Actual checksum:   ${actualChecksum}`);
    console.error(`Actual PNG saved to: ${outputPath}`);
    console.error(
      `Size difference: expected ${expectedPng.length} bytes, got ${actualPng.length} bytes`,
    );

    // Still use expect for the test failure
    expect(actualChecksum).toBe(expectedChecksum);
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
