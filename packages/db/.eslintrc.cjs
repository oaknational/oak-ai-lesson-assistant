/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint-config-custom"],
  parserOptions: {
    project: __dirname + "/tsconfig.json",
  },
};
