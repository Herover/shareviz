import { readable, writable } from 'svelte/store';

import ReconnectingWebSocket from 'reconnecting-websocket';
 // @ts-ignore
import {json1} from 'sharedb-client-browser/dist/ot-json1-umd.cjs';
 // @ts-ignore
import sharedb from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { WebSocket } from 'ws';
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

      const socket = new ReconnectingWebSocket('ws://localhost:8080', [], {
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
    // setScaleRange: (scaleIndex: number, rangeIndex: number, value: number) => doc.submitOp(["spec", "scales", scaleIndex, "range", rangeIndex, { r: 0, i: value }]),
    // setScaleDomain: (scaleIndex: number, domainIndex: number, value: number) => doc.submitOp(["spec", "scales", scaleIndex, "domain", domainIndex, { r: 0, i: value }]),
    // increment: () => doc.submitOp(['numClicks', { ena: 1 }]),
    // decrement: () => doc.submitOp(['numClicks', { ena: -1 }]),
    // incrementItem: (i: number) => doc.submitOp(['counters', i, 'n', { ena: 1 }]),
    // decrementItem: (i: number) => doc.submitOp(['counters', i, 'n', { ena: -1 }]),
    // addItem: (name: string) => doc.submitOp(['counters', doc.data.counters.length, { i: { t: name, n: 0 } }]),
    // setPresence: (id: string) => localPresence.submit({ selected: id, color: myColor }, (err) => { if(err) console.warn(err) }),
    // setWidth:(value: number) => doc.submitOp(["spec", "canvas", "width", { r: 0, i: value }]),
    // setHeight:(value: number) => doc.submitOp(["spec", "canvas", "height", { r: 0, i: value }]),

    duplicateSpec: (sourceIndex: number, insertAt: number) => doc.submitOp(["specs", insertAt, { i: doc.data.specs[sourceIndex] }]),
    setConfigTitle: (configIndex: number, title: string) => doc.submitOp(["specs", configIndex, "title", { r: 0, i: title }]),
    setConfigX: (configIndex: number, index: number, value: string | null) => {
      if (value == null || value == "") {
        doc.submitOp(["specs", configIndex, "channels", "x", "set", index, { r: 0 }]);
      } else {
        doc.submitOp(["specs", configIndex, "channels", "x", "set", index, { r: 0, i: value }]);
      }
    },
    addConfigX: (configIndex: number, index: number, value: string) => {
      doc.submitOp(["specs", configIndex, "channels", "x", "set", index, { i: value }]);
    },
    setConfigY: (configIndex: number, index: number, value: string | null) => {
      if (value == null || value == "") {
        doc.submitOp(["specs", configIndex, "channels", "y", "set", index, { r: 0 }]);
      } else {
        doc.submitOp(["specs", configIndex, "channels", "y", "set", index, { r: 0, i: value }]);
      }
    },
    addConfigY: (configIndex: number, index: number, value: string) => {
      doc.submitOp(["specs", configIndex, "channels", "y", "set", index, { i: value }]);
    },
    setConfigColor: (configIndex: number, index: number, value: string | null) => {
      if (value == null || value == "") {
        doc.submitOp(["specs", configIndex, "channels", "color", "set", index, { r: 0 }]);
      } else {
        doc.submitOp(["specs", configIndex, "channels", "color", "set", index, { r: 0, i: value }]);
      }
    },
    addConfigColor: (configIndex: number, index: number, value: string) => {
      doc.submitOp(["specs", configIndex, "channels", "color", "set", index, { i: value }]);
    },
    setConfigLabel: (configIndex: number, index: number, value: string | null) => {
      if (value == null || value == "") {
        doc.submitOp(["specs", configIndex, "channels", "label", "set", index, { r: 0 }]);
      } else {
        doc.submitOp(["specs", configIndex, "channels", "label", "set", index, { r: 0, i: value }]);
      }
    },
    addConfigLabel: (configIndex: number, index: number, value: string) => {
      doc.submitOp(["specs", configIndex, "channels", "label", "set", index, { i: value }]);
    },
    setConfigGeometry: (configIndex: number, value: string) => {
      doc.submitOp(["specs", configIndex, "geometry", { r: 0, i: value }]);
    },
    setConfigCoordSystem: (configIndex: number, value: string) => {
      doc.submitOp(["specs", configIndex, "coordSystem", { r: 0, i: value }]);
    },
  };
}();
