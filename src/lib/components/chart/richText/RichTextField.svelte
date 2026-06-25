<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Delta } from "rich-text";
  import type {
    PresenceAddress,
    PresenceData,
    ShareDBConnection,
  } from "$lib/chartStores/data.svelte";
  import {
    extendMarks,
    placeCaret,
    readEditor,
    renderDelta,
    safeUrl,
    selectEnclosingAnchor,
    toDelta,
    type BlockType,
    type MarkValue,
  } from "./richText";
  import { inlineMarks, type InlineMark } from "./marks/inline";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import UserBadge from "../UserBadge.svelte";
  import Icon from "../../Icon.svelte";

  interface Props {
    connection: ShareDBConnection;
    /** Document path of the rich-text field, e.g. ["chart", "description"]. */
    path: PresenceAddress;
    label?: string;
    /** Block type for lines with no explicit `block` attribute (and new fields). */
    defaultBlock?: BlockType;
  }

  let { connection, path, label, defaultBlock = "p" }: Props = $props();

  let editorEl: HTMLDivElement;
  // Last document Delta we rendered/serialized. Kept in sync with the doc for this field.
  let currentDelta = new Delta();
  let composing = false;
  let pendingRemote = false;
  // Block type and active inline marks at the caret, reflected in the toolbar.
  let currentBlock = $state<BlockType>("p");
  let currentMarks = $state<Record<string, MarkValue>>({});
  // The editor selection, captured while it's in this editor, so a color can still be applied
  // after the ColorPicker popout steals focus.
  let savedRange: Range | null = null;

  // Default colors offered before anything is set (also the swatch shown when none is active).
  const defaultColor = (mark: InlineMark) =>
    mark.color?.css === "background-color" ? "#fef08a" : "#111111";

  const blockOptions: { value: BlockType; label: string; short: string }[] = [
    { value: "h1", label: "Title", short: "H1" },
    { value: "h2", label: "Heading", short: "H2" },
    { value: "p", label: "Normal", short: "¶" },
    { value: "ul", label: "Bulleted list", short: "•" },
    { value: "ol", label: "Numbered list", short: "1." },
  ];

  // Presence is reused only to show who else is here — this field is never locked,
  // since concurrent editing is the whole point.
  let editors = $derived<PresenceData[]>(connection.editorsAt(path));

  /** Read the current document Delta for this field straight from the doc snapshot. */
  const readDoc = (): Delta => {
    let node: unknown = connection.doc.data;
    for (const segment of path) {
      if (node == null || typeof node !== "object") {
        node = undefined;
        break;
      }
      node = (node as Record<string | number, unknown>)[segment];
    }
    return toDelta(node);
  };

  /** Serialize the DOM, diff against what we last knew, and submit the change. */
  const commitLocal = () => {
    if (composing) {
      return;
    }
    const { delta } = readEditor(editorEl, null, defaultBlock);
    const change = currentDelta.diff(delta);
    if (change.ops.length > 0) {
      connection.submitRichTextChange(path, change);
      currentDelta = delta;
    }
  };

  /** Re-render from the doc after a remote change, transforming the caret through it. */
  const applyRemote = () => {
    const next = readDoc();
    const change = currentDelta.diff(next);
    if (change.ops.length === 0) {
      return;
    }
    const focused = document.activeElement === editorEl;
    const { caret } = focused
      ? readEditor(editorEl, window.getSelection(), defaultBlock)
      : { caret: null };
    renderDelta(editorEl, next, defaultBlock);
    if (focused && caret != null) {
      placeCaret(editorEl, change.transformPosition(caret));
    }
    currentDelta = next;
  };

  /** Reflect the block type and active inline marks at the caret in the toolbar. */
  const syncToolbar = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    const start = range.startContainer;
    if (!editorEl.contains(start)) {
      return; // selection isn't in this editor
    }
    // Remember the in-editor selection so a color can be applied after the ColorPicker takes focus.
    savedRange = range.cloneRange();

    // Climb from the caret to the line's block, collecting inline marks on the way (same
    // detection as readEditor, via the shared registry-driven `extendMarks`).
    let marks: Record<string, MarkValue> = {};
    let el: HTMLElement | null =
      start.nodeType === Node.ELEMENT_NODE ? (start as HTMLElement) : start.parentElement;
    while (el && el.parentElement !== editorEl) {
      marks = extendMarks(marks, el);
      el = el.parentElement;
    }
    currentMarks = marks;
    // For list items the climb stops at the <ul>/<ol> container (its parent is the editor).
    currentBlock =
      el?.tagName === "H1"
        ? "h1"
        : el?.tagName === "H2"
          ? "h2"
          : el?.tagName === "P"
            ? "p"
            : el?.tagName === "UL"
              ? "ul"
              : el?.tagName === "OL"
                ? "ol"
                : defaultBlock;
  };

  const onOp = (_ops: [unknown], source: unknown) => {
    if (source) {
      return; // our own optimistic op; the DOM already reflects it
    }
    if (composing) {
      pendingRemote = true; // never disrupt an in-progress IME composition
      return;
    }
    applyRemote();
  };

  const onInput = () => commitLocal();
  const onCompositionStart = () => {
    composing = true;
  };
  const onCompositionEnd = () => {
    composing = false;
    commitLocal();
    if (pendingRemote) {
      pendingRemote = false;
      applyRemote();
    }
  };
  const onPaste = (e: ClipboardEvent) => {
    // Insert as plain text so foreign markup never enters the document.
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    if (text) {
      document.execCommand("insertText", false, text);
    }
  };

  const toggleMark = (mark: InlineMark) => {
    if (!mark.command) {
      return;
    }
    editorEl.focus();
    document.execCommand(mark.command, false);
    commitLocal();
    syncToolbar(); // re-read active marks from the DOM after toggling
  };

  /**
   * Refocus the editor and restore the selection captured by `syncToolbar`, so a command applies
   * to the user's text after a toolbar control (ColorPicker / link prompt) stole focus.
   */
  const restoreSelection = () => {
    editorEl.focus();
    if (savedRange) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange);
    }
  };

  /** Apply a color mark (text color / highlight) to the saved selection. */
  const applyColor = (mark: InlineMark, color: string) => {
    if (!mark.color) {
      return;
    }
    restoreSelection();
    // styleWithCSS makes foreColor/hiliteColor emit `<span style=…>` (not `<font>`); restore it
    // afterwards so the toggle marks keep emitting semantic tags.
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(mark.color.command, false, color);
    document.execCommand("styleWithCSS", false, "false");
    commitLocal();
    syncToolbar();
  };

  /** Clear a color mark by setting it transparent (treated as absent on serialize). */
  const clearColor = (mark: InlineMark) => applyColor(mark, "transparent");

  /**
   * Prompt for a destination and link the saved selection. A collapsed caret inside an existing
   * link just updates that link's destination; a collapsed caret elsewhere inserts the typed URL
   * as the link's text. A blank/unsafe destination unlinks.
   */
  const applyLink = (mark: InlineMark) => {
    if (!mark.link) {
      return;
    }
    const current = currentMarks[mark.attr];
    const existing = typeof current === "string" ? current : "";
    const input = window.prompt("Link destination", existing || "https://");
    if (input == null) {
      return; // cancelled
    }
    restoreSelection();
    const url = safeUrl(input);
    if (!url) {
      document.execCommand(mark.link.remove, false); // blank/unsafe → remove any link
      commitLocal();
      syncToolbar();
      return;
    }
    const selection = window.getSelection();
    // Collapsed caret: if it's inside a link, select that anchor so createLink rewrites its href;
    // otherwise insert the typed text and select it back so createLink can wrap it.
    if (selection?.isCollapsed && !selectEnclosingAnchor(selection, editorEl)) {
      const text = input.trim();
      document.execCommand("insertText", false, text);
      const caret = selection.getRangeAt(0);
      if (caret.startContainer.nodeType === Node.TEXT_NODE) {
        const range = document.createRange();
        range.setStart(caret.startContainer, Math.max(0, caret.startOffset - text.length));
        range.setEnd(caret.startContainer, caret.startOffset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    document.execCommand(mark.link.command, false, url);
    commitLocal();
    syncToolbar();
  };

  /** Remove the link mark, selecting the whole anchor first if the caret merely sits inside one. */
  const removeLink = (mark: InlineMark) => {
    if (!mark.link) {
      return;
    }
    restoreSelection();
    const selection = window.getSelection();
    if (selection?.isCollapsed) {
      selectEnclosingAnchor(selection, editorEl);
    }
    document.execCommand(mark.link.remove, false);
    commitLocal();
    syncToolbar();
  };

  /** Set the block type of the line(s) in the current selection. */
  const applyBlock = (block: BlockType) => {
    editorEl.focus();
    if (block === "ul") {
      document.execCommand("insertUnorderedList", false); // toggles off if already a bullet list
    } else if (block === "ol") {
      document.execCommand("insertOrderedList", false);
    } else {
      document.execCommand("formatBlock", false, `<${block}>`);
    }
    commitLocal();
    syncToolbar(); // reflect the actual resulting block (a list toggle may revert to default)
  };

  const onfocusin = () => connection.setLocalSelection(path);
  const onfocusout = (e: FocusEvent) => {
    const wrapper = e.currentTarget as HTMLElement;
    if (!wrapper.contains(e.relatedTarget as Node | null)) {
      connection.setLocalSelection(null);
    }
  };

  onMount(() => {
    currentBlock = defaultBlock;
    currentDelta = readDoc();
    renderDelta(editorEl, currentDelta, defaultBlock);
    connection.doc.on("op", onOp);
    document.addEventListener("selectionchange", syncToolbar);
  });
  onDestroy(() => {
    connection.doc.removeListener("op", onOp);
    connection.setLocalSelection(null);
    document.removeEventListener("selectionchange", syncToolbar);
  });
</script>

<!-- The whole field gets a colored border + glow while a remote collaborator is in it
     (`--rt-presence` = their color); otherwise it falls back to the focus ring. -->
<div
  class="rich-text-field"
  class:has-remote={editors.length > 0}
  style:--rt-presence={editors[0]?.color ?? "transparent"}
  {onfocusin}
  {onfocusout}
>
  <div class="rich-text-head">
    {#if label}
      <span class="rich-text-label">{label}</span>
    {/if}
    <div class="rich-text-presence" title={editors.map((e) => e.name).join(", ")}>
      {#if editors.length > 0}
        {#each editors as editor (editor.id)}
          <UserBadge user={editor} />
        {/each}
        <span class="rich-text-presence-who">{editors[0].name}</span>
        {#if editors.length > 1}
          <span class="rich-text-presence-more">+{editors.length - 1}</span>
        {/if}
        <span class="rich-text-presence-verb">
          {editors.length > 1 ? "are editing" : "is editing"}
        </span>
        <span class="rich-text-typing" aria-hidden="true"><i></i><i></i><i></i></span>
      {/if}
    </div>
  </div>

  <div class="rich-text-toolbar" role="toolbar" aria-label={label ?? "Formatting"}>
    <div class="rich-text-group">
      {#each blockOptions as option (option.value)}
        <button
          type="button"
          class="rich-text-btn block"
          title={option.label}
          class:active={currentBlock === option.value}
          aria-pressed={currentBlock === option.value}
          onmousedown={(e) => e.preventDefault()}
          onclick={() => applyBlock(option.value)}>{option.short}</button
        >
      {/each}
    </div>
    <div class="rich-text-group">
      {#each inlineMarks as mark (mark.attr)}
        {#if mark.color}
          <div class="rich-text-color" title={mark.button.title}>
            <span class="rich-text-color-label" aria-hidden="true">{mark.button.label}</span>
            <ColorPicker
              color={typeof currentMarks[mark.attr] === "string"
                ? (currentMarks[mark.attr] as string)
                : defaultColor(mark)}
              onchange={(c) => applyColor(mark, c.c)}
            />
            <button
              type="button"
              class="rich-text-btn"
              title="Remove {mark.button.title.toLowerCase()}"
              onmousedown={(e) => e.preventDefault()}
              onclick={() => clearColor(mark)}>×</button
            >
          </div>
        {:else if mark.link}
          <button
            type="button"
            class="rich-text-btn"
            title={mark.button.title}
            class:active={currentMarks[mark.attr] !== undefined}
            aria-pressed={currentMarks[mark.attr] !== undefined}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => applyLink(mark)}><Icon name="link" /></button
          >
          {#if currentMarks[mark.attr] !== undefined}
            <button
              type="button"
              class="rich-text-btn"
              title="Remove {mark.button.title.toLowerCase()}"
              onmousedown={(e) => e.preventDefault()}
              onclick={() => removeLink(mark)}>×</button
            >
          {/if}
        {:else}
          <button
            type="button"
            class="rich-text-btn"
            title={mark.button.title}
            class:active={currentMarks[mark.attr] !== undefined}
            aria-pressed={currentMarks[mark.attr] !== undefined}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => toggleMark(mark)}
            ><svelte:element this={mark.tag ?? "span"}>{mark.button.label}</svelte:element></button
          >
        {/if}
      {/each}
    </div>
  </div>

  <div
    bind:this={editorEl}
    class="rich-text-editor"
    contenteditable="true"
    role="textbox"
    tabindex="0"
    aria-multiline="true"
    aria-label={label ?? "Rich text"}
    spellcheck="false"
    oninput={onInput}
    oncompositionstart={onCompositionStart}
    oncompositionend={onCompositionEnd}
    onpaste={onPaste}
  ></div>
</div>

<style>
  .rich-text-field {
    position: relative;
    border: 1.5px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    margin-bottom: 14px;
    transition:
      border-color var(--duration-standard) var(--ease-standard),
      box-shadow var(--duration-standard) var(--ease-standard);
  }
  /* A remote collaborator is editing here: glow in their color. */
  .rich-text-field.has-remote {
    border-color: var(--rt-presence);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--rt-presence) 18%, transparent);
  }
  /* You are editing (and nobody remote is): the usual focus ring. */
  .rich-text-field:focus-within:not(.has-remote) {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--border-focus) 22%, transparent);
  }

  /* Head: label + presence pill */
  .rich-text-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px 8px;
  }
  .rich-text-label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--fg-secondary);
  }

  /* Presence pill — "X is editing" with avatar and animated typing dots. */
  .rich-text-presence {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 9px 3px 3px;
    border-radius: var(--radius-pill);
    background: color-mix(in oklab, var(--rt-presence) 12%, var(--bg-surface));
    border: 1px solid color-mix(in oklab, var(--rt-presence) 35%, transparent);
    font-size: 11.5px;
    line-height: 1;
    font-weight: var(--weight-medium);
    color: var(--fg-primary);
  }
  .rich-text-presence-who {
    color: var(--fg-primary);
  }
  .rich-text-presence-more {
    color: var(--fg-secondary);
    font-weight: var(--weight-regular);
  }
  .rich-text-presence-verb {
    color: var(--fg-secondary);
    font-weight: var(--weight-regular);
    font-size: 11px;
  }
  .rich-text-typing {
    display: inline-flex;
    gap: 2px;
    margin-left: 2px;
  }
  .rich-text-typing i {
    width: 3px;
    height: 3px;
    border-radius: var(--radius-pill);
    background: var(--rt-presence);
    animation: rich-text-blip 1.2s infinite ease-in-out both;
  }
  .rich-text-typing i:nth-child(2) {
    animation-delay: 0.15s;
  }
  .rich-text-typing i:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes rich-text-blip {
    0%,
    80%,
    100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    40% {
      opacity: 1;
      transform: translateY(-1px);
    }
  }

  /* Toolbar — its own band between head and editor, with grouped controls. */
  .rich-text-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 10px;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    background: color-mix(in oklab, var(--bg-sunken) 50%, var(--bg-surface));
  }
  .rich-text-group {
    display: flex;
    gap: 2px;
    padding: 0 4px;
  }
  .rich-text-group + .rich-text-group {
    border-left: 1px solid var(--border-subtle);
  }
  /* Color mark control: label glyph + ColorPicker swatch + remove. */
  .rich-text-color {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .rich-text-color-label {
    font-size: 12.5px;
    line-height: 1;
    color: var(--fg-secondary);
  }
  .rich-text-btn {
    height: 26px;
    min-width: 26px;
    padding: 0 7px;
    border: 0;
    border-radius: 5px;
    background: none;
    font-family: var(--font-body);
    font-size: 12.5px;
    line-height: 1;
    color: var(--fg-secondary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background var(--duration-micro) var(--ease-standard),
      color var(--duration-micro) var(--ease-standard);
  }
  .rich-text-btn:hover {
    background: var(--bg-sunken);
    color: var(--fg-primary);
  }
  .rich-text-btn.active {
    background: var(--bg-surface);
    color: var(--fg-primary);
    box-shadow: 0 0 0 1px var(--border-default);
  }
  .rich-text-btn.block {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: var(--weight-semibold);
    letter-spacing: 0.02em;
  }
  .rich-text-btn b {
    font-weight: var(--weight-bold);
  }
  .rich-text-btn i {
    font-style: italic;
    font-family: var(--font-display);
  }
  .rich-text-btn u {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* Editor area */
  .rich-text-editor {
    padding: 14px 18px 16px;
    min-height: 110px;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    cursor: text;
    text-align: left;
    font-size: 14px;
    line-height: 1.55;
    color: var(--fg-primary);
    outline: none;
  }
  /* Block hierarchy inside the contenteditable (renderDelta builds the elements imperatively,
     so they need :global to be styled). Mirrors DeltaView so editing is WYSIWYG-ish. */
  .rich-text-editor :global(h1),
  .rich-text-editor :global(h2) {
    font-family: var(--font-display);
    font-weight: var(--weight-regular);
  }
  .rich-text-editor :global(:first-child) {
    margin-top: 0;
  }
  .rich-text-editor :global(h1) {
    font-size: 26px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin: 6px 0 4px;
  }
  .rich-text-editor :global(h2) {
    font-size: 20px;
    line-height: 1.15;
    margin: 8px 0 4px;
  }
  .rich-text-editor :global(p) {
    margin: 4px 0;
  }
  .rich-text-editor :global(ul),
  .rich-text-editor :global(ol) {
    margin: 4px 0;
    padding-left: 22px;
  }
  .rich-text-editor :global(li) {
    margin: 2px 0;
  }
  .rich-text-editor :global(em) {
    font-style: italic;
  }
  .rich-text-editor :global(strong) {
    font-weight: var(--weight-semibold);
  }
  /* Links read as links while editing; the caret still lands inside them (contenteditable
     places the caret rather than navigating on click). */
  .rich-text-editor :global(a) {
    color: var(--accent-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: text;
  }
</style>
