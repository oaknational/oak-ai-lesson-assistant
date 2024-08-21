module.exports = {
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
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
  tailwindConfig: `./../../apps/nextjs/tailwind.config.cjs`
};
