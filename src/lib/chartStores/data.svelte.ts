// SPDX-License-Identifier: MPL-2.0

import ReconnectingWebSocket from "reconnecting-websocket";
import * as json1 from "ot-json1";
import ShareDB, { Presence, LocalPresence } from "sharedb/lib/client";
import { WebSocket } from "ws";
import { migrate } from "../chartMigrate";
import { getLocalDoc, localPrefix } from "../chartStore";
import { defDoc } from "../initialDoc";
import type { Root } from "../chart";
import { getLogger } from "$lib/log.js";

const logger = getLogger();

export type PresenceAddress = (string | number)[];

/** Stable string key for a presence address; used for map lookups and as the wire value. */
export const serializeAddress = (address: PresenceAddress): string => JSON.stringify(address);

export interface PresenceData {
  /** Serialized {@link PresenceAddress} of the focused field, or "" when idle. */
  selected: string;
  // name/color/id/image are stamped server-side from the authenticated session.
  color: string;
  name: string;
  id: string;
  image?: string;
}

export class ShareDBConnection {
  id: undefined | string;
  connected = $state(false);
  chartInfo: null | { name: string; id: string; chartRef: string } = $state(null);

  #doc: ShareDB.Doc = $state(new ShareDB.Doc()); // Doc;
  #version: number = $state(-1);
  #data?: Root = $state();
  #connection?: ShareDB.Connection;
  #socket?: ReconnectingWebSocket;
  #presence?: Presence<PresenceData>;
  #localPresence?: LocalPresence<PresenceData>;
  #localPresenceId?: string;
  #lastSelected = "";

  #pinger?: NodeJS.Timeout;

  #events: EventTarget;

  missing = $derived(typeof this.#doc?.data == "undefined");
  mode: "synced" | "local" | "invalid" = "invalid";
  presences: { [key: string]: PresenceData } = $state({});

  /** Remote editors grouped by the serialized address they are focused on (excludes our session). */
  editorsByAddress: Record<string, PresenceData[]> = $derived.by(() => {
    const byAddress: Record<string, PresenceData[]> = {};
    for (const [presenceId, presence] of Object.entries(this.presences)) {
      if (presenceId === this.#localPresenceId || !presence.selected) {
        continue;
      }
      const list = byAddress[presence.selected];
      if (list) {
        list.push(presence);
      } else {
        byAddress[presence.selected] = [presence];
      }
    }
    return byAddress;
  });

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

    // Some load-balancers/proxies might close websockets that are inactive for a long time
    this.#pinger = setInterval(() => {
      this.#connection?.ping();
    }, 25 * 1000);
  }

  disconnect() {
    if (!this.#connection) {
      throw new Error("connect() has not been called yet");
    }
    if (this.#presence) {
      this.#presence.unsubscribe();
      this.#localPresence = undefined;
      this.#localPresenceId = undefined;
      this.#lastSelected = "";
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
      clearInterval(this.#pinger);
      this.#pinger = undefined;
    }
  }

  #onSocketError(e: any) {
    logger.error(e.message, e);
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
    doc.on("error", (e: ShareDB.Error) =>
      this.#events.dispatchEvent(new CustomEvent("error", { detail: { error: e } })),
    );

    if (!synced) {
      migrate(doc);
    } else {
      this.#presence = this.#connection.getPresence("presence-" + docId);
      this.#presence.subscribe((e: any) => logger.error("presence subscribe callback", e));
      const presences: { [key: string]: PresenceData } = {};
      this.#presence.on("receive", (presenceId: string, data: PresenceData | null) => {
        if (data === null) {
          delete presences[presenceId];
        } else {
          presences[presenceId] = {
            selected: data.selected ?? "",
            color: data.color ?? "",
            name: data.name ?? "",
            id: data.id ?? "",
            image: data.image,
          };
        }
        this.presences = { ...presences };
      });
      this.#presence.on("error", (e: any) => {
        logger.error("presence error", e);
      });
      // Identity (name/color/id/image) is stamped server-side from the authenticated
      // session, so the client only ever announces which field it is focused on.
      this.#localPresence = this.#presence.create();
      this.#localPresenceId = this.#localPresence.presenceId;
      this.#localPresence.submit({ selected: "" } as PresenceData);
    }
    const onData = (e?: any) => {
      if (e && typeof e.message == "string") {
        this.#events.dispatchEvent(new CustomEvent("error", { detail: { error: e } }));
      }
      this.#data = doc.data;
      this.#version = doc.version ?? -1;

      this.#events.dispatchEvent(
        new CustomEvent("data", { detail: { doc: doc.data, version: doc.version } }),
      );
    };

    // Get initial value of document and subscribe to changes
    doc.subscribe((e) => onData(e));
    doc.on("op", () => onData()); // Trigger when we have done something
    doc.on("nothing pending", () => onData()); // Trigger after version has been updated

    if (synced) {
      fetch("/api/chart/" + docId)
        .then((res) => res.json())
        .then((data) => (this.chartInfo = data.chart));
    }

    this.#doc = doc;
  }

  /** Remote editors currently focused on the given address (excludes our session). */
  editorsAt(address: PresenceAddress): PresenceData[] {
    return this.editorsByAddress[serializeAddress(address)] ?? [];
  }

  /** Announce which field this session is editing, or pass null to clear. */
  setLocalSelection(address: PresenceAddress | null) {
    if (!this.#localPresence) {
      return;
    }
    const selected = address ? serializeAddress(address) : "";
    if (selected === this.#lastSelected) {
      return;
    }
    this.#lastSelected = selected;
    this.#localPresence.submit({ selected } as PresenceData, (err) => {
      if (err) {
        logger.error("presence submit", err);
      }
    });
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
        doc.on("error", (e: ShareDB.Error) =>
          this.#events.dispatchEvent(new CustomEvent("error", { detail: { error: e } })),
        );
        doc.create(defDoc, json1.type.uri, () => resolve(docId));
      }
    });
  }

  get data(): Root | undefined {
    return this.#data;
  }

  get version(): number {
    return this.#version;
  }

  get doc(): ShareDB.Doc {
    return this.#doc;
  }

  on(type: "data" | "error", cb: (e: CustomEvent) => void) {
    return this.#events.addEventListener(type, (e) => cb(e as CustomEvent));
  }

  off(type: "data" | "error", cb: (e: CustomEvent) => void) {
    return this.#events.removeEventListener(type, (e) => cb(e as CustomEvent));
  }
}
