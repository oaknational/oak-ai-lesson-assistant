import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("../../.eslintrc.cjs", "next", "plugin:storybook/recommended"),
    {
        languageOptions: {
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: "/Users/stef/apps/oak-ai-lesson-assistant/apps/nextjs/tsconfig.json",
            },
        },

        rules: {
            "no-restricted-imports": ["error", {
                paths: [{
                    name: "posthog-js/react",
                    importNames: ["usePostHog"],
                    message: "usePostHog doesn't support multiple PostHog instances, use useAnalytics instead",
                }],
            }],
        },
    },
];