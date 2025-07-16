// SPDX-License-Identifier: MPL-2.0

import { createDoc, startServer } from "./server";

export const webSocketDevServer = () => {
  return {
    name: "websocket",
    configureServer: {
      handler: (server) => {
        if (!server.httpServer) return;
        createDoc(() => startServer(server.httpServer));
      },
    },
  };
};
