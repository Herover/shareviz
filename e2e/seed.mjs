// SPDX-License-Identifier: MPL-2.0

// Runs as a child process from global-setup so the sqlite connection it
// opens is fully closed before Playwright boots the dev server.

import { writeFileSync } from "node:fs";
import path from "node:path";

const E2E_DATA_DIR = process.env.DATA_DIR;
if (!E2E_DATA_DIR) {
  throw new Error("seed.mjs requires DATA_DIR to be set");
}

const { db } = await import("../server_lib/sqlite.js");

const bootstrap = await db.addOrganization("E2E Test Org");

writeFileSync(
  path.join(E2E_DATA_DIR, "state.json"),
  JSON.stringify(
    {
      bootstrapOrgId: bootstrap.id,
      bootstrapInviteCode: bootstrap.code,
    },
    null,
    2,
  ),
);

// Explicit exit: better-sqlite3 holds the file open for the lifetime of the
// process, and we want that lock released before the dev server starts.
process.exit(0);
