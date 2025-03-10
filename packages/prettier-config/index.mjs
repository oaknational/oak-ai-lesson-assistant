/** @type {import('prettier').Config} */
import fs from 'fs';
import path from 'path';

// Determine if we're in a package that uses tailwind
const tailwindConfigPath = path.resolve(process.cwd(), 'apps/nextjs/tailwind.config.cjs');
const hasTailwind = fs.existsSync(tailwindConfigPath);

const plugins = [
  "@trivago/prettier-plugin-sort-imports",
];

// Only include the tailwind plugin if we have a tailwind config
if (hasTailwind) {
  plugins.push("prettier-plugin-tailwindcss");
}

export default {
  arrowParens: "always",
  importOrder: ["^react(.*)", "<THIRD_PARTY_MODULES>", "@/(.*)", "^[./]"],
  importOrderSeparation: true,
  jsxSingleQuote: false,
  plugins,
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  tailwindAttributes: ['className'],
  ...(hasTailwind && { tailwindConfig: tailwindConfigPath }),
  tailwindFunctions: ["cva"],
  trailingComma: "all"
};
