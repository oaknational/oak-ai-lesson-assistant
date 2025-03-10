/** @type {import('prettier').Config} */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  arrowParens: "always",
  importOrder: ["^react(.*)", "<THIRD_PARTY_MODULES>", "@/(.*)", "^[./]"],
  importOrderSeparation: true,
  jsxSingleQuote: false,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
  ],
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  tailwindAttributes: ["className"],
  tailwindConfig: resolve(__dirname, "../../apps/nextjs/tailwind.config.cjs"),
  tailwindFunctions: ["cva"],
  trailingComma: "all",
};
