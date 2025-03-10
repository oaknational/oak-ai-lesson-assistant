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
  plugins,
  tailwindAttributes: ['className'],
  importOrder: ["^react(.*)", "<THIRD_PARTY_MODULES>", "@/(.*)", "^[./]"],
  importOrderSeparation: true,
  tailwindFunctions: ["cva"],
  arrowParens: "always",
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  ...(hasTailwind && { tailwindConfig: tailwindConfigPath })
};
