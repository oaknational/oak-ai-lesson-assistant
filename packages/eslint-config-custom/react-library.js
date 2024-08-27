module.exports = {
  extends: [
    "custom",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
  },
};
