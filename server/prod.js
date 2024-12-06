import express from "express";
import { createServer } from "http";
import { createDoc, startServer } from "./server.js";
import { handler } from "../build/handler.js";

const port = 5173;
const app = express();
const server = createServer(app);

createDoc(() => startServer(server));
app.use(handler);

server.listen(port, (e) => {
  console.log(`listening on port ${port}`, e);
});
