// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import { type LineRepeatSettingsKey } from "$lib/chart";

export class RepeatSettingsStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  // #connection?: ShareDBConnection;
  #style: LineRepeatSettingsKey;
  #path: (string | number)[];

  constructor(connection: ShareDBConnection, style: LineRepeatSettingsKey, path: any[]) {
    this.#doc = connection.doc;
    // this.#connection = connection;
    this.#style = style;
    this.#path = path;
  }

  get data(): LineRepeatSettingsKey {
    return this.#style;
  }

  setLabel(value: string) {
    this.#doc.submitOp([...this.#path, "title", { r: 0, i: value }]);
  }
  setOwnChart(value: boolean) {
    this.#doc.submitOp([...this.#path, "ownChart", { r: 0, i: value }]);
  }
  setAllCharts(value: boolean) {
    this.#doc.submitOp([...this.#path, "allCharts", { r: 0, i: value }]);
  }
}
