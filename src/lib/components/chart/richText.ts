// SPDX-License-Identifier: MPL-2.0

// DOM <-> Quill-Delta helpers for the hand-rolled collaborative rich-text editor.
//
// Model: the contenteditable holds one block element (`<div>`) per line; inline
// formatting is `<strong>`/`<em>`/`<u>`. The document Delta is the inline text with
// lines joined by "\n" (no forced trailing newline). The serialize/render pair is a
// round-trip identity for the deltas we produce, and the caret index counting used by
// `readEditor` matches the placement done by `placeCaret`, so the caret survives a
// remote re-render after being transformed through the incoming change.

import { Delta } from "rich-text";
import type { DeltaOp } from "rich-text";

type Attrs = { bold?: true; italic?: true; underline?: true };

/**
 * Coerce a stored field value into a Delta. Tolerates the Delta shape, the legacy
 * plain-string shape (un-migrated synced docs), and an absent field.
 */
export const toDelta = (value: unknown): Delta => {
  if (typeof value === "string") {
    return new Delta(value ? [{ insert: value }] : []);
  }
  const ops = (value as { ops?: unknown } | null | undefined)?.ops;
  return new Delta(Array.isArray(ops) ? ops : []);
};

const isBlock = (el: Element): boolean =>
  el.tagName === "DIV" || el.tagName === "P" || el.tagName === "LI";

/** Extend the active inline attributes for an element (tag- or inline-style-based). */
const extend = (attrs: Attrs, el: HTMLElement): Attrs => {
  const next: Attrs = { ...attrs };
  const tag = el.tagName;
  const style = el.style;
  const weight = style.fontWeight;
  if (tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= 700) {
    next.bold = true;
  }
  if (tag === "I" || tag === "EM" || style.fontStyle === "italic") {
    next.italic = true;
  }
  const decoration = `${style.textDecoration} ${style.textDecorationLine}`;
  if (tag === "U" || decoration.includes("underline")) {
    next.underline = true;
  }
  return next;
};

const lastIsNewline = (delta: Delta): boolean => {
  const ops = delta.ops;
  if (ops.length === 0) {
    return true;
  }
  const last = ops[ops.length - 1].insert;
  return typeof last === "string" && last.endsWith("\n");
};

/** Remove a single trailing newline added by the block model. */
const trimTrailingNewline = (delta: Delta): Delta => {
  const ops: DeltaOp[] = delta.ops.map((op) => ({ ...op }));
  const last = ops[ops.length - 1];
  if (last && typeof last.insert === "string" && last.insert.endsWith("\n")) {
    const trimmed = last.insert.slice(0, -1);
    if (trimmed === "") {
      ops.pop();
    } else {
      last.insert = trimmed;
    }
  }
  return new Delta(ops);
};

export interface EditorRead {
  delta: Delta;
  /** Document character index of the selection's start, or null if no/outside selection. */
  caret: number | null;
}

/**
 * Serialize the contenteditable into a document Delta. If `selection` is supplied and its
 * start lies within `root`, also returns the caret as a document character index.
 */
export const readEditor = (root: HTMLElement, selection?: Selection | null): EditorRead => {
  const delta = new Delta();
  let length = 0;
  let caret: number | null = null;

  let stopNode: Node | null = null;
  let stopOffset = 0;
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    stopNode = range.startContainer;
    stopOffset = range.startOffset;
  }

  const insertText = (text: string, attrs: Attrs) => {
    if (!text) {
      return;
    }
    delta.insert(text, Object.keys(attrs).length ? attrs : undefined);
    length += text.length;
  };
  const insertNewline = () => {
    delta.insert("\n");
    length += 1;
  };

  const visit = (node: Node, attrs: Attrs) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue ?? "";
      if (caret == null && node === stopNode) {
        caret = length + Math.min(stopOffset, text.length);
      }
      insertText(text, attrs);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const el = node as HTMLElement;
    if (el.tagName === "BR") {
      if (caret == null && node === stopNode) {
        caret = length;
      }
      insertNewline();
      return;
    }
    const block = isBlock(el);
    if (block && !lastIsNewline(delta)) {
      insertNewline();
    }
    const childAttrs = extend(attrs, el);
    const children = Array.from(el.childNodes);
    children.forEach((child, i) => {
      if (caret == null && node === stopNode && i === stopOffset) {
        caret = length;
      }
      visit(child, childAttrs);
    });
    if (caret == null && node === stopNode && stopOffset >= children.length) {
      caret = length;
    }
    if (block && !lastIsNewline(delta)) {
      insertNewline();
    }
  };

  const topChildren = Array.from(root.childNodes);
  topChildren.forEach((child, i) => {
    if (caret == null && root === stopNode && i === stopOffset) {
      caret = length;
    }
    visit(child, {});
  });
  if (caret == null && root === stopNode && stopOffset >= topChildren.length) {
    caret = length;
  }

  const trimmed = trimTrailingNewline(delta);
  if (caret != null) {
    caret = Math.min(caret, trimmed.length());
  }
  return { delta: trimmed, caret };
};

/** One run of text sharing the same inline formatting. */
export interface Segment {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

/**
 * Split a document Delta into lines (split on "\n") of formatted inline segments.
 * Shared by the contenteditable renderer here and the read-only `DeltaView` component,
 * so both interpret the Delta the same way.
 */
export const deltaToLines = (delta: Delta): Segment[][] => {
  const lines: Segment[][] = [[]];
  for (const op of delta.ops) {
    if (typeof op.insert !== "string") {
      continue; // embeds unsupported in v1
    }
    const attrs = op.attributes ?? {};
    const segments = op.insert.split("\n");
    segments.forEach((segment, i) => {
      if (i > 0) {
        lines.push([]);
      }
      if (segment) {
        lines[lines.length - 1].push({
          text: segment,
          bold: attrs.bold === true,
          italic: attrs.italic === true,
          underline: attrs.underline === true,
        });
      }
    });
  }
  return lines;
};

const makeInline = (segment: Segment): Node => {
  let node: Node = document.createTextNode(segment.text);
  if (segment.underline) {
    const u = document.createElement("u");
    u.appendChild(node);
    node = u;
  }
  if (segment.italic) {
    const em = document.createElement("em");
    em.appendChild(node);
    node = em;
  }
  if (segment.bold) {
    const strong = document.createElement("strong");
    strong.appendChild(node);
    node = strong;
  }
  return node;
};

/** Render a document Delta into the contenteditable as one `<div>` block per line. */
export const renderDelta = (root: HTMLElement, delta: Delta): void => {
  const lines = deltaToLines(delta);

  root.replaceChildren();
  for (const line of lines) {
    const div = document.createElement("div");
    if (line.length === 0) {
      div.appendChild(document.createElement("br"));
    } else {
      for (const segment of line) {
        div.appendChild(makeInline(segment));
      }
    }
    root.appendChild(div);
  }
};

/** Place the caret at a document character index, mirroring `readEditor`'s counting. */
export const placeCaret = (root: HTMLElement, index: number): void => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  let remaining = Math.max(0, index);

  const placeWithinBlock = (block: Element): { node: Node; offset: number } | null => {
    const stack: Node[] = Array.from(block.childNodes).reverse();
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        break;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        const len = (node.nodeValue ?? "").length;
        if (remaining <= len) {
          return { node, offset: remaining };
        }
        remaining -= len;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === "BR") {
          continue; // empty-line placeholder, contributes no characters
        }
        const children = Array.from(el.childNodes).reverse();
        stack.push(...children);
      }
    }
    return null;
  };

  const setAt = (node: Node, offset: number) => {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const blocks = Array.from(root.children);
  if (blocks.length === 0) {
    setAt(root, 0);
    return;
  }

  for (let b = 0; b < blocks.length; b++) {
    if (b > 0) {
      // the "\n" separating this block from the previous one
      if (remaining === 0) {
        const placed = placeWithinBlock(blocks[b]);
        setAt(placed?.node ?? blocks[b], placed?.offset ?? 0);
        return;
      }
      remaining -= 1;
    }
    const placed = placeWithinBlock(blocks[b]);
    if (placed) {
      setAt(placed.node, placed.offset);
      return;
    }
  }

  // Index past the end: place at the end of the last block.
  const lastBlock = blocks[blocks.length - 1];
  setAt(lastBlock, lastBlock.childNodes.length);
};
