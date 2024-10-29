module.exports = {
  extends: ["eslint:recommended", "prettier"],
  plugins: ["turbo", "@typescript-eslint",],
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
        "no-console": "warn",
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/unbound-method": "off",
        "no-constant-condition": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
        "@typescript-eslint/no-redundant-type-constituents": "warn",
        "no-inner-declarations": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
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
};
