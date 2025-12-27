// SPDX-License-Identifier: MPL-2.0

import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import {
  LabelLocation,
  LabelStyleLine,
  LineMissingStyle,
  LineSymbol,
  type Color,
  type Element,
  type Line,
  type LineRepeatSettings,
  type LineRepeatSettingsKey,
  type LineStyleKey,
} from "$lib/chart";
import { LineStyleStore } from "./lineStyle.svelte";
import { RepeatSettingsStore } from "./repeatSettings.svelte";
import { AxisStore } from "./axis.svelte";

export class LineStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #id?: string;
  #elementIndex?: number = $derived(
    this.#connection?.data?.chart.elements.findIndex((e) => e.id == this.#id),
  );
  #componentData?: Element = $derived.by(() => {
    return this.#connection?.data?.chart.elements.find((e) => e.id == this.#id);
  });
  #data: Line = $derived.by(() => {
    // To simplify life, lets assume that no one will ever try to create this class without checking index and root data
    if (typeof this.#componentData == "undefined") {
      return undefined as unknown as Line;
    }

    if (typeof this.#componentData != "undefined" && this.#componentData.type == "line") {
      return this.#componentData.d as Line;
    }

    return undefined as unknown as Line;
  });

  constructor(connection: ShareDBConnection, id: string) {
    this.#doc = connection.doc;
    this.#id = id;
    this.#connection = connection;
  }

  get d(): Element | undefined {
    return this.#componentData;
  }
  get connection(): ShareDBConnection | undefined {
    return this.#connection;
  }

  get data(): Line {
    return this.#data;
  }

  lineStyle(index: number) {
    return new LineStyleStore(
      this.#connection as ShareDBConnection,
      this.#data.style.byKey[index],
      ["chart", "elements", this.#elementIndex as number, "d", "style", "byKey", index],
      index,
    );
  }

  defaultLineStyle() {
    return new LineStyleStore(this.#connection as ShareDBConnection, this.#data.style.default, [
      "chart",
      "elements",
      this.#elementIndex as number,
      "d",
      "style",
      "default",
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
  setXKey(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "x",
      "key",
      { r: 0, i: value },
    ]);
  }
  setYKey(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "y",
      "key",
      { r: 0, i: value },
    ]);
  }
  setCategoriesKey(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "categories",
      { r: 0, i: value },
    ]);
  }
  setRepeatKey(value: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeat",
      { r: 0, i: value },
    ]);
  }
  setRepeatColumns(value: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeatColumns",
      { r: 0, i: value },
    ]);
  }
  moveRepeatUp(i: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeatSettings",
      "byKey",
      [i - 1, { d: 0 }],
      [i, { p: 0 }],
    ]);
  }
  moveRepeatDown(i: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeatSettings",
      "byKey",
      [i, { p: 0 }],
      [i + 1, { d: 0 }],
    ]);
  }
  addRepeatSetting(i: number, k: string) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeatSettings",
      "byKey",
      i,
      {
        i: {
          k,
          title: "",
          allCharts: false,
          ownChart: true,
        } as LineRepeatSettingsKey,
      },
    ]);
  }
  removeRepeatSettings(indexes: number[]) {
    this.#doc.submitOp(
      indexes.map((i) => [
        "chart",
        "elements",
        this.#elementIndex,
        "d",
        "repeatSettings",
        "byKey",
        i,
        { r: 0 },
      ]),
    );
  }
  // TODO: remove after figuring out a better upgrade strategy
  updateRepeatSettings(keys: string[], r: 0 | undefined) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "repeatSettings",
      {
        i: {
          default: {
            k: "",
            title: "",
          },
          byKey: keys.map((k) => ({
            k,
            title: "",
          })),
        } as LineRepeatSettings,
        r,
      },
    ]);
  }
  setFill(value: boolean) {
    this.#doc.submitOp(["chart", "elements", this.#elementIndex, "d", "fill", { r: 0, i: value }]);
  }
  setStack(value: boolean) {
    this.#doc.submitOp(["chart", "elements", this.#elementIndex, "d", "stack", { r: 0, i: value }]);
  }
  setHeightRatio(value: number) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "heightRatio",
      { r: 0, i: value },
    ]);
  }
  addLineStyle(
    i: number,
    d: {
      key?: string;
      color?: Color;
      labelColor?: Color;
      labelText?: string;
    } = {},
  ) {
    this.#doc.submitOp([
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "style",
      "byKey",
      i,
      {
        i: {
          k: d.key ?? "",
          color: { light: d.color ?? { c: "#000000", d: "#000000" } },
          contextColor: { light: d.color ?? { c: "#000000", d: "#000000" } },
          width: 1,
          label: {
            text: d.labelText ?? "",
            location: LabelLocation.Right,
            color: { light: d.labelColor ?? { c: "#000000", d: "#000000" } },
            x: 0,
            y: 0,
            rx: 0,
            ry: -32,
            line: LabelStyleLine.Line,
          },
          missingStyle: LineMissingStyle.DASHED,
          symbols: LineSymbol.NONE,
        } as LineStyleKey,
      },
    ]);
  }
  repeatSetting(i: number) {
    return new RepeatSettingsStore(
      this.#connection as ShareDBConnection,
      this.data.repeatSettings.byKey[i],
      ["chart", "elements", this.#elementIndex, "d", "repeatSettings", "byKey", i],
    );
  }
  xAxis() {
    return new AxisStore(this.#connection as ShareDBConnection, this.data.x.axis, [
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "x",
      "axis",
    ]);
  }
  yAxis() {
    return new AxisStore(this.#connection as ShareDBConnection, this.data.y.axis, [
      "chart",
      "elements",
      this.#elementIndex,
      "d",
      "y",
      "axis",
    ]);
  }
}
