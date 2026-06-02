// SPDX-License-Identifier: MPL-2.0

import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/**
 * E2E tests run against an isolated data directory so a developer's local
 * `data/` (sqlite + chart JSON) is never touched. The directory is wiped
 * and rebuilt by `e2e/global-setup.ts` on every run.
 */
const E2E_DATA_DIR = path.resolve(".e2e-data");
const E2E_PORT = Number(process.env.E2E_PORT || 5174);
const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
// PUBLIC_VIEWER_ORIGIN must differ from PUBLIC_ORIGIN. `hooks.server.ts`
// redirects 308 from any URL on the viewer origin (other than /view/...) to
// PUBLIC_ORIGIN — if they share a host, the redirect points back to itself
// and any request loops until something gives up.
const E2E_VIEWER_ORIGIN = `http://view.localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: "e2e",
  outputDir: ".e2e-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // The `.e2e-data/` directory is prepared by `e2e/setup.mjs` (chained from
  // the `test:e2e` npm script) so it's ready before the dev server boots.
  // We only use Playwright's globalTeardown to clean up at the end.
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: E2E_ORIGIN,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${E2E_PORT} --strictPort`,
    url: E2E_ORIGIN,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      DATA_DIR: E2E_DATA_DIR,
      PUBLIC_ORIGIN: E2E_ORIGIN,
      PUBLIC_VIEWER_ORIGIN: E2E_VIEWER_ORIGIN,
      ORIGIN: E2E_ORIGIN,
      AUTH_SECRET: "e2e-secret-do-not-use-in-prod",
      AUTH_TRUST_HOST: "true",
    },
  },
});
