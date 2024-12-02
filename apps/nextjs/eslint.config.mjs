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

const config = [
  compat.extends("../../.eslintrc.cjs", "next", "plugin:storybook/recommended"),
  {
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "module",

      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },

    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "posthog-js/react",
              importNames: ["usePostHog"],
              message:
                "usePostHog doesn't support multiple PostHog instances, use useAnalytics instead",
            },
          ],
        },
      ],
    },
    overrides: [
      {
        files: ["next.config.js"],
        rules: {
          "@typescript-eslint/no-var-requires": "off",
          "import/no-extraneous-dependencies": "off",
          "global-require": "off",
        },
      },
    ],
  },
];

export default config;
