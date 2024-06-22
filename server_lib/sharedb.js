import ShareDB from 'sharedb';
import json1 from 'ot-json1';

import { JSONDB } from "./jsondb.js";

ShareDB.types.register(json1.type);
export const backend = new ShareDB({ presence: true, db: new JSONDB({}) });
export const connection = backend.connect();

connection.on("error", (err) => console.log("ShareDB error", err))
