import eslint from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import nextPlugin from '@next/eslint-plugin-next';
import storybookPlugin from 'eslint-plugin-storybook';
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactPlugin from "eslint-plugin-react";
import turboPlugin from 'eslint-plugin-turbo';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { ignores } from "./ignores.mjs";
import { rules } from "./rules.mjs";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const packages = [
  { dir: 'apps/nextjs', isReact: true, isBrowser: true },
  { dir: 'packages/logger', isBrowser: true, allowConsole: true },
  { dir: 'packages/ingest' },
  { dir: 'packages/exports' },
  { dir: 'packages/eslint-config' },
  { dir: 'packages/db' },
  { dir: 'packages/core' },
  { dir: 'packages/api' },
  { dir: 'packages/aila' },
  { dir: 'packages/rag' },
];

const packageConfigs = packages.map(pkg => ({
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
      "NodeJS": "readonly",
      ...(pkg.isReact ? { "React": "readonly" } : {}),
    },
  },
  plugins: {
    '@typescript-eslint': tsEslint,
    'import': importPlugin,
    'jest': jestPlugin,
    'turbo': turboPlugin,
    ...(pkg.isReact ? {
      "next": nextPlugin,
      "storybook": storybookPlugin,
      "react-hooks": reactHooksPlugin,
      "react": reactPlugin,
    } : {}),
  },
  rules: {
    ...rules,
    ...(pkg.isReact ? {
      "react/jsx-no-comment-textnodes": "warn",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
    } : {}),
    ...(pkg.allowConsole ? {
      "no-console": "off", 
    } : {}),
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: [`${pkg.dir}/tsconfig.json`],
        alwaysTryTypes: true
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
  {
    files: ['**/*.cjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        "console": "readonly",
      },
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        "console": "readonly",
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      'import': importPlugin,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  ...packageConfigs,
  // Special case for prisma zod-schemas
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
      '@typescript-eslint': tsEslint,
    },
    rules: {
      '@typescript-eslint/no-import-type-side-effects': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];

export default config;