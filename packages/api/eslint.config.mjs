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
  ...compat.extends("eslint-config-custom"),
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "script",

      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },
  },
];
