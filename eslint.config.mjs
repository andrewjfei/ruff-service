// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";

export default tseslint.config(
    {
        ignores: ["eslint.config.mjs"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: "commonjs",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            import: eslintPluginImport,
            prettier: eslintPluginPrettier,
        },
        rules: {
            quotes: ["error", "double", { avoidEscape: true }],
            "sort-imports": [
                "error",
                {
                    ignoreCase: false,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                },
            ],
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["src/*"],
                },
            ],
            "import/newline-after-import": ["error", { count: 1 }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unsafe-argument": "warn",
        },
    },
);
