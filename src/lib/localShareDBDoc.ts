import { type Doc } from "sharedb";
import * as json1 from "ot-json1";
import { getLogger } from "$lib/log.js";

const logger = getLogger();

export const createLocalDoc = (
  collection: string,
  id: string,
  opts: { initial?: any; noStorage?: boolean } = {},
): Doc => {
  let onOp: (error?: Error) => any = () => {};
  const doc = {
    data: opts.initial,
  } as {
    data: any;
    create: (data: any, type: any, cb: (error: Error | undefined) => any) => any;
    submitOp: (op: any) => any;
    on: (ev: string, listener: (a: any) => any) => any;
    subscribe: (listener: (d: any) => any) => any;
    kind: "local" | "synced";
  };
  doc.create = (data: any, type: any, cb: (error?: Error) => any) => {
    doc.data = json1.type.create(data);
    if (!opts.noStorage) {
      localStorage.setItem(collection + "-" + id, JSON.stringify(doc.data));
    }
    if (typeof cb == "function") {
      cb();
    }
  };
  doc.submitOp = (op: any) => {
    try {
      doc.data = json1.type.apply(doc.data, op);
      if (!opts.noStorage) {
        localStorage.setItem(collection + "-" + id, JSON.stringify(doc.data));
      }
      onOp();
    } catch (error) {
      onOp(error as Error);
      logger.error("unable to submit op on local doc", { op }, error);
    }
  };
  doc.on = (ev: string, listener: (a?: any) => any) => {
    switch (ev) {
      case "op":
        onOp = listener;
        break;

      default:
        break;
    }
  };
  doc.subscribe = (listener: (e?: Error) => any) => listener();
  doc.kind = "local";

  return doc as any as Doc;
};
