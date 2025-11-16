// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb";
import json1 from "ot-json1";

// @ts-expect-error because sharedb-json doesn't export ts types
import { JSONDB } from "sharedb-json";

ShareDB.types.register(json1.type);
export const backend = new ShareDB({ presence: true, db: new JSONDB({}) });
export const connection = backend.connect();

connection.on("error", (err) => console.error("ShareDB error", err));
