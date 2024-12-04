import { readFile } from "fs/promises";
import { pathsToModuleNameMapper } from "ts-jest";

const tsconfig = JSON.parse(
  await readFile(new URL("./tsconfig.test.json", import.meta.url)),
);

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: "<rootDir>/",
    }),
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "setup-polly-jest/jest-environment-node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  resetMocks: true,
  collectCoverage:
    process.env.CI === "true" || process.env.COLLECT_TEST_COVERAGE === "true",
  coverageReporters: ["lcov", "text"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  coverageDirectory: "coverage",
};

export default config;
