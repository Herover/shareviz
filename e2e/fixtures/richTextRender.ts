// SPDX-License-Identifier: MPL-2.0

// Browser-side fixture for `rich-text-render.spec.ts`, imported via the dev server inside
// `page.evaluate`. Static imports here let Vite resolve the bare `svelte`/`rich-text`
// specifiers and dedupe Svelte to a single runtime instance shared with the mounted
// component (importing `mount` separately at runtime yields a second, incompatible instance).
//
// Both renderers emit one block element per line (with list lines collapsed into <ul>/<ol>) and
// the same semantic inline tags (<strong>/<em>/<u>/<s>) from the shared mark registry. The
// `canon` walker flattens lists back to per-<li> lines and maps inline tags to mark `attr`s,
// reducing each DOM to the same `{ block, segments:{text,marks} }[]` form for equivalence checks.

import { mount, unmount } from "svelte";
import { Delta } from "rich-text";
import type { RichText } from "../../src/lib/chart";
import { type BlockType } from "../../src/lib/components/chart/richText/richText";
import { inlineMarks } from "../../src/lib/components/chart/richText/marks/inline";
import DeltaView from "../../src/lib/components/chart/richText/DeltaView.svelte";
import { readEditor, renderDelta } from "../../src/lib/components/chart/richText/richText";

interface Run {
  text: string;
  marks: string[];
}
interface Line {
  block: BlockType;
  segments: Run[];
}

// Upper-case tag name -> mark attr, from the registry.
const markByTag = new Map<string, string>();
for (const mark of inlineMarks) {
  for (const tag of mark.matchTags ?? [mark.tag.toUpperCase()]) {
    markByTag.set(tag, mark.attr);
  }
}
const orderMarks = (active: Set<string>): string[] =>
  inlineMarks.filter((m) => active.has(m.attr)).map((m) => m.attr);

/** Collect the inline runs of a single line element (text + active marks, in registry order). */
const segmentsOf = (line: Element): Run[] => {
  const segments: Run[] = [];
  const walk = (node: Node, active: Set<string>) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.nodeValue) {
          segments.push({ text: child.nodeValue, marks: orderMarks(active) });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (el.tagName === "BR") {
          continue; // empty-line placeholder, no text
        }
        const next = new Set(active);
        const attr = markByTag.get(el.tagName);
        if (attr) {
          next.add(attr);
        }
        walk(el, next);
      }
    }
  };
  walk(line, new Set());
  return segments;
};

/** Reduce a rendered DOM (either renderer) to block-typed lines, flattening <ul>/<ol>. */
const canon = (root: HTMLElement): Line[] => {
  const lines: Line[] = [];
  for (const child of Array.from(root.children)) {
    if (child.tagName === "UL" || child.tagName === "OL") {
      const block = child.tagName.toLowerCase() as BlockType;
      for (const li of Array.from(child.children)) {
        lines.push({ block, segments: segmentsOf(li) });
      }
    } else {
      lines.push({ block: child.tagName.toLowerCase() as BlockType, segments: segmentsOf(child) });
    }
  }
  return lines;
};

export interface Rendered {
  blocks: Line[];
  inline: Line[];
}

/** Render `delta` through both renderers and return their canonical block/run forms. */
export const renderBoth = (delta: RichText, defaultBlock: BlockType = "p"): Rendered => {
  const blockRoot = document.createElement("div");
  renderDelta(blockRoot, new Delta(delta.ops), defaultBlock);

  const inlineRoot = document.createElement("div");
  document.body.appendChild(inlineRoot);
  const component = mount(DeltaView, { target: inlineRoot, props: { delta, defaultBlock } });

  const result: Rendered = { blocks: canon(blockRoot), inline: canon(inlineRoot) };

  unmount(component);
  inlineRoot.remove();
  return result;
};

/**
 * Render a Delta into a contenteditable, serialize it, render that, and serialize again.
 * `readEditor → renderDelta` must be a fixed point, so `first` and `second` must be equal —
 * this guards the editor's DOM↔Delta round-trip (incl. block attrs and the trailing newline).
 */
export const roundTrip = (delta: RichText, defaultBlock: BlockType = "p"): RichText[] => {
  const el = document.createElement("div");
  el.contentEditable = "true";
  document.body.appendChild(el);

  renderDelta(el, new Delta(delta.ops), defaultBlock);
  const first = readEditor(el, null, defaultBlock).delta;
  renderDelta(el, first, defaultBlock);
  const second = readEditor(el, null, defaultBlock).delta;

  el.remove();
  return [{ ops: first.ops }, { ops: second.ops }];
};

/**
 * Exercise the toolbar's real `execCommand("formatBlock", "<block>")` path: render a single
 * line, select it, run the command, then serialize. Confirms the browser command + readEditor
 * produce the expected block attribute (the one path the unit/parity tests can't reach).
 */
export const applyFormatBlock = (text: string, block: BlockType): RichText => {
  const el = document.createElement("div");
  el.contentEditable = "true";
  document.body.appendChild(el);
  renderDelta(el, new Delta([{ insert: text }]), "p");

  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el.firstChild as Node);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  document.execCommand("formatBlock", false, `<${block}>`);
  const out = readEditor(el, null, "p").delta;
  el.remove();
  return { ops: out.ops };
};

/**
 * Exercise the toolbar's real `insertUnorderedList`/`insertOrderedList` path on a single line,
 * then serialize — confirms the browser list command + readEditor produce the expected `block`.
 */
export const applyListCommand = (text: string, block: "ul" | "ol"): RichText => {
  const el = document.createElement("div");
  el.contentEditable = "true";
  document.body.appendChild(el);
  renderDelta(el, new Delta([{ insert: text }]), "p");

  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el.firstChild as Node);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  document.execCommand(block === "ul" ? "insertUnorderedList" : "insertOrderedList", false);
  const out = readEditor(el, null, "p").delta;
  el.remove();
  return { ops: out.ops };
};

/**
 * Exercise an inline mark's real `execCommand` (bold/italic/underline/strikeThrough) on a
 * selected line, then serialize — confirms the browser command + readEditor produce the
 * expected inline attribute.
 */
export const applyInlineCommand = (text: string, command: string): RichText => {
  const el = document.createElement("div");
  el.contentEditable = "true";
  document.body.appendChild(el);
  renderDelta(el, new Delta([{ insert: text }]), "p");

  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el.firstChild as Node);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  document.execCommand(command, false);
  const out = readEditor(el, null, "p").delta;
  el.remove();
  return { ops: out.ops };
};
