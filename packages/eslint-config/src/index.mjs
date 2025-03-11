import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import packageJsonRecommended from "eslint-plugin-package-json/configs/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import storybookPlugin from "eslint-plugin-storybook";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";
import jsonParser from "jsonc-eslint-parser";
import path from "path";
import { fileURLToPath } from "url";

import { ignores } from "./ignores.mjs";
import { rules, javascriptRules } from "./rules.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

const packages = [
  { dir: "apps/nextjs", isReact: true, isBrowser: true },
  { dir: "packages/logger", isBrowser: true, allowConsole: true },
  { dir: "packages/ingest" },
  { dir: "packages/exports" },
  { dir: "packages/eslint-config" },
  { dir: "packages/db" },
  { dir: "packages/core" },
  { dir: "packages/api" },
  { dir: "packages/aila" },
  { dir: "packages/rag" },
];

const packageConfigs = packages.map((pkg) => ({
  files: [`**/${pkg.dir}/**/*.{ts,tsx}`],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      projectService: true,
      project: [`${pkg.dir}/tsconfig.json`],
      tsconfigRootDir: projectRoot,
      warnOnUnsupportedTypeScriptVersion: false,
    },
    globals: {
      ...globals.node,
      ...globals.jest,
      ...(pkg.isBrowser ? globals.browser : {}),
      NodeJS: "readonly",
      ...(pkg.isReact ? { React: "readonly" } : {}),
    },
  },
  plugins: {
    "@typescript-eslint": tsEslint,
    import: importPlugin,
    jest: jestPlugin,
    turbo: turboPlugin,
    ...(pkg.isReact
      ? {
          next: nextPlugin,
          storybook: storybookPlugin,
          "react-hooks": reactHooksPlugin,
          react: reactPlugin,
        }
      : {}),
  },
  rules: {
    ...rules,
    ...(pkg.isReact
      ? {
          "react/jsx-no-comment-textnodes": "warn",
          "react-hooks/exhaustive-deps": "error",
          "react-hooks/rules-of-hooks": "error",
        }
      : {}),
    ...(pkg.allowConsole
      ? {
          "no-console": "off",
        }
      : {}),
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: [`${pkg.dir}/tsconfig.json`],
        alwaysTryTypes: true,
      },
      node: true,
    },
  },
}));

/** @type {import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray} */
const config = [
  ignores,
  eslint.configs.recommended,
  prettierConfig,
  packageJsonRecommended,
  {
    files: ["**/*.json"],
    languageOptions: {
      parser: jsonParser,
    },
  },
  {
    files: ["**/turbo.json"],
    languageOptions: {
      parser: jsonParser,
      parserOptions: {
        jsonSyntax: "JSON",
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "error",
    },
    settings: {
      turbo: {
        // Optional: Add any specific turbo settings here if needed
      },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "script",
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        console: "readonly",
      },
    },
    rules: {
      ...javascriptRules,
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      ...javascriptRules,
    },
  },
  ...packageConfigs,
  {
    files: ["**/packages/db/prisma/zod-schemas/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["packages/db/tsconfig.json"],
        tsconfigRootDir: projectRoot,
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      "@typescript-eslint/no-import-type-side-effects": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];

export default config;
