import { fileURLToPath } from 'url';
import { dirname } from 'path';
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint-config-custom"), {
    languageOptions: {
        ecmaVersion: 2018,
        sourceType: "module",

        parserOptions: {
            tsconfigRootDir: __dirname,
            project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
        },
    },
}];