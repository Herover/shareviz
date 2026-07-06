// SPDX-License-Identifier: MPL-2.0

// DOM <-> Quill-Delta helpers for the hand-rolled collaborative rich-text editor.
//
// Model: the contenteditable holds one block element per line — `<h1>`/`<h2>`/`<p>` (the
// `BlockType`), with `<div>` from the browser treated as the field default. Inline formatting is
// driven by the mark registry (`./marks/inline`): toggle marks (`<strong>`/`<em>`/`<u>`/`<s>`) and
// color marks (styled `<span>`s). The document Delta is the inline text with each line terminated
// by a "\n" that carries the line's block type as an attribute (Quill convention), so the
// document always ends with a newline. The serialize/render pair is a round-trip identity for
// the deltas we produce, and the caret index counting used by `readEditor` matches the
// placement done by `placeCaret`, so the caret survives a remote re-render after being
// transformed through the incoming change.

import { Delta } from "rich-text";
import chroma from "chroma-js";
import { inlineMarks } from "./marks/inline";

/**
 * A mark's value on a segment: `true` for toggle marks (bold/…), a CSS color string for color
 * marks (text color / highlight). Mirrors the Delta attribute value.
 */
export type MarkValue = true | string;

/**
 * Normalize a CSS color to a safe hex string, or `null` if it is invalid or fully transparent.
 * Sanitizes stored values before they reach the DOM (no CSS injection) and defines whether a
 * color mark is considered present.
 */
export const safeColor = (value: string): string | null => {
  try {
    const color = chroma(value);
    return color.alpha() > 0 ? color.hex() : null;
  } catch {
    return null;
  }
};

const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

/**
 * Validate a URL for use as a link destination, or `null` if it is blank/invalid or uses an
 * unsafe scheme (e.g. `javascript:`). A scheme-less value is assumed to be `https`. The original
 * string is returned unchanged when valid (no trailing-slash or other normalization).
 */
export const safeUrl = (value: string): string | null => {
  try {
    if (!SAFE_URL_SCHEMES.some((safe) => value.startsWith(safe))) {
      value = "https://" + value;
    }
    // `new URL` is only used to validate the scheme/shape; we return `value` so the destination
    // keeps the exact form the user typed.
    return SAFE_URL_SCHEMES.some((safe) => new URL(value).protocol === safe) ? value : null;
  } catch {
    return null;
  }
};

/**
 * Block-level type of a line, stored on the line's terminating newline (Quill convention).
 * `ul`/`ol` lines are list items; consecutive same-value list lines render as one list.
 */
export type BlockType = "h1" | "h2" | "p" | "ul" | "ol";

const BLOCK_TYPES: BlockType[] = ["h1", "h2", "p", "ul", "ol"];
const isBlockType = (value: unknown): value is BlockType =>
  BLOCK_TYPES.includes(value as BlockType);

const isList = (block: BlockType): block is "ul" | "ol" => block === "ul" || block === "ol";

/** Map a block element to its `BlockType`, falling back to the field default for div/unknown. */
const tagToBlock = (el: Element, fallback: BlockType): BlockType => {
  switch (el.tagName) {
    case "H1":
      return "h1";
    case "H2":
      return "h2";
    case "P":
      return "p";
    case "LI":
      // A list item's kind comes from its parent <ul>/<ol>.
      return el.parentElement?.tagName === "OL" ? "ol" : "ul";
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

/**
 * Add to `marks` every inline mark implied by `el` — by tag (`<strong>`, `<em>`, …) or by inline
 * style (execCommand styleWithCSS output, pasted content). Registry-driven, so it covers any
 * registered mark. Shared by `readEditor` (descending the tree) and the editor toolbar
 * (ascending from the caret), keeping detection identical in both directions.
 */
export const extendMarks = (
  marks: Record<string, MarkValue>,
  el: HTMLElement,
): Record<string, MarkValue> => {
  const next = { ...marks };
  for (const mark of inlineMarks) {
    if (mark.link) {
      if (el.tagName === "A") {
        const url = safeUrl(el.getAttribute("href") ?? "");
        if (url) {
          next[mark.attr] = url;
        }
      }
    } else if (mark.color) {
      const value = safeColor(el.style.getPropertyValue(mark.color.css));
      if (value) {
        next[mark.attr] = value;
      }
    } else {
      const tags = mark.matchTags ?? (mark.tag ? [mark.tag.toUpperCase()] : []);
      if (tags.includes(el.tagName) || mark.matchStyle?.(el.style)) {
        next[mark.attr] = true;
      }
    }
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

  const insertText = (text: string, marks: Record<string, MarkValue>) => {
    if (!text) {
      return;
    }
    // `marks` already holds the per-mark value (true for toggles, a color string for color marks),
    // i.e. exactly the Delta attributes for this run.
    delta.insert(text, Object.keys(marks).length ? { ...marks } : undefined);
    length += text.length;
  };
  const insertNewline = (block?: BlockType) => {
    delta.insert("\n", block ? { block } : undefined);
    length += 1;
  };

  // True if a block merely *wraps* a list — e.g. the `<p><ul>…</ul></p>` some browsers leave
  // behind after a list command. Such a block stays transparent so its <li>s are the lines.
  const wrapsList = (el: Element) => el.querySelector("ul, ol, li") !== null;

  // `inLine` tracks whether we're already inside the current line's block, so nested blocks
  // (e.g. an <h1> the browser leaves inside an <li>) flatten into it instead of starting a line.
  const visit = (node: Node, marks: Record<string, MarkValue>, inLine: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue ?? "";
      if (caret == null && node === stopNode) {
        caret = length + Math.min(stopOffset, text.length);
      }
      insertText(text, marks);
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
    // What counts as a line: an <li> always is (regardless of nesting); a non-list block is one
    // when it's a leaf (not wrapping a list) and not already inside a line. <ul>/<ol>, inline
    // tags, list-wrapping blocks and nested blocks are all transparent (recursed through).
    const startsLine = el.tagName === "LI" || (isBlock(el) && !inLine && !wrapsList(el));
    const childMarks = extendMarks(marks, el);
    const children = Array.from(el.childNodes);
    children.forEach((child, i) => {
      if (caret == null && node === stopNode && i === stopOffset) {
        caret = length;
      }
      visit(child, childMarks, inLine || startsLine);
    });
    if (caret == null && node === stopNode && stopOffset >= children.length) {
      caret = length;
    }
    // Each line emits exactly one terminating newline carrying its block type, including the
    // last line — so the document always ends with a newline (the anchor for block attrs).
    if (startsLine) {
      insertNewline(tagToBlock(el, defaultBlock));
    }
  };

  const topChildren = Array.from(root.childNodes);
  topChildren.forEach((child, i) => {
    if (caret == null && root === stopNode && i === stopOffset) {
      caret = length;
    }
    visit(child, {}, false);
  });
  if (caret == null && root === stopNode && stopOffset >= topChildren.length) {
    caret = length;
  }

  if (caret != null) {
    caret = Math.min(caret, delta.length());
  }
  return { delta, caret };
};

/** One run of text sharing the same inline formatting: mark `attr` → value (true or a color). */
export interface Segment {
  text: string;
  marks: Record<string, MarkValue>;
}

/** A line: its block type plus the inline runs it contains. */
export interface Line {
  block: BlockType;
  segments: Segment[];
}

/**
 * A render group: either a standalone line (h1/h2/p) or a run of consecutive same-kind list
 * lines that collapse into a single `<ul>`/`<ol>`. Shared by both renderers so they stay in sync.
 */
export type Group = { list: null; line: Line } | { list: "ul" | "ol"; items: Line[] };

/** Collapse consecutive same-value `ul`/`ol` lines into list groups; others stay standalone. */
export const groupLines = (lines: Line[]): Group[] => {
  const groups: Group[] = [];
  for (const line of lines) {
    const last = groups[groups.length - 1];
    if (isList(line.block) && last && last.list === line.block) {
      last.items.push(line);
    } else if (isList(line.block)) {
      groups.push({ list: line.block, items: [line] });
    } else {
      groups.push({ list: null, line });
    }
  }
  return groups;
};

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
    const marks: Record<string, MarkValue> = {};
    for (const mark of inlineMarks) {
      const value = attrs[mark.attr];
      if (mark.link) {
        const url = typeof value === "string" ? safeUrl(value) : null;
        if (url) {
          marks[mark.attr] = url;
        }
      } else if (mark.color) {
        const color = typeof value === "string" ? safeColor(value) : null;
        if (color) {
          marks[mark.attr] = color;
        }
      } else if (value === true) {
        marks[mark.attr] = true;
      }
    }
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
        lines[lines.length - 1].segments.push({ text: part, marks });
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

/**
 * A render wrapper for one active mark: a semantic tag, a styled `<span>` for color marks, or an
 * `<a href>` for the link mark.
 */
export interface Wrap {
  tag: string;
  bg?: string;
  fg?: string;
  href?: string;
}

/**
 * Ordered wrappers for a segment's marks, registry order = outermost first. Shared by the editor
 * (`makeInline`) and the viewer (`DeltaView`) so nesting + color sanitization match exactly.
 */
export const inlineWraps = (marks: Record<string, MarkValue>): Wrap[] => {
  const wraps: Wrap[] = [];
  for (const mark of inlineMarks) {
    const value = marks[mark.attr];
    if (value === undefined) {
      continue;
    }
    if (mark.link) {
      const url = typeof value === "string" ? safeUrl(value) : null;
      if (url) {
        wraps.push({ tag: "a", href: url });
      }
    } else if (mark.color) {
      const color = typeof value === "string" ? safeColor(value) : null;
      if (color) {
        wraps.push(
          mark.color.css === "background-color"
            ? { tag: "span", bg: color }
            : { tag: "span", fg: color },
        );
      }
    } else if (mark.tag) {
      wraps.push({ tag: mark.tag });
    }
  }
  return wraps;
};

const makeInline = (segment: Segment): Node => {
  let node: Node = document.createTextNode(segment.text);
  const wraps = inlineWraps(segment.marks);
  // Wrap inner→outer so wraps[0] (first registered mark) ends up outermost.
  for (let i = wraps.length - 1; i >= 0; i--) {
    const w = wraps[i];
    const el = document.createElement(w.tag);
    if (w.bg) {
      el.style.setProperty("background-color", w.bg);
    }
    if (w.fg) {
      el.style.setProperty("color", w.fg);
    }
    if (w.href) {
      el.setAttribute("href", w.href);
    }
    el.appendChild(node);
    node = el;
  }
  return node;
};

/** Fill a line element with its inline runs (or an empty-line `<br>` placeholder). */
const appendInline = (el: HTMLElement, line: Line): void => {
  if (line.segments.length === 0) {
    el.appendChild(document.createElement("br"));
  } else {
    for (const segment of line.segments) {
      el.appendChild(makeInline(segment));
    }
  }
};

/**
 * Render a document Delta into the contenteditable: one block element per line, with runs of
 * list lines collapsed into a single `<ul>`/`<ol>` of `<li>` items.
 */
export const renderDelta = (
  root: HTMLElement,
  delta: Delta,
  defaultBlock: BlockType = "p",
): void => {
  root.replaceChildren();
  for (const group of groupLines(deltaToLines(delta, defaultBlock))) {
    if (group.list) {
      const list = document.createElement(group.list);
      for (const line of group.items) {
        const li = document.createElement("li");
        appendInline(li, line);
        list.appendChild(li);
      }
      root.appendChild(list);
    } else {
      const el = document.createElement(group.line.block);
      appendInline(el, group.line);
      root.appendChild(el);
    }
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
      const attributes = { ...segment.marks };
      out.insert(segment.text, Object.keys(attributes).length ? attributes : undefined);
    }
    out.insert("\n", { block: line.block });
  }
  return out;
};

/**
 * If the selection's caret sits inside an `<a>` within `root`, replace the selection with one
 * spanning that whole anchor and return true; otherwise leave the selection unchanged and return
 * false. Lets a collapsed caret edit or remove its enclosing link, since `createLink`/`unlink`
 * act on the selected range, not a bare caret.
 */
export const selectEnclosingAnchor = (selection: Selection, root: HTMLElement): boolean => {
  let node: Node | null = selection.anchorNode;
  while (node && node !== root) {
    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "A") {
      const range = document.createRange();
      range.selectNode(node);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

/**
 * Resolve a document character index to a DOM position within `root`, mirroring `readEditor`'s
 * counting. An index past the end resolves to the end of the last block. Shared by `placeCaret`
 * (the local caret) and `caretPosition` (remote presence carets).
 */
const resolveIndex = (root: HTMLElement, index: number): { node: Node; offset: number } => {
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

  // Each line is one block; <ul>/<ol> are containers, so flatten them to their <li> lines.
  const blocks = Array.from(root.children).flatMap((child) =>
    child.tagName === "UL" || child.tagName === "OL" ? Array.from(child.children) : [child],
  );
  if (blocks.length === 0) {
    return { node: root, offset: 0 };
  }

  for (let b = 0; b < blocks.length; b++) {
    if (b > 0) {
      // the "\n" separating this block from the previous one
      if (remaining === 0) {
        const placed = placeWithinBlock(blocks[b]);
        return placed ?? { node: blocks[b], offset: 0 };
      }
      remaining -= 1;
    }
    const placed = placeWithinBlock(blocks[b]);
    if (placed) {
      return placed;
    }
  }

  // Index past the end: place at the end of the last block.
  const lastBlock = blocks[blocks.length - 1];
  return { node: lastBlock, offset: lastBlock.childNodes.length };
};

/** Place the caret at a document character index, mirroring `readEditor`'s counting. */
export const placeCaret = (root: HTMLElement, index: number): void => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  const { node, offset } = resolveIndex(root, index);
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

/** Viewport-relative box of a caret at a document character index (for presence carets). */
export interface CaretPosition {
  left: number;
  top: number;
  height: number;
}

/**
 * Measure where a caret at a document character index would sit, in viewport coordinates
 * (subtract the overlay's own rect to position an element). Returns null if the position
 * can't be measured (e.g. detached root).
 */
export const caretPosition = (root: HTMLElement, index: number): CaretPosition | null => {
  const { node, offset } = resolveIndex(root, index);
  const range = document.createRange();
  try {
    range.setStart(node, offset);
  } catch {
    return null;
  }
  range.collapse(true);
  const rect = range.getBoundingClientRect();
  if (rect.height > 0) {
    return { left: rect.left, top: rect.top, height: rect.height };
  }
  // A collapsed range anchored on an element (empty line: block containing only <br>)
  // reports a zero rect; fall back to the enclosing element's own box.
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
  if (!el) {
    return null;
  }
  const elRect = el.getBoundingClientRect();
  return elRect.height > 0 ? { left: elRect.left, top: elRect.top, height: elRect.height } : null;
};
