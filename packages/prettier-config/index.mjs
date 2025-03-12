/** @type {import('prettier').Config} */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fixed path to the tailwind config
const tailwindConfigPath = resolve(
  __dirname,
  "../../apps/nextjs/tailwind.config.cjs",
);

const plugins = [
  "@trivago/prettier-plugin-sort-imports",
  "prettier-plugin-tailwindcss",
];

export default {
  arrowParens: "always",
  importOrder: [
    "^react",
    "^@oakai/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  jsxSingleQuote: false,
  plugins,
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  tailwindAttributes: ["className"],
  tailwindConfig: tailwindConfigPath,
  tailwindFunctions: ["cva"],
  trailingComma: "all",
};
