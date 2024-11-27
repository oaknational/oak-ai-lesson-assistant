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
      plugins:["import"],
      parser: "@typescript-eslint/parser",
      files: ["*.{ts,tsx}"],
      rules: {
        "import/no-cycle": "warn",
        "import/order": [
          "warn",
          {
            "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always",
            "alphabetize": {
              "order": "asc",
              "caseInsensitive": true
            }
          }
        ],
        "no-console": "warn",
        "no-extra-boolean-cast": "warn",
        "no-useless-escape": "warn",
        "no-unsafe-finally": "warn",
        "no-constant-condition": "warn",
        "no-prototype-builtins": "warn",
        "no-inner-declarations": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/no-unsafe-enum-comparison": "warn",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
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
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
        "@typescript-eslint/no-redundant-type-constituents": "warn",        
        "@typescript-eslint/await-thenable": "warn",
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
