// SPDX-License-Identifier: MPL-2.0

// Browser-side fixture for `rich-text-render.spec.ts`, imported via the dev server
// inside `page.evaluate`. Static imports here let Vite resolve the bare
// `svelte`/`rich-text` specifiers and — crucially — dedupe Svelte to a single runtime
// instance shared with the mounted component (importing `mount` separately at runtime
// yields a second instance whose effect scheduler the component can't use).
//
// The two renderers are intentionally NOT byte-identical: `renderDelta` emits a `<div>`
// block per line with semantic `<strong>`/`<em>`/`<u>` (the contenteditable model),
// while `DeltaView` emits inline `<span class="rt-*">` runs split by `<br>` (so it can
// live inside an <h1>/<p>). What must match is the semantics: the same lines, each with
// the same text runs and the same bold/italic/underline per run.

import { mount, unmount } from "svelte";
import { Delta } from "rich-text";
import type { RichText } from "../../src/lib/chart";
import DeltaView from "../../src/lib/components/chart/DeltaView.svelte";
import { renderDelta } from "../../src/lib/components/chart/richText";

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}
type Lines = Run[][];

/** Canonicalize `renderDelta`'s block model: one `<div>` per line, semantic tags. */
const fromBlocks = (root: HTMLElement): Lines => {
  const lines: Lines = [];
  for (const block of Array.from(root.children)) {
    const runs: Run[] = [];
    const walk = (node: Node, fmt: Omit<Run, "text">) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.nodeValue) {
            runs.push({ text: child.nodeValue, ...fmt });
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          if (el.tagName === "BR") {
            continue; // empty-line placeholder, contributes no text
          }
          walk(el, {
            bold: fmt.bold || el.tagName === "STRONG" || el.tagName === "B",
            italic: fmt.italic || el.tagName === "EM" || el.tagName === "I",
            underline: fmt.underline || el.tagName === "U",
          });
        }
      }
    };
    walk(block, { bold: false, italic: false, underline: false });
    lines.push(runs);
  }
  return lines;
};

/** Canonicalize `DeltaView`'s inline model: `<span class="rt-*">` runs split by `<br>`. */
const fromInline = (root: HTMLElement): Lines => {
  const lines: Lines = [[]];
  for (const child of Array.from(root.childNodes)) {
    const el = child.nodeType === Node.ELEMENT_NODE ? (child as HTMLElement) : null;
    if (el?.tagName === "BR") {
      lines.push([]);
      continue;
    }
    const text = child.textContent ?? "";
    if (!text) {
      continue;
    }
    lines[lines.length - 1].push({
      text,
      bold: el?.classList.contains("rt-bold") ?? false,
      italic: el?.classList.contains("rt-italic") ?? false,
      underline: el?.classList.contains("rt-underline") ?? false,
    });
  }
  return lines;
};

export interface Rendered {
  blocks: Lines;
  inline: Lines;
}

/** Render `delta` through both renderers and return their canonical line/run forms. */
export const renderBoth = (delta: RichText): Rendered => {
  const blockRoot = document.createElement("div");
  renderDelta(blockRoot, new Delta(delta.ops));

  const inlineRoot = document.createElement("div");
  document.body.appendChild(inlineRoot);
  const component = mount(DeltaView, { target: inlineRoot, props: { delta } });

  const result: Rendered = { blocks: fromBlocks(blockRoot), inline: fromInline(inlineRoot) };

  unmount(component);
  inlineRoot.remove();
  return result;
};
