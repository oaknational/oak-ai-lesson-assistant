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
  {
    files: ["**/apps/nextjs/**/*.{ts,tsx}"],
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
        "NodeJS": "readonly",
        "React": "readonly",
      },
    },

    plugins: {
      '@typescript-eslint': tsEslint,
      'import': importPlugin,
      'jest': jestPlugin,
      'turbo': turboPlugin,
      "next": nextPlugin,
      "storybook": storybookPlugin,
      "react-hooks": reactHooksPlugin,
      "react": reactPlugin,
    },

    rules: {
      ...rules,
      "react/jsx-no-comment-textnodes": "warn",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
  
  {
    files: ["**/*.{ts,tsx}"],
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
        ...globals.browser,
        ...globals.jest,
        "NodeJS": "readonly",
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
  {
    files: ["**/packages/db/prisma/zod-schemas/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
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