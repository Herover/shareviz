// SPDX-License-Identifier: MPL-2.0

import { rmSync } from "node:fs";
import path from "node:path";

const E2E_DATA_DIR = path.resolve(".e2e-data");

export default async function globalTeardown() {
  // Leave .e2e-results/ behind so failed-run traces and screenshots can
  // still be inspected, but always remove the isolated data dir so a
  // crashed run can't leak a sqlite/chart-store between sessions.
  if (process.env.E2E_KEEP_DATA === "1") return;
  rmSync(E2E_DATA_DIR, { recursive: true, force: true });
}
