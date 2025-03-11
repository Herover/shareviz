import { writable } from "svelte/store";

import ReconnectingWebSocket from "reconnecting-websocket";
import * as json1 from "ot-json1";
import ShareDB from "sharedb/lib/client";
import { WebSocket } from "ws";
import { createScope } from "./dataScope";
import {
  type HBar,
  type Root,
  type Set,
  type Chart,
  type LineStyleKey,
  type Scale,
  type Colors,
} from "./chart";
import { notifications } from "./notificationStore";
import { editChartInfo } from "./api";
import { defDoc } from "./initialDoc";
import { migrate } from "./chartMigrate";
import { type Doc } from "sharedb";
// import { type Connection, type LocalPresence, type Presence } from 'sharedb/lib/client';

export const localPrefix = "local-";

interface PresenceData {
  selected: string;
  color: string;
}

export const createLocalDoc = (
  collection: string,
  id: string,
  opts: { initial?: any; noStorage?: boolean } = {},
): Doc => {
  let onOp: (error?: Error) => any = () => {};
  const doc = {
    data: opts.initial,
  } as {
    data: any;
    create: (data: any, type: any, cb: (error: Error | undefined) => any) => any;
    submitOp: (op: any) => any;
    on: (ev: string, listener: (a: any) => any) => any;
    subscribe: (listener: (d: any) => any) => any;
    kind: "local" | "synced";
  };
  doc.create = (data: any, type: any, cb: (error?: Error) => any) => {
    doc.data = json1.type.create(data);
    if (!opts.noStorage) {
      localStorage.setItem(collection + "-" + id, JSON.stringify(doc.data));
    }
    if (typeof cb == "function") {
      cb();
    }
  };
  doc.submitOp = (op: any) => {
    try {
      doc.data = json1.type.apply(doc.data, op);
      if (!opts.noStorage) {
        localStorage.setItem(collection + "-" + id, JSON.stringify(doc.data));
      }
      onOp();
    } catch (error) {
      onOp(error as Error);
      console.error(error, op);
    }
  };
  doc.on = (ev: string, listener: (a?: any) => any) => {
    switch (ev) {
      case "op":
        onOp = listener;
        break;

      default:
        break;
    }
  };
  doc.subscribe = (listener: (e?: Error) => any) => listener();
  doc.kind = "local";

  return doc as any as Doc;
};

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

  let presence: any; // Presence<PresenceData>;
  //let localPresence: any; // LocalPresence<PresenceData>;

  let connected = false;

  //let myColor = `hsl(${Math.random() * 360} 100% 50%)`;

  const { subscribe, set, update } = writable<{
    connected: boolean;
    doc: /* Doc */ Root | null;
    /** True if document was fetched but is undefined */
    missing: boolean;
    presences: unknown;
    presenceTargets: unknown;
    mode: "local" | "synced";
    chartInfo: null | any;
  }>({
    connected,
    doc: null,
    missing: false,
    presences: {},
    presenceTargets: {},
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
      socket.addEventListener("error", (e) => console.warn(e.message, e));

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

      presence = connection.getPresence("x-" + docId);
      presence.subscribe((e: any) => console.log("presence subscribe callback", e));
      const presences: { [key: string]: PresenceData } = {};
      const presenceTargets: { [key: string]: string } = {};
      presence.on("receive", (presenceId: string, data: any) => {
        if (data === null) {
          delete presenceTargets[presences[presenceId].selected];
          delete presences[presenceId];
          update((d) => {
            d.presences = presences;
            d.presenceTargets = presenceTargets;
            return d;
          });
        } else {
          if (
            typeof presences[presenceId] != "undefined" &&
            typeof presenceTargets[presences[presenceId].selected] != "undefined"
          ) {
            delete presenceTargets[presences[presenceId].selected];
          }
          presences[presenceId] = {
            selected: data.selected,
            color: data.color,
          };
          presenceTargets[data.selected] = presenceId;
          update((d) => {
            d.presences = presences;
            d.presenceTargets = presenceTargets;
            return d;
          });
        }
      });
      presence.on("error", (e: any) => {
        console.log("presence error", e);
      });
      // localPresence = presence.create();

      const onData = (e?: Error) => {
        if (e && typeof e.message == "string") notifications.addError(e.message);
        console.log("doc", doc, doc.data);
        update((d) => ({
          doc: doc.data,
          missing: typeof doc.data === "undefined",
          connected,
          presences,
          presenceTargets,
          mode: doc.mode === "synced" ? "synced" : "local",
          chartInfo: d.chartInfo,
        }));
      };
      // window.localPresence = localPresence
      // window.presence = presence

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
    create: (synced: boolean, teamId?: string, folderId?: string) => {
      return new Promise<string>((resolve, reject) => {
        if (synced) {
          fetch("/api/chart", {
            method: "POST",
            body: JSON.stringify({ teamId, folderId }),
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
          doc.on("error", (e: Error) => console.warn("doc error", e));
          doc.create(defDoc, json1.type.uri, () => resolve(docId));
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
      }

      update((d) => ({
        ...d,
        chartInfo: {
          ...d.chartInfo,
          name: info.name,
        },
      }));
    },

    chart: () => {
      const scoped = createScope<Chart>(db, ["doc", "chart"]);
      return {
        ...scoped,
        hBar: (elementIndex: number) => {
          const hbarScope = createScope<HBar>(scoped, ["elements", elementIndex, "d"]);

          return {
            ...hbarScope,
            scale: () => scale(hbarScope, ["scale"], doc),
            colors: () => colors(hbarScope, ["colors"], doc),
          };
        },
      };
    },
    dataSet: (index: number) => {
      const dataSetScope = createScope<Set>(db, ["doc", "data", "sets", index]);

      return {
        ...dataSetScope,
        setRaw: (value: string) => doc.submitOp(["data", "sets", index, "raw", { r: 0, i: value }]),
        setType: (value: string) =>
          doc.submitOp(["data", "sets", index, "type", { r: 0, i: value }]),
        setName: (value: string) =>
          doc.submitOp(["data", "sets", index, "name", { r: 0, i: value }]),

        setColumnType: (colIndex: number, value: string) =>
          doc.submitOp(["data", "sets", index, "rows", colIndex, "type", { r: 0, i: value }]),
        setColumnDateFormat: (colIndex: number, value: string) =>
          doc.submitOp(["data", "sets", index, "rows", colIndex, "dateFormat", { r: 0, i: value }]),
        addColumn: (colIndex: number, key: string, type: string) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "rows",
            colIndex,
            { i: { key, type, dateFormat: "" } },
          ]),
        removeColumn: (colIndex: number) =>
          doc.submitOp(["data", "sets", index, "rows", colIndex, { r: true }]),
        setColumns: (value: { key: string; type: string; dateFormat: string }[]) =>
          doc.submitOp(["data", "sets", index, "rows", { r: 0, i: value }]),

        addTranspose: (transposeIndex: number) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            {
              i: {
                from: [],
                toKey: "",
                toValue: "",
                valueType: "text",
                keyType: "text",
              },
            },
          ]),
        removeTranspose: (transposeIndex: number) =>
          doc.submitOp(["data", "sets", index, "transpose", transposeIndex, { r: true }]),
        setTransposeToKey: (transposeIndex: number, value: string) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "toKey",
            { r: 0, i: value },
          ]),
        setTransposeToValue: (transposeIndex: number, value: string) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "toValue",
            { r: 0, i: value },
          ]),
        setTransposeValueType: (transposeIndex: number, value: string) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "valueType",
            { r: 0, i: value },
          ]),
        setTransposeKeyType: (transposeIndex: number, value: string) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "keyType",
            { r: 0, i: value },
          ]),
        addTransposeFrom: (transposeIndex: number, fromIndex: number) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "from",
            fromIndex,
            { i: "" },
          ]),
        removeTransposeFrom: (transposeIndex: number, fromIndex: number) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "from",
            fromIndex,
            { r: true },
          ]),
        setTransposeFrom: (transposeIndex: number, fromIndex: number, value: string) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "from",
            fromIndex,
            { r: 0, i: value },
          ]),
        setTransposeFromArray: (transposeIndex: number, value: string[]) =>
          doc.submitOp([
            "data",
            "sets",
            index,
            "transpose",
            transposeIndex,
            "from",
            { r: 0, i: value },
          ]),
      };
    },
    addDataSet: (index: number) =>
      doc.submitOp([
        "data",
        "sets",
        index,
        {
          i: {
            id: "" + Date.now(),
            type: "tsv",
            name: `Data set ${index + 1}`,
            raw: "",
            rows: [],
            transpose: [],
          },
        },
      ]),
  };
})();

export const lineStyle = (
  scope: ReturnType<typeof createScope>,
  key: (string | number)[],
  doc: any,
) => {
  const styleScope = createScope<LineStyleKey>(scope, key);

  return {
    ...styleScope,
    setLabelLocation: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "location", { r: 0, i: value }]),
    setLabelText: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "text", { r: 0, i: value }]),
    setKey: (value: string) => doc.submitOp([...styleScope.path.slice(1), "k", { r: 0, i: value }]),
    setColor: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "color", { r: 0, i: value }]),
    setLabelColor: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "color", { r: 0, i: value }]),
    seContextColor: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "contextColor", { r: 0, i: value }]),
    setwidth: (value: number) =>
      doc.submitOp([...styleScope.path.slice(1), "width", { r: 0, i: value }]),
    setSymbols: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "symbols", { r: 0, i: value }]),
    setLabelX: (value: number) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "x", { r: 0, i: value }]),
    setLabelY: (value: number) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "y", { r: 0, i: value }]),
    setLabelXOffset: (value: number) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "rx", { r: 0, i: value }]),
    setLabelYOffset: (value: number) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "ry", { r: 0, i: value }]),
    setLabelLine: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "label", "line", { r: 0, i: value }]),
    setMissingStyle: (value: string) =>
      doc.submitOp([...styleScope.path.slice(1), "missingStyle", { r: 0, i: value }]),
    delete: () => doc.submitOp([...styleScope.path.slice(1), { r: 0 }]),
  };
};

export const scale = (
  scope: ReturnType<typeof createScope>,
  key: (string | number)[],
  doc: any,
) => {
  const scaleScope = createScope<Scale>(scope, key);

  return {
    ...scaleScope,
    setScaleFrom: (value: number) =>
      doc.submitOp([...scaleScope.path.slice(1), "dataRange", 0, { r: 0, i: value }]),
    setScaleTo: (value: number) =>
      doc.submitOp([...scaleScope.path.slice(1), "dataRange", 1, { r: 0, i: value }]),
  };
};

export const colors = (
  scope: ReturnType<typeof createScope>,
  key: (string | number)[],
  doc: any,
) => {
  const scaleScope = createScope<Colors>(scope, key);

  return {
    ...scaleScope,
    setColorScaleKey: (colorIndex: number, value: string) =>
      doc.submitOp([...scaleScope.path.slice(1), "byKey", colorIndex, "k", { r: 0, i: value }]),
    setColorScaleColor: (colorIndex: number, value: string) =>
      doc.submitOp([...scaleScope.path.slice(1), "byKey", colorIndex, "c", { r: 0, i: value }]),
    setColorScaleLegend: (colorIndex: number, value: string) =>
      doc.submitOp([
        ...scaleScope.path.slice(1),
        "byKey",
        colorIndex,
        "legend",
        { r: 0, i: value },
      ]),
    addColorScaleColor: (colorIndex: number, k = "", c = "", legend = "") =>
      doc.submitOp([...scaleScope.path.slice(1), "byKey", colorIndex, { i: { c, k, legend } }]),
    removeColorScaleColor: (colorIndex: number) =>
      doc.submitOp([...scaleScope.path.slice(1), "byKey", colorIndex, { r: 0 }]),
    setColorScaleDefaultColor: (value: string) =>
      doc.submitOp([...scaleScope.path.slice(1), "default", { r: 0, i: value }]),
    moveColorUp: (colorIndex: number) =>
      doc.submitOp([
        ...scaleScope.path.slice(1),
        "byKey",
        [colorIndex - 1, { d: 0 }],
        [colorIndex, { p: 0 }],
      ]),
    moveColorDown: (colorIndex: number) =>
      doc.submitOp([
        ...scaleScope.path.slice(1),
        "byKey",
        [colorIndex, { p: 0 }],
        [colorIndex + 1, { d: 0 }],
      ]),
  };
};
