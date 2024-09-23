/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.cjs", "next", "plugin:storybook/recommended"],
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
};
