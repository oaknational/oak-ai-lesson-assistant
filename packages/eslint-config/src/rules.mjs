import tsEslint from '@typescript-eslint/eslint-plugin';

const typescript = tsEslint.configs.recommended;

const rulesToDecideOn = {
  "@typescript-eslint/no-unsafe-assignment": "off", // this rule is buggy and is causing a lot of false positives
  "@typescript-eslint/no-unsafe-call": "off", // this rule is buggy and is causing a lot of false positives
}

// @ts-check
/** @type {Partial<Record<string, import('@typescript-eslint/utils/ts-eslint').SharedConfig.RuleEntry>>} */
export const rules = {
  ...typescript.rules,
  ...rulesToDecideOn,
  "@typescript-eslint/prefer-nullish-coalescing": "warn",
  "@typescript-eslint/no-unsafe-enum-comparison": "error",
  "@typescript-eslint/no-unnecessary-type-assertion": "warn",
  "@typescript-eslint/consistent-type-imports": "warn",
  "@typescript-eslint/comma-dangle": "off",
  "@typescript-eslint/no-duplicate-enum-values": "off",
  "@typescript-eslint/no-unused-vars": "warn",
  "@typescript-eslint/no-unused-expressions": ["warn", {
    allowShortCircuit: true,
    allowTernary: true,
    allowTaggedTemplates: true,
  }],
  "@typescript-eslint/require-await": "warn",
  "@typescript-eslint/unbound-method": "off",
  "@typescript-eslint/restrict-template-expressions": "error",
  "@typescript-eslint/await-thenable": "error",
  "@typescript-eslint/explicit-function-return-type": ["off", {
    allowExpressions: true,
    allowTypedFunctionExpressions: true,
  }],
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/no-misused-promises": "error",
  "@typescript-eslint/no-unsafe-argument": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-redundant-type-constituents": "error",

  // Import plugin rules
  "import/no-cycle": ["warn", { maxDepth: Infinity }],
  "import/newline-after-import": "off",
  "import/no-duplicates": "off",

  // General ESLint rules
  "no-console": "warn",
  "no-extra-boolean-cast": "error",
  "no-useless-escape": "error",
  "no-unsafe-finally": "error",
  "no-constant-condition": "warn",
  "no-prototype-builtins": "error",
  "no-inner-declarations": "warn",
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
}
