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
  },
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "setup-polly-jest/jest-environment-node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  resetMocks: true,
};

module.exports = config;
