const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.test.json");

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
        useESM: true,
      },
    ],
    "^.+\\.svg$": "<rootDir>/jest.svgTransform.js",
    "^.+\\.(css|scss|png|jpg|jpeg|gif|webp|avif)$": "jest-transform-stub",
  },
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: "<rootDir>/src/",
    }),
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/assets/(.*)$": "<rootDir>/src/assets/$1",
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["tests-e2e"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  resetMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = config;
