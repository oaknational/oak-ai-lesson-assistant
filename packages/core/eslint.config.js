import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("../../eslint.config.js"),
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",

      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },
  },
];
