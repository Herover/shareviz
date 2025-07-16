// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import type { Style } from "$lib/chart";

export class StyleStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #data?: Style = $derived(this.#connection?.data?.style);

  constructor(connection: ShareDBConnection) {
    this.#doc = connection.doc;
    this.#connection = connection;
  }

  get data(): Style | undefined {
    return this.#data;
  }

  setTitleBold(value: boolean) {
    this.#doc.submitOp(["style", "titleBold", { r: 0, i: value }]);
  }
  setSubTitleBold(value: boolean) {
    this.#doc.submitOp(["style", "subTitleBold", { r: 0, i: value }]);
  }
  setTitleSize(value: number) {
    this.#doc.submitOp(["style", "titleSize", { r: 0, i: value }]);
  }
  setSubTitleSize(value: number) {
    this.#doc.submitOp(["style", "subTitleSize", { r: 0, i: value }]);
  }
  setMarginLeft(value: number) {
    this.#doc.submitOp(["style", "marginLeft", { r: 0, i: value }]);
  }
  setMarginRight(value: number) {
    this.#doc.submitOp(["style", "marginRight", { r: 0, i: value }]);
  }
  setMarginTop(value: number) {
    this.#doc.submitOp(["style", "marginTop", { r: 0, i: value }]);
  }
  setMarginBottom(value: number) {
    this.#doc.submitOp(["style", "marginBottom", { r: 0, i: value }]);
  }
  setBGColor(value: string) {
    this.#doc.submitOp(["style", "bgColor", { r: 0, i: value }]);
  }
  setTextColor(value: string) {
    this.#doc.submitOp(["style", "textColor", { r: 0, i: value }]);
  }
}
