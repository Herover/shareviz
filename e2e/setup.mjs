// SPDX-License-Identifier: MPL-2.0

// Prepares the isolated `.e2e-data/` directory before Playwright spawns the
// dev server. We run this from the `test:e2e` npm script (not from
// playwright's globalSetup), because globalSetup is not guaranteed to
// complete before `webServer` starts. This script must finish before the
// dev server tries to open its sqlite file.

import { execSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const E2E_DATA_DIR = path.resolve(".e2e-data");

rmSync(E2E_DATA_DIR, { recursive: true, force: true });
mkdirSync(E2E_DATA_DIR, { recursive: true });
mkdirSync(path.join(E2E_DATA_DIR, "examples"), { recursive: true });

const env = { ...process.env, DATA_DIR: E2E_DATA_DIR };

execSync("npx drizzle-kit migrate", { stdio: "inherit", env });
execSync("node e2e/seed.mjs", { stdio: "inherit", env });
