// SPDX-License-Identifier: MPL-2.0

// Browser-side fixture for `rich-text-render.spec.ts`, imported via the dev server inside
// `page.evaluate`. Static imports here let Vite resolve the bare `svelte`/`rich-text`
// specifiers and dedupe Svelte to a single runtime instance shared with the mounted
// component (importing `mount` separately at runtime yields a second, incompatible instance).
//
// Both renderers now emit one block element (h1/h2/p) per line, but with different inline
// markup: `renderDelta` uses semantic `<strong>`/`<em>`/`<u>`, `DeltaView` uses
// `<span class="rt-*">`. The shared `canon` walker understands both, reducing each DOM to the
// same `{ block, segments }[]` form so the spec can assert semantic equivalence.

import { mount, unmount } from "svelte";
import { Delta } from "rich-text";
import type { RichText } from "../../src/lib/chart";
import { type BlockType } from "../../src/lib/components/chart/richText";
import DeltaView from "../../src/lib/components/chart/DeltaView.svelte";
import { readEditor, renderDelta } from "../../src/lib/components/chart/richText";

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}
interface Line {
  block: BlockType;
  segments: Run[];
}

/** Reduce a rendered DOM (either renderer) to block-typed lines of inline runs. */
const canon = (root: HTMLElement): Line[] => {
  const lines: Line[] = [];
  for (const block of Array.from(root.children)) {
    const segments: Run[] = [];
    const walk = (node: Node, fmt: Omit<Run, "text">) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.nodeValue) {
            segments.push({ text: child.nodeValue, ...fmt });
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          if (el.tagName === "BR") {
            continue; // empty-line placeholder, no text
          }
          walk(el, {
            bold: fmt.bold || el.tagName === "STRONG" || el.tagName === "B" || cls(el, "rt-bold"),
            italic: fmt.italic || el.tagName === "EM" || el.tagName === "I" || cls(el, "rt-italic"),
            underline: fmt.underline || el.tagName === "U" || cls(el, "rt-underline"),
          });
        }
      }
    };
    walk(block, { bold: false, italic: false, underline: false });
    lines.push({ block: block.tagName.toLowerCase() as BlockType, segments });
  }
  return lines;
};

const cls = (el: HTMLElement, name: string) => el.classList.contains(name);

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
