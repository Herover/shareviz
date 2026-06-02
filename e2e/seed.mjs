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

// A dedicated org for the settings-editing tests. The bootstrap admin invite is
// single-use and consumed by the invite flow, so editing tests get their own
// org to work against in isolation. `settingsInviteCode` is the admin invite
// (from addOrganization); the team-editing test only needs org membership, so
// it gets a separate single-use member invite.
const settings = await db.addOrganization("E2E Settings Org");
const settingsMemberInvite = await db.addOrganizationInvite(settings.id);

writeFileSync(
  path.join(E2E_DATA_DIR, "state.json"),
  JSON.stringify(
    {
      bootstrapOrgId: bootstrap.id,
      bootstrapInviteCode: bootstrap.code,
      settingsOrgId: settings.id,
      settingsInviteCode: settings.code,
      settingsMemberInviteCode: settingsMemberInvite.code,
    },
    null,
    2,
  ),
);

// Explicit exit: better-sqlite3 holds the file open for the lifetime of the
// process, and we want that lock released before the dev server starts.
process.exit(0);
