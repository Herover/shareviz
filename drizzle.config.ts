// SPDX-License-Identifier: MPL-2.0

import path from "node:path";
import { defineConfig } from "drizzle-kit";

const dataDir = process.env.DATA_DIR || "data";

export default defineConfig({
  dialect: "sqlite",
  schema: "./server_lib/drizzle/schema.js",
  out: "./drizzle",
  dbCredentials: { url: path.join(dataDir, "db.sqlite") },
});
