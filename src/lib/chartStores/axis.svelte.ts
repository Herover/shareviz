import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./data.svelte";
import { type Axis, type AxisGrid } from "$lib/chart";

export class AxisStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #style: Axis;
  #path: (string | number)[];

  constructor(connection: ShareDBConnection, style: Axis, path: any[]) {
    this.#doc = connection.doc;
    this.#connection = connection;
    this.#style = style;
    this.#path = path;
  }

  get data(): Axis {
    return this.#style;
  }

  setLocation(value: string) {
    this.#doc.submitOp([...this.#path, "location", { r: 0, i: value }]);
  }
  setOrientation(value: string) {
    this.#doc.submitOp([...this.#path, "orientation", { r: 0, i: value }]);
  }
  setRepeat(value: string) {
    this.#doc.submitOp([...this.#path, "repeat", { r: 0, i: value }]);
  }
  setLabelSpace(value: number) {
    this.#doc.submitOp([...this.#path, "labelSpace", { r: 0, i: value }]);
  }
  major() {
    return new AxisGridStore(this.#connection as ShareDBConnection, this.data.major, [
      ...this.#path,
      "major",
    ]);
  }
  minor() {
    return new AxisGridStore(this.#connection as ShareDBConnection, this.data.minor, [
      ...this.#path,
      "minor",
    ]);
  }
}

export class AxisGridStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  // #connection?: ShareDBConnection;
  #d: AxisGrid;
  #path: (string | number)[];

  constructor(connection: ShareDBConnection, d: AxisGrid, path: any[]) {
    this.#doc = connection.doc;
    // this.#connection = connection;
    this.#d = d;
    this.#path = path;
  }

  get data(): AxisGrid {
    return this.#d;
  }

  setGrid(value: boolean) {
    this.#doc.submitOp([...this.#path, "grid", { r: 0, i: value }]);
  }
  setEnabled(value: boolean) {
    this.#doc.submitOp([...this.#path, "enabled", { r: 0, i: value }]);
  }
  setTickSize(value: number) {
    this.#doc.submitOp([...this.#path, "tickSize", { r: 0, i: value }]);
  }
  setTickWidth(value: number) {
    this.#doc.submitOp([...this.#path, "tickWidth", { r: 0, i: value }]);
  }
  setColor(value: string) {
    this.#doc.submitOp([...this.#path, "color", { r: 0, i: value }]);
  }
  setLabelDivide(value: number) {
    this.#doc.submitOp([...this.#path, "labelDivide", { r: 0, i: value }]);
  }
  setLabelThousands(value: string) {
    this.#doc.submitOp([...this.#path, "labelThousands", { r: 0, i: value }]);
  }
  setAutoFrom(value: string) {
    this.#doc.submitOp([...this.#path, "auto", "from", { r: 0, i: value }]);
  }
  setAutoEach(value: number) {
    this.#doc.submitOp([...this.#path, "auto", "each", { r: 0, i: value }]);
  }
  setAutoLabels(value: boolean) {
    this.#doc.submitOp([...this.#path, "auto", "labels", { r: 0, i: value }]);
  }
  setAfterLabel(value: string) {
    this.#doc.submitOp([...this.#path, "afterLabel", { r: 0, i: value }]);
  }
  addTick(index: number) {
    this.#doc.submitOp([...this.#path, "ticks", index, { i: { n: 0, l: "" } }]);
  }
  removeTick(index: number) {
    this.#doc.submitOp([...this.#path, "ticks", index, { r: 0 }]);
  }
  setTickValue(tickIndex: number, value: number) {
    this.#doc.submitOp([...this.#path, "ticks", tickIndex, "n", { r: 0, i: value }]);
  }
  setTickLabel(tickIndex: number, value: string) {
    this.#doc.submitOp([...this.#path, "ticks", tickIndex, "l", { r: 0, i: value }]);
  }
}
