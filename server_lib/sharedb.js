// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb";
import json1 from "ot-json1";
import { getLogger } from "../src/lib/log.js";

const logger = getLogger();

// @ts-expect-error because sharedb-json doesn't export ts types
import { JSONDB } from "sharedb-json";

ShareDB.types.register(json1.type);
export const backend = new ShareDB({ presence: true, db: new JSONDB({}) });
export const connection = backend.connect();

connection.on("error", (err) => logger.error("ShareDB error", err));
