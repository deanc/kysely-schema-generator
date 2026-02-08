const tseslint = require("@typescript-eslint/eslint-plugin")
const tsParser = require("@typescript-eslint/parser")
const prettier = require("eslint-config-prettier")

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettier.rules,
    },
  },
]
