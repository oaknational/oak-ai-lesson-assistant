// Jest runs our tests as CommonJS, which can't load packages that only ship ES
// modules. Jest compiles these packages to CommonJS instead of skipping them.
const esmOnlyPackages = ["ai", "@ai-sdk", "@workflow", "superjson", "copy-anything", "@portabletext/react", "@portabletext/toolkit"];

const esmTransformIgnorePatterns = [
  `/node_modules/(?!(${esmOnlyPackages.join("|")})/)`,
];

const esmTransform = {
  "^.+\\.m?js$": [
    "ts-jest",
    {
      tsconfig: { allowJs: true, isolatedModules: true },
      useESM: false,
    },
  ],
};

module.exports = { esmOnlyPackages, esmTransformIgnorePatterns, esmTransform };
