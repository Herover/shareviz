// SPDX-License-Identifier: MPL-2.0

import ReconnectingWebSocket from "reconnecting-websocket";
import * as json1 from "ot-json1";
import * as richText from "rich-text";
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
  /**
   * Caret position inside the selected field as a document character index (rich-text fields
   * only), or null when unknown. Relayed as-is by the server.
   */
  caret?: number | null;
  // name/color/id/image are stamped server-side from the authenticated session.
  color: string;
  name: string;
  id: string;
  image?: string;
  /**
   * ShareDB presence id of the session that announced this data — stamped client-side on
   * receive. Unlike `id` (the user id) it is unique per session, so it can key per-caret state.
   */
  presenceId?: string;
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
  // Announcement waiting for our pending ops to be acked (see #flushPresence).
  #pendingPresence: { selected: string; caret: number | null } | null = null;

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

    // Embed the rich-text (Quill Delta) OT type inside json1 so prose fields like the
    // chart description can be edited concurrently and merged instead of clobbered.
    json1.type.registerSubtype(richText);
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
      this.#pendingPresence = null;
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
            caret: typeof data.caret === "number" ? data.caret : null,
            color: data.color ?? "",
            name: data.name ?? "",
            id: data.id ?? "",
            image: data.image,
            presenceId,
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
    doc.on("nothing pending", () => {
      onData(); // Trigger after version has been updated
      this.#flushPresence(); // our ops are acked, a deferred caret announcement may go out
    });

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

  /** Remote editors focused on the given address or any address nested beneath it. */
  editorsUnder(prefix: PresenceAddress): PresenceData[] {
    const result: PresenceData[] = [];
    for (const [presenceId, presence] of Object.entries(this.presences)) {
      if (presenceId === this.#localPresenceId || !presence.selected) {
        continue;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(presence.selected);
      } catch {
        continue;
      }
      if (!Array.isArray(parsed) || parsed.length < prefix.length) {
        continue;
      }
      if (prefix.every((segment, i) => parsed[i] === segment)) {
        result.push(presence);
      }
    }
    return result;
  }

  /** Read the raw value stored at a document path, or undefined if it doesn't exist. */
  #valueAt(path: PresenceAddress): unknown {
    let node: unknown = this.#doc.data;
    for (const segment of path) {
      if (node == null || typeof node !== "object") {
        return undefined;
      }
      node = (node as Record<string | number, unknown>)[segment];
    }
    return node;
  }

  /**
   * Submit a rich-text (Quill Delta) change at `path`. The change is expressed relative to
   * the field's current Delta. A field that is absent is lazily created with an `insertOp`,
   * a field still holding a legacy plain string is converted in place with a `replaceOp`,
   * and an existing Delta field merges via an `editOp`.
   */
  submitRichTextChange(path: PresenceAddress, change: richText.Delta) {
    if (change.ops.length === 0) {
      return;
    }
    const current = this.#valueAt(path);
    if (current === undefined) {
      const initial = new richText.Delta().compose(change);
      this.#doc.submitOp(json1.insertOp(path, { ops: initial.ops } as any));
    } else if (typeof current === "string") {
      const base = new richText.Delta(current ? [{ insert: current }] : []);
      const initial = base.compose(change);
      this.#doc.submitOp(json1.replaceOp(path, current, { ops: initial.ops } as any));
    } else {
      this.#doc.submitOp(json1.editOp(path, "rich-text", change.ops));
    }
  }

  /**
   * Announce which field this session is editing, or pass null to clear. Rich-text fields also
   * pass their caret as a document character index so collaborators can render it.
   */
  setLocalSelection(address: PresenceAddress | null, caret: number | null = null) {
    if (!this.#localPresence) {
      return;
    }
    const selected = address ? serializeAddress(address) : "";
    const caretValue = selected && typeof caret === "number" ? caret : null;
    const submitKey = `${selected} ${caretValue}`;
    if (submitKey === this.#lastSelected) {
      return;
    }
    this.#lastSelected = submitKey;
    this.#pendingPresence = { selected, caret: caretValue };
    this.#flushPresence();
  }

  /**
   * Submit the latest announcement, but only while none of our ops are awaiting the server.
   * ShareDB queues ops while one is in flight, yet presence messages skip that queue — an
   * announcement sent mid-burst would reach collaborators *before* the ops its caret index is
   * expressed against, and they would transform it through those ops a second time. Deferred
   * announcements are flushed by the doc's "nothing pending" event.
   */
  #flushPresence() {
    if (!this.#pendingPresence || !this.#localPresence || this.#doc.hasWritePending()) {
      return;
    }
    const payload = this.#pendingPresence;
    this.#pendingPresence = null;
    this.#localPresence.submit(payload as PresenceData, (err) => {
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
