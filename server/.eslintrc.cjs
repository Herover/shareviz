// SPDX-License-Identifier: MPL-2.0

module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  parserOptions: { sourceType: "module" },
  rules: {},
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  ignorePatterns: [".eslintrc.cjs"],
};
