// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb";
import json1 from "ot-json1";
import richText from "rich-text";
import { getLogger } from "../src/lib/log.js";

const logger = getLogger();

// @ts-expect-error because sharedb-json doesn't export ts types
import { JSONDB } from "sharedb-json";

const documentDir = process.env.DATA_DIR || "data";

// Embed the rich-text (Quill Delta) OT type inside json1 so prose fields like the
// chart description can be edited concurrently and merged instead of clobbered.
json1.type.registerSubtype(richText);
ShareDB.types.register(json1.type);
export const backend = new ShareDB({ presence: true, db: new JSONDB({ documentDir }) });
export const connection = backend.connect();

connection.on("error", (err) => logger.error("ShareDB error", err));
