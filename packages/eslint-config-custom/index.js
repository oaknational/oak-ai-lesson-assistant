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
        "import/newline-after-import": "off", // conflict with Prettier
        "import/no-duplicates": "off", // conflict with Prettier
        "no-console": "warn",
        "no-extra-boolean-cast": "error",
        "no-useless-escape": "error",
        "no-unsafe-finally": "error",
        "no-constant-condition": "warn",
        "no-prototype-builtins": "error",
        "no-inner-declarations": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/no-unsafe-enum-comparison": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/no-unsafe-return": "warn", // should be error
        "@typescript-eslint/no-misused-promises": "warn", // should be error
        "@typescript-eslint/no-unsafe-argument": "warn", // should be error
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-floating-promises": "warn", // should be error
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-unsafe-member-access": "warn", //should be error
        "@typescript-eslint/restrict-template-expressions": "error",
        "@typescript-eslint/no-redundant-type-constituents": "warn", // should be error        
        "@typescript-eslint/await-thenable": "error",
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
