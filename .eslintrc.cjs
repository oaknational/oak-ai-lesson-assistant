/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["eslint-config-custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./apps/*/tsconfig.json",
      "./packages/*/tsconfig.json",
    ],
  },
};
