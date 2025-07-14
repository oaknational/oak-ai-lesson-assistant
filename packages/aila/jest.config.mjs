import { readFileSync } from "fs";
import { dirname, join } from "path";
import { pathsToModuleNameMapper } from "ts-jest";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsconfig = JSON.parse(
  readFileSync(join(__dirname, "./tsconfig.test.json"), "utf8"),
);

// prettier-ignore
const moduleNameMapper = Object.assign(
  pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: "<rootDir>/" }),
  {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  }
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
  moduleNameMapper,
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
