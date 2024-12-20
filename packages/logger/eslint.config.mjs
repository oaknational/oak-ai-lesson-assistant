import baseConfig from "@oakai/eslint-config";

const config = [...baseConfig];

// Get the last config object
const tsConfig = config.find((i) => i.files?.[0] === "**/*.{ts,tsx}");

// Modify the rules of the last config object
if (tsConfig && typeof tsConfig === "object" && "rules" in tsConfig) {
  tsConfig.rules = {
    ...tsConfig.rules,
    "no-console": "off",
  };
} else {
  // If the last item isn't a config object with rules, append a new config object
  config.push({
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-console": "off",
    },
  });
}

export default config;
