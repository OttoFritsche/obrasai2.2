import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "scripts", "supabase/functions"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Regras para detectar código não utilizado
      "@typescript-eslint/no-unused-vars": "off", // Desabilitar em favor do unused-imports
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "no-unused-vars": "off", // Desabilitar regra JS em favor do unused-imports
      "no-unreachable": "error",
      "no-unused-expressions": "warn",
      "prefer-const": "warn",
      "no-var": "error",

      // Regras específicas para tipagem TypeScript (apenas as que não requerem type checking)
      "@typescript-eslint/no-explicit-any": "error", // Proibir uso de 'any'
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"], // Preferir interfaces
      "@typescript-eslint/consistent-type-imports": "error", // Preferir type imports
      "@typescript-eslint/no-inferrable-types": "error", // Evitar tipos desnecessários
      // Regras comentadas - requerem type checking que não está configurado
      // "@typescript-eslint/prefer-optional-chain": "warn", 
      // "@typescript-eslint/no-unnecessary-type-assertion": "error",
      // "@typescript-eslint/explicit-function-return-type": "warn",
      // "@typescript-eslint/prefer-nullish-coalescing": "warn",
      // "@typescript-eslint/strict-boolean-expressions": "warn",
    },
  }
);
