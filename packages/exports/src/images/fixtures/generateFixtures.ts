import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { latexToSvg } from "../latexToSvg.js";
import { svgToPng } from "../svgToPng.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");

const fixtures = [
  { name: "simple-equation", latex: "x = 5", display: false },
  {
    name: "quadratic-formula",
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    display: false,
  },
  { name: "fraction-display", latex: "\\frac{1}{2}", display: true },
];

fixtures.forEach(({ name, latex, display }) => {
  try {
    // Generate SVG
    const svg = latexToSvg(latex, display);
    writeFileSync(join(fixturesDir, `${name}.svg`), svg);
    console.log(`✅ Generated ${name}.svg`);

    // Generate PNG
    const pngBuffer = svgToPng(svg, { width: 600 });
    writeFileSync(join(fixturesDir, `${name}.png`), pngBuffer);
    console.log(`✅ Generated ${name}.png`);
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error);
  }
});

console.log("\nFixtures generated in:", fixturesDir);
