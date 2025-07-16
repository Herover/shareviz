// SPDX-License-Identifier: MPL-2.0

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./server_lib/drizzle/schema.js",
  out: "./drizzle",
  dbCredentials: { url: "data/db.sqlite" },
});
