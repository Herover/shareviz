// SPDX-License-Identifier: MPL-2.0

import { writable } from "svelte/store";

import ReconnectingWebSocket from "reconnecting-websocket";
import * as json1 from "ot-json1";
import ShareDB from "sharedb/lib/client";
import { WebSocket } from "ws";
import { type Root } from "./chart";
import { notifications } from "./notificationStore";
import { editChartInfo } from "./api";
import { defDoc } from "./initialDoc";
import { migrate } from "./chartMigrate";
import { type Doc } from "sharedb";
import { getLogger } from "$lib/log.js";
import { createLocalDoc } from "./localShareDBDoc";

const logger = getLogger();

export const localPrefix = "local-";

export const getLocalDoc = (collection: string, id: string): Doc => {
  const initial = localStorage.getItem(collection + "-" + id);
  return createLocalDoc(collection, id, {
    initial: initial == null ? null : JSON.parse(initial),
  });
};

export const getLocalDocs = () => {
  return Object.keys(localStorage).map((id) => ({
    id: id.substring("examples-".length),
    data: JSON.parse(localStorage[id]),
  }));
};

export const db = (function createDB() {
  let doc: any; // Doc;
  let connection: any;
  let id: undefined | string;

  let connected = false;

  const { subscribe, set, update } = writable<{
    connected: boolean;
    doc: /* Doc */ Root | null;
    /** True if document was fetched but is undefined */
    missing: boolean;
    mode: "local" | "synced";
    chartInfo: null | any;
  }>({
    connected,
    doc: null,
    missing: false,
    mode: "local",
    chartInfo: null,
  });

  return {
    subscribe,
    set,
    update,
    connect: () => {
      const socket = new ReconnectingWebSocket(
        `//${window.location.host}/sharedb?aaaa=bbbb`,
        ["ws"],
        {
          // ShareDB handles dropped messages, and buffering them while the socket
          // is closed has undefined behavior
          maxEnqueuedMessages: 0,
          WebSocket: WebSocket,
        },
      );
      socket.addEventListener("error", (e) => logger.error("websocket error", e));

      socket.addEventListener("open", () =>
        update((d) => {
          d.connected = connected = true;
          return d;
        }),
      );

      socket.addEventListener("close", () =>
        update((d) => {
          d.connected = connected = false;
          return d;
        }),
      );

      ShareDB.types.register(json1.type);
      connection = new ShareDB.Connection(socket as any);

      return () => socket.close();
    },
    load: (docId: string, synced: boolean) => {
      id = docId;
      update((d) => ({
        ...d,
        doc: null,
      }));
      doc = synced ? connection.get("examples", docId) : getLocalDoc("examples", docId);
      doc.on("error", (e: Error) => notifications.addError(e.message));

      if (!synced) {
        migrate(doc);
      }

      const onData = (e?: Error) => {
        if (e && typeof e.message == "string") notifications.addError(e.message);
        update((d) => ({
          doc: doc.data,
          missing: typeof doc.data === "undefined",
          connected,
          mode: doc.mode === "synced" ? "synced" : "local",
          chartInfo: d.chartInfo,
        }));
      };

      // Get initial value of document and subscribe to changes
      doc.subscribe(onData);
      // When document changes (by this client or any other, or the server),
      // update the number on the page
      doc.on("op", onData);

      if (synced) {
        fetch("/api/chart/" + docId)
          .then((res) => res.json())
          .then((data) =>
            update((d) => ({
              ...d,
              chartInfo: data.chart,
            })),
          );
      }
    },
    create: (
      synced: boolean,
      teamId?: string,
      folderId?: string,
      data?: string,
      isUserChart?: boolean,
    ) => {
      return new Promise<string>((resolve, reject) => {
        if (synced) {
          fetch("/api/chart", {
            method: "POST",
            body: JSON.stringify({ teamId, folderId, data, isUserChart }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (typeof data.ref == "string") {
                resolve(data.ref);
              } else {
                reject(new Error(data.message));
              }
            })
            .catch((err) => reject(err));
        } else {
          const docId = (synced ? "" : localPrefix) + crypto.randomUUID();
          doc = synced ? connection.get("examples", docId) : getLocalDoc("examples", docId);
          doc.on("error", (e: Error) => logger.log("doc error", e));
          doc.create(typeof data == "string" ? data : defDoc, json1.type.uri, () => resolve(docId));
        }
      });
    },

    getRecent: (): Promise<any> => {
      const local = getLocalDocs();
      return new Promise((resolve, reject) => {
        connection.createFetchQuery(
          "examples",
          { $limit: 5 },
          {},
          (err: Error | undefined, results: any) => {
            if (err) reject(err);
            if (typeof results != "undefined") resolve([...results, ...local]);
            else resolve(local);
          },
        );
      });
    },

    getLocal: getLocalDocs,

    updateInfo: async (info: { name: string }) => {
      if (typeof id == "undefined") return;

      try {
        editChartInfo(id, info);
      } catch (e) {
        notifications.addError((e as Error).message);
        logger.error("unable to update info", e);
      }

      update((d) => ({
        ...d,
        chartInfo: {
          ...d.chartInfo,
          name: info.name,
        },
      }));
    },
  };
})();
