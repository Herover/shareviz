// SPDX-License-Identifier: MPL-2.0

import ReconnectingWebSocket from "reconnecting-websocket";
import * as json1 from "ot-json1";
import ShareDB from "sharedb/lib/client";
import { WebSocket } from "ws";
import { notifications } from "../notificationStore";
import { migrate } from "../chartMigrate";
import { getLocalDoc, localPrefix } from "../chartStore";
import { defDoc } from "../initialDoc";
import type { Root } from "../chart";

export class ShareDBConnection {
  id: undefined | string;
  connected = $state(false);
  chartInfo: null | { name: string } = $state(null);

  #doc: ShareDB.Doc = $state(new ShareDB.Doc()); // Doc;
  #data?: Root = $state();
  #connection?: ShareDB.Connection;
  #socket?: ReconnectingWebSocket;

  #events: EventTarget;

  missing = $derived(typeof this.#doc?.data == "undefined");
  mode: "synced" | "local" | "invalid" = "invalid";

  constructor() {
    this.#events = new EventTarget();
  }

  connect() {
    const socket = new ReconnectingWebSocket(`//${window.location.host}/sharedb`, ["ws"], {
      // ShareDB handles dropped messages, and buffering them while the socket
      // is closed has undefined behavior
      maxEnqueuedMessages: 0,
      WebSocket: WebSocket,
    });

    socket.addEventListener("error", this.#onSocketError.bind(this));
    socket.addEventListener("open", this.#onSocketOpen.bind(this));
    socket.addEventListener("close", this.#onSocketClose.bind(this));

    ShareDB.types.register(json1.type);

    this.#connection = new ShareDB.Connection(socket as any);
    this.#socket = socket;
  }

  disconnect() {
    if (!this.#connection) {
      throw new Error("connect() has not been called yet");
    }
    if (this.#socket) {
      this.#socket.removeEventListener("error", this.#onSocketError);
      this.#socket.removeEventListener("open", this.#onSocketOpen);
      this.#socket.removeEventListener("close", this.#onSocketClose);
      this.#connection.close();
      this.#socket.close();

      // Cannot `delete` private identifiers
      this.#connection = undefined;
      this.#socket = undefined;
    }
  }

  #onSocketError(e: any) {
    console.warn(e.message, e);
  }
  #onSocketOpen() {
    this.connected = true;
  }
  #onSocketClose() {
    this.connected = false;
  }

  load(docId: string, synced: boolean) {
    if (!this.#connection) {
      throw new Error("connect() has not been called yet");
    }

    this.id = docId;
    const doc = synced ? this.#connection.get("examples", docId) : getLocalDoc("examples", docId);
    doc.on("error", (e: ShareDB.Error) => notifications.addError(e.message));

    if (!synced) {
      migrate(doc);
    }

    /*
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
    */

    const onData = (e: any) => {
      if (e && typeof e.message == "string") notifications.addError(e.message);
      // console.log("got doc", doc.data);
      this.#data = doc.data;

      this.#events.dispatchEvent(new CustomEvent("data", { detail: { doc: doc.data } }));
    };

    // Get initial value of document and subscribe to changes
    doc.subscribe(onData);
    doc.on("op", onData);

    if (synced) {
      fetch("/api/chart/" + docId)
        .then((res) => res.json())
        .then((data) => (this.chartInfo = data.chart));
    }

    this.#doc = doc;
  }

  create(synced: boolean, teamId?: string, folderId?: string) {
    return new Promise<string>((resolve, reject) => {
      if (!this.#connection) {
        reject("connect() has not been called yet");
        return;
      }
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
        const doc = synced
          ? this.#connection.get("examples", docId)
          : getLocalDoc("examples", docId);
        doc.on("error", (e: ShareDB.Error) => console.warn("doc error", e));
        doc.create(defDoc, json1.type.uri, () => resolve(docId));
      }
    });
  }

  get data(): Root | undefined {
    return this.#data;
  }

  get doc(): ShareDB.Doc {
    return this.#doc;
  }

  on(type: "data", cb: (e: CustomEvent) => void) {
    return this.#events.addEventListener(type, (e) => cb(e as CustomEvent));
  }

  off(type: "data", cb: (e: CustomEvent) => void) {
    return this.#events.removeEventListener(type, (e) => cb(e as CustomEvent));
  }
}
