import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import { type Colors, type HBar } from "$lib/chart";
import { AxisStore } from "./axis.svelte";

export class HBarStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #id?: string;
  #elementIndex?: number = $derived(
    this.#connection?.data?.chart.elements.findIndex((e) => e.id == this.#id),
  );
  #data: HBar = $derived.by(() => {
    // To simplify life, lets assume that no one will ever try to create this class without checking index and root data
    if (typeof this.#elementIndex != "number") {
      return undefined as unknown as HBar;
    }

    const componentData = this.#connection?.data?.chart.elements[this.#elementIndex];

    if (typeof componentData != "undefined" && componentData.type == "hBar") {
      return componentData.d as HBar;
    }

    return undefined as unknown as HBar;
  });

  constructor(connection: ShareDBConnection, id: string) {
    this.#doc = connection.doc;
    this.#id = id;
    this.#connection = connection;
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
  setScaleTo(value: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "scale",
      "dataRange",
      1,
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
  colors() {
    return new HBarColors(this.#connection as ShareDBConnection, this.data.colors, [
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "colors",
    ]);
  }
}

export class HBarColors {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #colors?: Colors;
  #data: Colors = $derived(this.#colors as Colors);
  #path: any[] = [];

  constructor(connection: ShareDBConnection, colors: Colors, path: any[]) {
    this.#doc = connection.doc;
    this.#colors = colors;
    this.#path = path;
  }

  get data(): Colors {
    return this.#data;
  }

  setColorScaleKey(colorIndex: number, value: string) {
    this.#doc.submitOp([...this.#path, "byKey", colorIndex, "k", { r: 0, i: value }]);
  }
  setColorScaleColor(colorIndex: number, value: string) {
    this.#doc.submitOp([...this.#path, "byKey", colorIndex, "c", { r: 0, i: value }]);
  }
  setColorScaleLegend(colorIndex: number, value: string) {
    this.#doc.submitOp([...this.#path, "byKey", colorIndex, "legend", { r: 0, i: value }]);
  }
  addColorScaleColor(colorIndex: number, k = "", c = "", legend = "") {
    this.#doc.submitOp([...this.#path, "byKey", colorIndex, { i: { c, k, legend } }]);
  }
  removeColorScaleColor(colorIndex: number) {
    this.#doc.submitOp([...this.#path, "byKey", colorIndex, { r: 0 }]);
  }
  setColorScaleDefaultColor(value: string) {
    this.#doc.submitOp([...this.#path, "default", { r: 0, i: value }]);
  }
  moveColorUp(colorIndex: number) {
    this.#doc.submitOp([
      ...this.#path,
      "byKey",
      [colorIndex - 1, { d: 0 }],
      [colorIndex, { p: 0 }],
    ]);
  }
  moveColorDown(colorIndex: number) {
    this.#doc.submitOp([
      ...this.#path,
      "byKey",
      [colorIndex, { p: 0 }],
      [colorIndex + 1, { d: 0 }],
    ]);
  }
}
