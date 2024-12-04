import tsEslint from '@typescript-eslint/eslint-plugin';

const typescript = tsEslint.configs.recommended;

// @ts-check
/** @type {Partial<Record<string, import('@typescript-eslint/utils/ts-eslint').SharedConfig.RuleEntry>>} */
export const rules = {
  ...typescript.rules,
  "@typescript-eslint/prefer-nullish-coalescing": "warn",
  "@typescript-eslint/no-unsafe-enum-comparison": "warn",
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
  "no-extra-boolean-cast": "warn",
  "no-useless-escape": "warn",
  "no-unsafe-finally": "warn",
  "no-constant-condition": "warn",
  "no-prototype-builtins": "warn",
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