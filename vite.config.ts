// SPDX-License-Identifier: MPL-2.0

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, configDefaults } from "vitest/config";
import { webSocketDevServer } from "./server/dev";

export default defineConfig({
  plugins: [sveltekit(), webSocketDevServer()],
  server: {
    hmr: { port: 5111 },
  },
  // Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
  resolve: process.env.VITEST
    ? {
        conditions: ["browser"],
      }
    : undefined,
  test: {
    // Playwright specs in e2e/ are run via `npm run test:e2e`, not vitest
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
