// SPDX-License-Identifier: MPL-2.0

/**
 * Describes one inline mark. A mark is fully defined by this object, so adding a new one means
 * writing a single file and listing it in `index.ts` — `richText.ts`, `DeltaView.svelte` and
 * `RichTextField.svelte` all loop over the registry rather than naming marks individually.
 *
 * Two kinds:
 *  - Toggle marks (bold/italic/…): boolean — a semantic `tag`, an `execCommand`, and DOM detection.
 *  - Color marks (text color / highlight): valued — the Delta attribute holds a CSS color string,
 *    set via `color.command` and rendered as a `<span>` with `color.css`.
 */
export interface InlineMark {
  /** Delta attribute key and segment mark id, e.g. "bold" or "background". */
  attr: string;
  /** Toolbar button content + tooltip. For toggle marks the label is shown inside `tag`. */
  button: { label: string; title: string };

  // --- Toggle marks ---
  /** Element the text is wrapped in when rendering, e.g. "strong"/"em"/"u"/"s". */
  tag?: string;
  /** `document.execCommand` name that toggles the mark in the contenteditable. */
  command?: string;
  /** Tag names that imply this mark when reading the DOM (defaults to `[tag]` upper-cased). */
  matchTags?: string[];
  /** Inline-style test, for execCommand output (styleWithCSS) or pasted content. */
  matchStyle?: (style: CSSStyleDeclaration) => boolean;

  // --- Color marks ---
  /** Present iff this is a color-valued mark; the attribute stores a CSS color string. */
  color?: {
    /** CSS property carrying the color, e.g. "background-color" or "color". */
    css: "background-color" | "color";
    /** `document.execCommand` that sets the color (takes the color as its value). */
    command: "hiliteColor" | "foreColor";
  };
}
