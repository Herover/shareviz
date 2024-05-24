module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"], extraFileExtensions: ['.svelte'] },
  plugins: [
    "@typescript-eslint"
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      env: {
        browser: true,
        node: false
      }
    }
    // ...
  ],
    rules: {
    "@typescript-eslint/strict-boolean-expressions": [
      2,
      {
        allowString: false,
        allowNumber: false
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error", // or "warn"
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "off",
  },
  ignorePatterns: [
    "svelte.config.js",
    ".eslintrc.cjs",
    "vite.config.ts",
    "/server/",
  ],
  env: {
    browser: false,
    node: true
  }
};