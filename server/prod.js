// SPDX-License-Identifier: MPL-2.0

import express from "express";
import { createServer } from "http";
import { createDoc, startServer } from "./server.js";
import { handler } from "../build/handler.js";
import { getLogger } from "../src/lib/log.js";

const logger = getLogger();

const port = 5173;
const app = express();
const server = createServer(app);

createDoc(() => startServer(server));
app.use(handler);

server.listen(port, (e) => {
  if (e instanceof Error) {
    logger.error("unable to start http server", e);
  }
  logger.log("starting http server", { port });
});
