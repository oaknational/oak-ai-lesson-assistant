import eslint from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import nextPlugin from '@next/eslint-plugin-next';
import storybookPlugin from 'eslint-plugin-storybook';
import reactHooksPlugin from "eslint-plugin-react-hooks";
import turboPlugin from 'eslint-plugin-turbo';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { ignores } from "./ignores";
import { rules } from "./rules";

const config: FlatConfig.ConfigArray = [
  ignores,
  eslint.configs.recommended,
  prettierConfig,

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
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      '@typescript-eslint': tsEslint,
      'import': importPlugin,
      'jest': jestPlugin,
      'turbo': turboPlugin,
      "next": nextPlugin,
      "storybook": storybookPlugin,
      "react-hooks": reactHooksPlugin
    },

    rules,
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
];

export default config;