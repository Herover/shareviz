import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import { type Element, type HBar } from "$lib/chart";
import { AxisStore } from "./axis.svelte";

export class HBarStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #elementIndex?: number;
  #componentData?: Element = $derived.by(() => {
    if (typeof this.#elementIndex != "number") {
      return undefined;
    }

    return this.#connection?.data?.chart.elements[this.#elementIndex];
  });
  #data: HBar = $derived.by(() => {
    // To simplify life, lets assume that no one will ever try to create this class without checking index and root data
    if (typeof this.#componentData == "undefined") {
      return undefined as unknown as HBar;
    }

    if (typeof this.#componentData != "undefined" && this.#componentData.type == "hBar") {
      return this.#componentData.d as HBar;
    }

    return undefined as unknown as HBar;
  });

  constructor(connection: ShareDBConnection, index: number) {
    this.#doc = connection.doc;
    this.#elementIndex = index;
    this.#connection = connection;
  }

  get d(): Element | undefined {
    return this.#componentData;
  }

  get data(): HBar {
    return this.#data;
  }

  setLabelWidth(value: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "labelWidth",
      { r: 0, i: value },
    ]);
  }
  setCategories(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "categories",
      { r: 0, i: value },
    ]);
  }
  setSubCategories(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "subCategories",
      { r: 0, i: value },
    ]);
  }
  setStackSubCategories(value: boolean) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "stackSubCategories",
      { r: 0, i: value },
    ]);
  }
  setPortionSubCategories(value: boolean) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "portionSubCategories",
      { r: 0, i: value },
    ]);
  }
  setValue(value: string) {
    this.#doc.submitOp(["chart", "elements", this.#elementIndex, "d", "value", { r: 0, i: value }]);
  }
  setRepeat(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeat",
      { r: 0, i: value },
    ]);
  }
  setDataSet(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "dataSet",
      { r: 0, i: value },
    ]);
  }
  setRectLabels(value: boolean) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "rectLabels",
      { r: 0, i: value },
    ]);
  }
  setTotalLabels(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "totalLabels",
      { r: 0, i: value },
    ]);
  }
  axis() {
    return new AxisStore(this.#connection as ShareDBConnection, this.data.axis, [
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "axis",
    ]);
  }
}
