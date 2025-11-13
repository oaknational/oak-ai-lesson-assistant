import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathsToModuleNameMapper } from "ts-jest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsconfig = JSON.parse(
  readFileSync(join(__dirname, "./tsconfig.json"), "utf-8"),
);

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions?.paths || {}, {
      prefix: "<rootDir>/src/",
    }),
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  resetMocks: true,
  setupFiles: ["<rootDir>/jest.setup.cjs"],
};

export default config;
