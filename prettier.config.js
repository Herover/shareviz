// SPDX-License-Identifier: MPL-2.0

export default {
  printWidth: 100,
  plugins: ["prettier-plugin-svelte"],
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
  ],
};
