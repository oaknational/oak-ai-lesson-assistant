import { readFile } from "fs/promises";
import { pathsToModuleNameMapper } from "ts-jest";

const tsconfig = JSON.parse(
  await readFile(new URL("./tsconfig.json", import.meta.url)),
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
