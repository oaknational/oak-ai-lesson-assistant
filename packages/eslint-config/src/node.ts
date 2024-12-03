import eslint from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import turboPlugin from 'eslint-plugin-turbo';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { rules } from "./rules";
import { ignores } from "./ignores";

const config: FlatConfig.ConfigArray = [
  ignores,
  eslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        ...globals.node,
        ...globals.jest
      },
    },

    plugins: {
      '@typescript-eslint': tsEslint,
      'import': importPlugin,
      'jest': jestPlugin,
      'turbo': turboPlugin,
    },
    rules,
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
  prettierConfig,
];

export default config;