// SPDX-License-Identifier: MPL-2.0

import type { InlineMark } from "./types";
import bold from "./bold";
import italic from "./italic";
import underline from "./underline";
import strike from "./strike";
import textColor from "./textColor";
import highlight from "./highlight";

/**
 * The registered inline marks. Array order is the wrap/nesting order (first = outermost) and the
 * toolbar order. To add a mark: write one file next to these and add it here.
 */
export const inlineMarks: InlineMark[] = [bold, italic, underline, strike, textColor, highlight];

export type { InlineMark };
