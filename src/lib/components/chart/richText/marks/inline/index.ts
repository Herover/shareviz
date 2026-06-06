// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";
import bold from "./bold";
import italic from "./italic";
import underline from "./underline";
import strike from "./strike";

/**
 * The registered inline marks. Array order is the wrap/nesting order (first = outermost) and the
 * toolbar order. To add a mark (e.g. highlight): write one file next to these and add it here.
 */
export const inlineMarks: InlineMark[] = [bold, italic, underline, strike];

const tagByAttr = new Map(inlineMarks.map((m) => [m.attr, m.tag]));

/** The render element for a mark's `attr` (e.g. "bold" → "strong"). */
export const tagFor = (attr: string): string => tagByAttr.get(attr) ?? "span";

export type { InlineMark };
