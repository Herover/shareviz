/* eslint-disable */
import { readable, writable } from 'svelte/store';

import ReconnectingWebSocket from 'reconnecting-websocket';
 // @ts-ignore
import * as json1 from 'ot-json1';
 // @ts-ignore
import ShareDB from 'sharedb/lib/client';
import { WebSocket } from 'ws';
import { createScope } from './dataScope';
import { Config } from 'vizzu';
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
        

      ShareDB.types.register(json1.type);
      const connection: /* Connection */ any = new ShareDB.Connection(socket);
    
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
    channelScope: (configIndex: number, channelKey: string) => {
      const scoped = createScope<Config.Channel>(db, ["specs", configIndex, "channels", channelKey]);
      return {
        ...scoped,
        add: (index: number, value: string) => {
          doc.submitOp(["specs", configIndex, "channels", channelKey, "set", index, { i: value }]);
        },
        set: (index: number, value: string | null) => {
          if (!doc.data.specs[configIndex].channels[channelKey]) {
            doc.submitOp(["specs", configIndex, "channels", channelKey, { r: 0, i: { set: [value] }}]);
          } else if(value == null || value == "") {
            doc.submitOp(["specs", configIndex, "channels", channelKey, "set", index, { r: 0 }]);
          } else {
            doc.submitOp(["specs", configIndex, "channels", channelKey, "set", index, { r: 0, i: value }]);
          }
        },
        setAxis: (val: string | boolean | undefined) => {
          if (val == "true") val = true;
          if (val == "false") val = false;
          if (doc.data.specs[configIndex].channels[channelKey].axis == val) return;
          doc.submitOp(
            ["specs", configIndex, "channels", channelKey, "axis", {
              r: typeof doc.data.specs[configIndex].channels[channelKey].axis == "undefined" ? undefined : 0,
              i: val,
            }],
          );
        },
        setLabels: (val: string | boolean | undefined) => {
          if (val == "true") val = true;
          if (val == "false") val = false;
          if (doc.data.specs[configIndex].channels[channelKey].labels == val) return;
          doc.submitOp(
            ["specs", configIndex, "channels", channelKey, "labels", {
              r: typeof doc.data.specs[configIndex].channels[channelKey].labels == "undefined" ? undefined : 0,
              i: val,
            }],
          );
        },
        setTicks: (val: string | boolean | undefined) => {
          if (val == "true") val = true;
          if (val == "false") val = false;
          if (doc.data.specs[configIndex].channels[channelKey].ticks == val) return;
          doc.submitOp(
            ["specs", configIndex, "channels", channelKey, "ticks", {
              r: typeof doc.data.specs[configIndex].channels[channelKey].ticks == "undefined" ? undefined : 0,
              i: val,
            }],
          );
        },
        setInterlacing: (val: string | boolean | undefined) => {
          if (val == "true") val = true;
          if (val == "false") val = false;
          if (doc.data.specs[configIndex].channels[channelKey].interlacing == val) return;
          doc.submitOp(
            ["specs", configIndex, "channels", channelKey, "interlacing", {
              r: typeof doc.data.specs[configIndex].channels[channelKey].interlacing == "undefined" ? undefined : 0,
              i: val,
            }],
          );
        },
        setGuides: (val: string | boolean | undefined) => {
          if (val == "true") val = true;
          if (val == "false") val = false;
          if (doc.data.specs[configIndex].channels[channelKey].guides == val) return;
          doc.submitOp(
            ["specs", configIndex, "channels", channelKey, "guides", {
              r: typeof doc.data.specs[configIndex].channels[channelKey].guides == "undefined" ? undefined : 0,
              i: val,
            }],
          );
        },
        setMarkerGuides: (val: string | boolean | undefined) => {
          if (val == "true") val = true;
          if (val == "false") val = false;
          if (doc.data.specs[configIndex].channels[channelKey].markerGuides == val) return;
          doc.submitOp(
            ["specs", configIndex, "channels", channelKey, "markerGuides", {
              r: typeof doc.data.specs[configIndex].channels[channelKey].markerGuides == "undefined" ? undefined : 0,
              i: val,
            }],
          );
        },
        setTitle: (value: string | null) => {
          if (!doc.data.specs[configIndex].channels[channelKey].title && value) {
            doc.submitOp(["specs", configIndex, "channels", channelKey, "title", { i: value}]);
          } else if(doc.data.specs[configIndex].channels[channelKey].title && (value == null || value == "")) {
            doc.submitOp(["specs", configIndex, "channels", channelKey, "title", { r: 0 }]);
          } else if(doc.data.specs[configIndex].channels[channelKey].title && value) {
            doc.submitOp(["specs", configIndex, "channels", channelKey, "title", { r: 0, i: value }]);
          }
        },
      };
    },
    setConfigGeometry: (configIndex: number, value: string) => {
      doc.submitOp(["specs", configIndex, "geometry", { r: 0, i: value }]);
    },
    setConfigCoordSystem: (configIndex: number, value: string) => {
      doc.submitOp(["specs", configIndex, "coordSystem", { r: 0, i: value }]);
    },
  };
}();
