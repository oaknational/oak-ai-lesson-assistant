module.exports = {
  extends: ["eslint:recommended", "prettier"],
  plugins: ["turbo", "@typescript-eslint"],
  ignorePatterns: ["node_modules", "dist", "../../node_modules", "../../dist"],
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    sourceType: "module",
    warnOnUnsupportedTypeScriptVersion: false,
  },
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      parser: "@typescript-eslint/parser",
      files: ["*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/explicit-function-return-type": [
          "off",
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
          },
        ],
      },
    },
    {
      extends: ["plugin:jest/recommended"],
      plugins: ["jest"],
      files: ["**/__tests__/**"],
      env: {
        "jest/globals": true,
      },
      rules: {
        "@typescript-eslint/unbound-method": "off",
      },
    },
  ],
  rules: {
    quotes: ["error", "double"],
  },
};
