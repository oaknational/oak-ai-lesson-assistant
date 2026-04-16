/* eslint-disable no-console */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { latexToSvg } from "../latexToSvg.js";
import { svgToPng } from "../svgToPng.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = __dirname;

const fixtures = [
  { name: "simple-equation", latex: "x = 5", display: false },
  {
    name: "quadratic-formula",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    display: false,
  },
  { name: "fraction-display", latex: "\\frac{1}{2}", display: true },
];

async function generateAllFixtures() {
  for (const { name, latex, display } of fixtures) {
    try {
      // Generate SVG
      const svg = latexToSvg(latex, display);
      writeFileSync(join(fixturesDir, `${name}.svg`), svg);
      console.log(`✅ Generated ${name}.svg`);

      // Generate PNG
      const pngResult = await svgToPng(svg);
      writeFileSync(join(fixturesDir, `${name}.png`), pngResult.buffer);
      console.log(`✅ Generated ${name}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error);
    }
  }

  console.log("\nFixtures generated in:", fixturesDir);
}

generateAllFixtures().catch(console.error);
