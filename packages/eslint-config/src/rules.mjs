import tsEslint from '@typescript-eslint/eslint-plugin';

const typescript = tsEslint.configs.recommended;

// These are rules that are currently set to "warn"
// But should be set to "error" once we fix all the existing issues
const rulesToMoveToError = {
  "@typescript-eslint/no-unsafe-return": "warn",
  "@typescript-eslint/no-misused-promises": "warn",
  "@typescript-eslint/no-unsafe-argument": "warn",
  "@typescript-eslint/no-floating-promises": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-redundant-type-constituents": "warn",       
}

const rulesToDecideOn = {
  "@typescript-eslint/no-unsafe-assignment": "off", // this rule is buggy and is causing a lot of false positives
  "@typescript-eslint/no-unsafe-call": "off", // this rule is buggy and is causing a lot of false positives
}

// @ts-check
/** @type {Partial<Record<string, import('@typescript-eslint/utils/ts-eslint').SharedConfig.RuleEntry>>} */
export const rules = {
  ...typescript.rules,
  ...rulesToMoveToError,
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

  // Import plugin rules
  "import/no-cycle": "warn",
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