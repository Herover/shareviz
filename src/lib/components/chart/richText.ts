// SPDX-License-Identifier: MPL-2.0

// DOM <-> Quill-Delta helpers for the hand-rolled collaborative rich-text editor.
//
// Model: the contenteditable holds one block element per line — `<h1>`/`<h2>`/`<p>` (the
// `BlockType`), with `<div>` from the browser treated as the field default. Inline formatting
// is `<strong>`/`<em>`/`<u>`. The document Delta is the inline text with each line terminated
// by a "\n" that carries the line's block type as an attribute (Quill convention), so the
// document always ends with a newline. The serialize/render pair is a round-trip identity for
// the deltas we produce, and the caret index counting used by `readEditor` matches the
// placement done by `placeCaret`, so the caret survives a remote re-render after being
// transformed through the incoming change.

import { Delta } from "rich-text";

export type Attrs = { bold?: true; italic?: true; underline?: true };

/** Block-level type of a line. Stored on the line's terminating newline (Quill convention). */
export type BlockType = "h1" | "h2" | "p";

const isBlockType = (value: unknown): value is BlockType =>
  value === "h1" || value === "h2" || value === "p";

/** Map a block element to its `BlockType`, falling back to the field default for div/unknown. */
const tagToBlock = (el: Element, fallback: BlockType): BlockType => {
  switch (el.tagName) {
    case "H1":
      return "h1";
    case "H2":
      return "h2";
    case "P":
      return "p";
    default:
      return fallback; // DIV (browser default block) / anything else → field default
  }
};

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

const isBlock = (el: Element): boolean => ["DIV", "P", "H1", "H2", "H3", "LI"].includes(el.tagName);

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

export interface EditorRead {
  delta: Delta;
  /** Document character index of the selection's start, or null if no/outside selection. */
  caret: number | null;
}

/**
 * Serialize the contenteditable into a document Delta. If `selection` is supplied and its
 * start lies within `root`, also returns the caret as a document character index.
 */
export const readEditor = (
  root: HTMLElement,
  selection?: Selection | null,
  defaultBlock: BlockType = "p",
): EditorRead => {
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
  const insertNewline = (block?: BlockType) => {
    delta.insert("\n", block ? { block } : undefined);
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
      // A trailing <br> is the browser's empty-block filler — the enclosing block emits the
      // line's own (block-attributed) newline. A <br> with a following sibling is a real break.
      if (el.nextSibling) {
        insertNewline();
      }
      return;
    }
    const block = isBlock(el);
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
    // Each block emits exactly one terminating newline carrying its block type, including the
    // last block — so the document always ends with a newline (the anchor for block attrs).
    if (block) {
      insertNewline(tagToBlock(el, defaultBlock));
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

  if (caret != null) {
    caret = Math.min(caret, delta.length());
  }
  return { delta, caret };
};

/** One run of text sharing the same inline formatting. */
export interface Segment {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

/** A line: its block type plus the inline runs it contains. */
export interface Line {
  block: BlockType;
  segments: Segment[];
}

/**
 * Split a document Delta into lines (split on "\n"), each carrying its block type and its
 * formatted inline segments. The block type is read from the line's terminating-newline
 * `block` attribute (Quill convention), falling back to `defaultBlock`. Shared by the
 * contenteditable renderer here and the read-only `DeltaView` component, so both interpret
 * the Delta the same way.
 */
export const deltaToLines = (delta: Delta, defaultBlock: BlockType = "p"): Line[] => {
  const lines: Line[] = [{ block: defaultBlock, segments: [] }];
  for (const op of delta.ops) {
    if (typeof op.insert !== "string") {
      continue; // embeds unsupported in v1
    }
    const attrs = op.attributes ?? {};
    const inline = {
      bold: attrs.bold === true,
      italic: attrs.italic === true,
      underline: attrs.underline === true,
    };
    const parts = op.insert.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) {
        // Crossing a newline closes the current line; its block type lives on this op.
        const current = lines[lines.length - 1];
        if (isBlockType(attrs.block)) {
          current.block = attrs.block;
        }
        lines.push({ block: defaultBlock, segments: [] });
      }
      if (part) {
        lines[lines.length - 1].segments.push({ text: part, ...inline });
      }
    });
  }
  // The forced trailing newline leaves one dangling empty line; drop it (but keep a lone
  // empty line so an empty document still renders one block).
  if (lines.length > 1 && lines[lines.length - 1].segments.length === 0) {
    lines.pop();
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

/** Render a document Delta into the contenteditable as one block element per line. */
export const renderDelta = (
  root: HTMLElement,
  delta: Delta,
  defaultBlock: BlockType = "p",
): void => {
  const lines = deltaToLines(delta, defaultBlock);

  root.replaceChildren();
  for (const line of lines) {
    const el = document.createElement(line.block);
    if (line.segments.length === 0) {
      el.appendChild(document.createElement("br"));
    } else {
      for (const segment of line.segments) {
        el.appendChild(makeInline(segment));
      }
    }
    root.appendChild(el);
  }
};

/**
 * Canonicalize a stored Delta into the editor's model: every line terminated by a newline
 * that carries an explicit `block` attribute (defaulting to `defaultBlock`). Makes the
 * in-memory baseline identical to what `readEditor` produces, so loading legacy data (no
 * trailing newline / no block attrs) doesn't create a spurious first-edit diff.
 */
export const normalizeDelta = (delta: Delta, defaultBlock: BlockType = "p"): Delta => {
  const out = new Delta();
  for (const line of deltaToLines(delta, defaultBlock)) {
    for (const segment of line.segments) {
      const attrs: Attrs = {};
      if (segment.bold) {
        attrs.bold = true;
      }
      if (segment.italic) {
        attrs.italic = true;
      }
      if (segment.underline) {
        attrs.underline = true;
      }
      out.insert(segment.text, Object.keys(attrs).length ? attrs : undefined);
    }
    out.insert("\n", { block: line.block });
  }
  return out;
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
