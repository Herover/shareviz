// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import { type Color, type LineStyleKey } from "$lib/chart";

export class LineStyleStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  // #connection?: ShareDBConnection;
  #style: LineStyleKey;
  #path: (string | number)[];
  #index?: number;

  constructor(
    connection: ShareDBConnection,
    style: LineStyleKey,
    path: (string | number)[],
    index?: number,
  ) {
    this.#doc = connection.doc;
    // this.#connection = connection;
    this.#style = style;
    this.#path = path;
    this.#index = index;
  }

  get data(): LineStyleKey {
    return this.#style;
  }

  setLabelLocation(value: string) {
    this.#doc.submitOp([...this.#path, "label", "location", { r: 0, i: value }]);
  }
  setLabelText(value: string) {
    this.#doc.submitOp([...this.#path, "label", "text", { r: 0, i: value }]);
  }
  setKey(value: string) {
    this.#doc.submitOp([...this.#path, "k", { r: 0, i: value }]);
  }
  setColor(value: Color) {
    this.#doc.submitOp([...this.#path, "color", { r: 0, i: { light: value } }]);
  }
  setLabelColor(value: Color) {
    this.#doc.submitOp([...this.#path, "label", "color", { r: 0, i: { light: value } }]);
  }
  seContextColor(value: Color) {
    this.#doc.submitOp([...this.#path, "contextColor", { r: 0, i: { light: value } }]);
  }
  setwidth(value: number) {
    this.#doc.submitOp([...this.#path, "width", { r: 0, i: value }]);
  }
  setSymbols(value: string) {
    this.#doc.submitOp([...this.#path, "symbols", { r: 0, i: value }]);
  }
  setLabelX(value: number) {
    this.#doc.submitOp([...this.#path, "label", "x", { r: 0, i: value }]);
  }
  setLabelY(value: number) {
    this.#doc.submitOp([...this.#path, "label", "y", { r: 0, i: value }]);
  }
  setLabelXOffset(value: number) {
    this.#doc.submitOp([...this.#path, "label", "rx", { r: 0, i: value }]);
  }
  setLabelYOffset(value: number) {
    this.#doc.submitOp([...this.#path, "label", "ry", { r: 0, i: value }]);
  }
  setLabelLine(value: string) {
    this.#doc.submitOp([...this.#path, "label", "line", { r: 0, i: value }]);
  }
  setMissingStyle(value: string) {
    this.#doc.submitOp([...this.#path, "missingStyle", { r: 0, i: value }]);
  }
  delete() {
    this.#doc.submitOp([...this.#path, { r: 0 }]);
  }
  moveUp() {
    if (typeof this.#index == "undefined") {
      throw new Error("Can't move default style");
    }
    this.#doc.submitOp([
      ...this.#path.slice(0, -1),
      [this.#index - 1, { d: 0 }],
      [this.#index, { p: 0 }],
    ]);
  }
  moveDown() {
    if (typeof this.#index == "undefined") {
      throw new Error("Can't move default style");
    }
    this.#doc.submitOp([
      ...this.#path.slice(0, -1),
      [this.#index, { p: 0 }],
      [this.#index + 1, { d: 0 }],
    ]);
  }
}
