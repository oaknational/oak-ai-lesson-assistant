/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.cjs", "next"],
  //plugins: ["import"],
  rules: {
    // ... other rules ...
    // "import/order": [
    //   "error",
    //   {
    //     groups: [
    //       "builtin",
    //       "external",
    //       "internal",
    //       "parent",
    //       "sibling",
    //       "index",
    //     ],
    //     alphabetize: {
    //       order: "asc",
    //       caseInsensitive: true,
    //     },
    //   },
    // ],
  },
};
