// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";
import bold from "./bold";
import italic from "./italic";
import underline from "./underline";
import strike from "./strike";
import textColor from "./textColor";
import highlight from "./highlight";
import link from "./link";

/**
 * The registered inline marks. Array order is the wrap/nesting order (first = outermost) and the
 * toolbar order. To add a mark: write one file next to these and add it here.
 *
 * `link` is last so the `<a>` is the innermost wrapper (closest to the text), letting its own
 * styling read as a link regardless of any color marks wrapped around it.
 */
export const inlineMarks: InlineMark[] = [
  bold,
  italic,
  underline,
  strike,
  textColor,
  highlight,
  link,
];

export type { InlineMark };
