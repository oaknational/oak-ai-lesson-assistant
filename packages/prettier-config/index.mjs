/** @type {import('prettier').Config} */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const tailwindStylesheetPath = resolve(
  __dirname,
  "../../apps/nextjs/src/app/globals.css",
);

const plugins = [
  "@trivago/prettier-plugin-sort-imports",
  "prettier-plugin-tailwindcss",
  "prettier-plugin-packagejson",
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
  tailwindStylesheet: tailwindStylesheetPath,
  tailwindFunctions: ["cva"],
  trailingComma: "all",
};
