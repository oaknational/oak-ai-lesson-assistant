/* eslint-disable no-console */
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
    // Determine output path based on environment
    let outputPath: string;
    if (process.env.CI) {
      // In CI, save to test-outputs/ at monorepo root for artifact upload
      // Tests run from monorepo root via pnpm turbo
      outputPath = join("test-outputs", `${testName}-FAILED.png`);
      mkdirSync("test-outputs", { recursive: true });
    } else {
      // Locally, save to fixtures directory for inspection
      outputPath = join("src/images/fixtures", `${testName}-FAILED.png`);
    }

    writeFileSync(outputPath, actualPng);

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
  it("converts simple equation SVG to PNG", async () => {
    const svg = readFileSync(
      "src/images/fixtures/simple-equation.svg",
      "utf-8",
    );
    const expectedPng = readFileSync("src/images/fixtures/simple-equation.png");

    const result = await svgToPng(svg);

    expect(result.buffer).toBeInstanceOf(Buffer);
    comparePngWithFixture(result.buffer, expectedPng, "simple-equation");
  });

  it("converts quadratic formula SVG to PNG", async () => {
    const svg = readFileSync(
      "src/images/fixtures/quadratic-formula.svg",
      "utf-8",
    );
    const expectedPng = readFileSync(
      "src/images/fixtures/quadratic-formula.png",
    );

    const result = await svgToPng(svg);

    expect(result.buffer).toBeInstanceOf(Buffer);
    comparePngWithFixture(result.buffer, expectedPng, "quadratic-formula");
  });

  it("converts display mode fraction SVG to PNG", async () => {
    const svg = readFileSync(
      "src/images/fixtures/fraction-display.svg",
      "utf-8",
    );
    const expectedPng = readFileSync(
      "src/images/fixtures/fraction-display.png",
    );

    const result = await svgToPng(svg);

    expect(result.buffer).toBeInstanceOf(Buffer);
    comparePngWithFixture(result.buffer, expectedPng, "fraction-display");
  });
});
