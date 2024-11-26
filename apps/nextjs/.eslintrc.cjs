/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.cjs", "next", "plugin:storybook/recommended"],
  rules: {
    "react/prefer-read-only-props": "error",
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
  parserOptions: {
    project: __dirname + "/tsconfig.json",
  },
};
