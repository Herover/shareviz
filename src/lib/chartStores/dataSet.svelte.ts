import ShareDB from "sharedb/lib/client";
import type { ShareDBConnection } from "./chart.svelte";
import type { Data, Set } from "$lib/chart";

export class DataSetsStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #data?: Data = $derived(this.#connection?.data?.data);

  constructor(connection: ShareDBConnection) {
    this.#doc = connection.doc;
    this.#connection = connection;
  }

  addDataSet(index: number) {
    this.#doc.submitOp([
      "data",
      "sets",
      index,
      {
        i: {
          id: crypto.randomUUID(),
          type: "tsv",
          name: `Data set ${index + 1}`,
          raw: "",
          rows: [],
          transpose: [],
        },
      },
    ]);
  }

  get data(): Data | undefined {
    return this.#data;
  }
}

export class DataSetStore {
  #doc: ShareDB.Doc = $state(new ShareDB.Doc());
  #connection?: ShareDBConnection;
  #index?: number;
  #data?: Set = $derived(
    typeof this.#index == "number"
      ? this.#connection?.data?.data.sets[this.#index || 0]
      : undefined,
  );

  constructor(connection: ShareDBConnection, index: number) {
    this.#doc = connection.doc;
    this.#connection = connection;
    this.#index = index;
  }

  setRaw(value: string) {
    this.#doc.submitOp(["data", "sets", this.#index, "raw", { r: 0, i: value }]);
  }
  setType(value: string) {
    this.#doc.submitOp(["data", "sets", this.#index, "type", { r: 0, i: value }]);
  }
  setName(value: string) {
    this.#doc.submitOp(["data", "sets", this.#index, "name", { r: 0, i: value }]);
  }

  setColumnType(colIndex: number, value: string) {
    this.#doc.submitOp(["data", "sets", this.#index, "rows", colIndex, "type", { r: 0, i: value }]);
  }
  setColumnDateFormat(colIndex: number, value: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "rows",
      colIndex,
      "dateFormat",
      { r: 0, i: value },
    ]);
  }
  addColumn(colIndex: number, key: string, type: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "rows",
      colIndex,
      { i: { key, type, dateFormat: "" } },
    ]);
  }
  removeColumn(colIndex: number) {
    this.#doc.submitOp(["data", "sets", this.#index, "rows", colIndex, { r: true }]);
  }
  setColumns(value: { key: string; type: string; dateFormat: string }[]) {
    this.#doc.submitOp(["data", "sets", this.#index, "rows", { r: 0, i: value }]);
  }

  addTranspose(transposeIndex: number) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      {
        i: {
          from: [],
          toKey: "",
          toValue: "",
          valueType: "text",
          keyType: "text",
        },
      },
    ]);
  }
  removeTranspose(transposeIndex: number) {
    this.#doc.submitOp(["data", "sets", this.#index, "transpose", transposeIndex, { r: true }]);
  }
  setTransposeToKey(transposeIndex: number, value: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "toKey",
      { r: 0, i: value },
    ]);
  }
  setTransposeToValue(transposeIndex: number, value: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "toValue",
      { r: 0, i: value },
    ]);
  }
  setTransposeValueType(transposeIndex: number, value: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "valueType",
      { r: 0, i: value },
    ]);
  }
  setTransposeKeyType(transposeIndex: number, value: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "keyType",
      { r: 0, i: value },
    ]);
  }
  addTransposeFrom(transposeIndex: number, fromIndex: number) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "from",
      fromIndex,
      { i: "" },
    ]);
  }
  removeTransposeFrom(transposeIndex: number, fromIndex: number) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "from",
      fromIndex,
      { r: true },
    ]);
  }
  setTransposeFrom(transposeIndex: number, fromIndex: number, value: string) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "from",
      fromIndex,
      { r: 0, i: value },
    ]);
  }
  setTransposeFromArray(transposeIndex: number, value: string[]) {
    this.#doc.submitOp([
      "data",
      "sets",
      this.#index,
      "transpose",
      transposeIndex,
      "from",
      { r: 0, i: value },
    ]);
  }

  get data(): Set | undefined {
    return this.#data;
  }
}
