// SPDX-License-Identifier: MPL-2.0

// Minimal types for the `rich-text` (ottypes / Quill Delta) package, which ships
// without its own declarations. We embed `type` as an ot-json1 subtype and use the
// `Delta` class for all delta math (diff/compose/transformPosition).
declare module "rich-text" {
  /** A single op in a Delta. Documents contain only `insert` ops; changes may also retain/delete. */
  export interface DeltaOp {
    insert?: string | Record<string, unknown>;
    delete?: number;
    retain?: number;
    attributes?: Record<string, unknown>;
  }

  export class Delta {
    ops: DeltaOp[];
    constructor(ops?: DeltaOp[] | Delta | { ops: DeltaOp[] });
    insert(text: string | Record<string, unknown>, attributes?: Record<string, unknown>): Delta;
    delete(length: number): Delta;
    retain(length: number, attributes?: Record<string, unknown>): Delta;
    push(op: DeltaOp): Delta;
    compose(other: Delta): Delta;
    concat(other: Delta): Delta;
    diff(other: Delta, cursor?: number): Delta;
    transform(other: Delta, priority?: boolean): Delta;
    transformPosition(index: number, priority?: boolean): number;
    slice(start?: number, end?: number): Delta;
    length(): number;
    eachLine(
      predicate: (
        line: Delta,
        attributes: Record<string, unknown>,
        index: number,
      ) => boolean | void,
      newline?: string,
    ): void;
  }

  /** The OT type, registered as an ot-json1 subtype (name "rich-text"). */
  export const type: {
    name: string;
    uri: string;
    apply(doc: unknown, op: unknown): unknown;
    compose(op1: unknown, op2: unknown): unknown;
    transform(op1: unknown, op2: unknown, by: "left" | "right"): unknown;
    [k: string]: unknown;
  };
}
