import customConfig from "@oakai/eslint-config";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...customConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
      },
    },
  },
];