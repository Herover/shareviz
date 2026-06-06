// SPDX-License-Identifier: MPL-2.0

/**
 * Describes one inline mark (bold, italic, …). A mark is fully defined by this object, so adding
 * a new one means writing a single file and listing it in `index.ts` — `richText.ts`,
 * `DeltaView.svelte` and `RichTextField.svelte` all loop over the registry rather than naming
 * marks individually.
 */
export interface InlineMark {
  /** Delta attribute key and segment mark id, e.g. "bold". Stored as `{ <attr>: true }`. */
  attr: string;
  /** Element the text is wrapped in when rendering, e.g. "strong"/"em"/"u"/"s". */
  tag: string;
  /** Toolbar button content + tooltip. The label is shown inside the mark's own `tag`. */
  button: { label: string; title: string };
  /** `document.execCommand` name that toggles the mark in the contenteditable. */
  command: string;
  /** Tag names that imply this mark when reading the DOM (defaults to `[tag]` upper-cased). */
  matchTags?: string[];
  /** Inline-style test, for execCommand output (styleWithCSS) or pasted content. */
  matchStyle?: (style: CSSStyleDeclaration) => boolean;
}
