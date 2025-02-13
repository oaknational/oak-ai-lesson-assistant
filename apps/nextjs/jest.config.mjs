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
    "^.+\\.svg$": "<rootDir>/jest.svgTransform.mjs",
    "^.+\\.(css|scss|png|jpg|jpeg|gif|webp|avif)$": "jest-transform-stub",
  },
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: "<rootDir>/src/",
    }),
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@/stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@/storybook/(.*)$": "<rootDir>/.storybook/$1",
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["tests-e2e"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  resetMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  collectCoverage:
    process.env.CI === "true" || process.env.COLLECT_TEST_COVERAGE === "true",
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "coverage",
};

export default config;
