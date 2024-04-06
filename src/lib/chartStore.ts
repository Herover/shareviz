import { readable, writable } from 'svelte/store';

import ReconnectingWebSocket from 'reconnecting-websocket';
 // @ts-ignore
import {json1} from 'sharedb-client-browser/dist/ot-json1-umd.cjs';
 // @ts-ignore
import sharedb from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { WebSocket } from 'ws';
import { createScope } from './dataScope';
import { Config } from 'vizzu';
import type { HBar, Line, Set } from './chart';
// import { type Doc } from "sharedb";
// import { type Connection, type LocalPresence, type Presence } from 'sharedb/lib/client';

interface PresenceData {
  selected: string
  color: string
}

export const db = function createDB() {
  let doc: any; // Doc;
  
  let presence: any; // Presence<PresenceData>;
  let localPresence: any; // LocalPresence<PresenceData>;

  let connected = false;

  let myColor = `hsl(${Math.random() * 360} 100% 50%)`;

  const { subscribe, set, update } = writable<{
    connected: boolean,
    doc: /* Doc */ any | null,
    presences: unknown,
    presenceTargets: unknown,
  }>({ connected, doc: null, presences: {}, presenceTargets: {} });

  return {
    subscribe, set, update,
    connect: (id: string) => {
      const host = typeof window == "undefined" ? "localhost" : window.location.host.split(":")[0];
      console.log(`HOST IS ws://${host}:8080`)

      const socket = new ReconnectingWebSocket(`ws://${host}:8080`, [], {
        // ShareDB handles dropped messages, and buffering them while the socket
        // is closed has undefined behavior
        maxEnqueuedMessages: 0,
        WebSocket: WebSocket,
      });
      
      // @ts-ignore
      socket.addEventListener("open", () => update(d => {
        d.connected = connected = true;
        return d;
      }));
      // @ts-ignore
      socket.addEventListener("close", () => update(d => {
        d.connected = connected = false;
        return d;
      }));
        

      sharedb.types.register(json1.type);
      const connection: /* Connection */ any = new sharedb.Connection(socket);
    
      // Create local Doc instance mapped to 'examples' collection document with id 'counter'
      doc = connection.get('examples', id);

      
      presence = connection.getPresence('x-' + id);
      presence.subscribe((e: any) => console.log("presence subscribe callback", e));
      const presences: {[key: string]: PresenceData} = {};
      const presenceTargets: {[key: string]: string} = {};
      presence.on('receive', (presenceId: string, data: any) => {
        if (data === null) {
          delete presenceTargets[presences[presenceId].selected];
          delete presences[presenceId]
          // @ts-ignore
          update(d => {
            d.presences = presences;
            d.presenceTargets = presenceTargets;
            return d;
          });
        } else {
          if (presences[presenceId] && presenceTargets[presences[presenceId].selected]) {
            delete presenceTargets[presences[presenceId].selected];
          }
          presences[presenceId] = { selected: data.selected, color: data.color };
          presenceTargets[data.selected] = presenceId;
          // @ts-ignore
          update(d => {
            d.presences = presences;
            d.presenceTargets = presenceTargets;
            return d;
          });
        }
      });
      presence.on("error", (e: any) => {
        console.log("presence error", e)
      })
      localPresence = presence.create();
    
      const onData = () => {
        console.log("onData")
        set({
          doc: doc.data,
          connected,
          presences,
          presenceTargets,
        });
      }
      // window.localPresence = localPresence
      // window.presence = presence
    
      // Get initial value of document and subscribe to changes
      doc.subscribe(onData);
      // When document changes (by this client or any other, or the server),
      // update the number on the page
      doc.on('op', onData);

      return () => socket.close();
    },

    chart: () => {
      const scoped = createScope<Config.Channel>(db, ["chart"]);
      return {
        ...scoped,
        hBar: (elementIndex: number) => {
          const hbarScope = createScope<HBar>(scoped, ["chart", "elements", elementIndex, "hBar"]);

          return {
            ...hbarScope,
            setLabelWidth: (value: number) => doc.submitOp(["chart", "elements", elementIndex, "hBar", "labelWidth", { r: 0, i: value }]),
            setCategories: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "hBar", "categories", { r: 0, i: value }]),
            setSubCategories: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "hBar", "subCategories", { r: 0, i: value }]),
            setValue: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "hBar", "value", { r: 0, i: value }]),
            setRepeat: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "hBar", "repeat", { r: 0, i: value }]),
            setDataSet: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "hBar", "dataSet", { r: 0, i: value }]),
          }
        },
        line: (elementIndex: number) => {
          const hbarScope = createScope<Line>(scoped, ["chart", "elements", elementIndex, "line"]);

          return {
            ...hbarScope,
            setDataSet: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "line", "dataSet", { r: 0, i: value }]),
            setXKey: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "line", "x", "key", { r: 0, i: value }]),
            setYKey: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "line", "y", "key", { r: 0, i: value }]),
            setCategoriesKey: (value: string) => doc.submitOp(["chart", "elements", elementIndex, "line", "categories", { r: 0, i: value }]),
            setFill: (value: boolean) => doc.submitOp(["chart", "elements", elementIndex, "line", "fill", { r: 0, i: value }]),
            setStack: (value: boolean) => doc.submitOp(["chart", "elements", elementIndex, "line", "stack", { r: 0, i: value }]),
          };
        },
        setConfigTitle: (value: string) => doc.submitOp(["chart", "title", { r: 0, i: value }]),
        setConfigSubTitle: (value: string) => doc.submitOp(["chart", "subTitle", { r: 0, i: value }]),
        setConfigHeight: (value: number) => doc.submitOp(["chart", "height", { r: 0, i: value }]),
        setConfigWidth: (value: number) => doc.submitOp(["chart", "width", { r: 0, i: value }]),
        setSourceTextLeft: (value: string) => doc.submitOp(["chart", "sourceTextLeft", { r: 0, i: value }]),
        setSourceTextLeftLink: (value: string) => doc.submitOp(["chart", "sourceTextLeftLink", { r: 0, i: value }]),
        setSourceTextRight: (value: string) => doc.submitOp(["chart", "sourceTextRight", { r: 0, i: value }]),
        setSourceTextLeftRight: (value: string) => doc.submitOp(["chart", "sourceTextLeftRight", { r: 0, i: value }]),
        setScaleFrom: (scaleIndex: number, value: number) => doc.submitOp(["chart", "scales", scaleIndex, "dataRange", 0, { r: 0, i: value }]),
        setScaleTo: (scaleIndex: number, value: number) => doc.submitOp(["chart", "scales", scaleIndex, "dataRange", 1, { r: 0, i: value }]),
        setColorScaleKey: (scaleIndex: number, colorIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, "k", { r: 0, i: value }]),
        setColorScaleColor: (scaleIndex: number, colorIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, "c", { r: 0, i: value }]),
        setColorScaleLegend: (scaleIndex: number, colorIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, "legend", { r: 0, i: value }]),
        addColorScaleColor: (scaleIndex: number, colorIndex: number, k = "", c = "", legend = "") => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, { i: { c, k, legend } }]),
        removeColorScaleColor: (scaleIndex: number, colorIndex: number) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", colorIndex, { r: 0 }]),
        setColorScaleDefaultColor: (scaleIndex: number, value: string) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "default", { r: 0, i: value }]),
        moveColorUp: (scaleIndex: number, colorIndex: number) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", [ colorIndex, { p: 0 } ], [ colorIndex - 1, { d: 0 } ]]),
        moveColorDown: (scaleIndex: number, colorIndex: number) => doc.submitOp(["chart", "scales", scaleIndex, "colors", "byKey", [ colorIndex, { p: 0 } ], [ colorIndex + 1, { d: 0 } ]]),
      };
    },
    dataSet: (index: number) => {
      const dataSetScope = createScope<Set>(db, ["doc", "data", "sets", index]);
      
      return {
        ...dataSetScope,
        setRaw: (value: string) => doc.submitOp(["data", "sets", index, "raw", { r: 0, i: value }]),
        setType: (value: string) => doc.submitOp(["data", "sets", index, "type", { r: 0, i: value }]),
        setColumnType: (colIndex: number, value: string) => doc.submitOp(["data", "sets", index, "rows", colIndex, "type", { r: 0, i: value }]),
        addColumn: (colIndex: number, key: string, type: string) => doc.submitOp(["data", "sets", index, "rows", colIndex, { i: { key, type }}]),
        removeColumn: (colIndex: number) => doc.submitOp(["data", "sets", index, "rows", colIndex, { r: true }]),
      };
    },
  };
}();
