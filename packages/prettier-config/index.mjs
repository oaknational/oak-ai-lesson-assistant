/** @type {import('prettier').Config} */
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
  tailwindAttributes: ['className'],
  tailwindConfig: `./../../apps/nextjs/tailwind.config.cjs`,
  tailwindFunctions: ["cva"],
  trailingComma: "all"
};
