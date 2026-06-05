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
    placeCaret,
    readEditor,
    renderDelta,
    toDelta,
    type Attrs,
    type BlockType,
  } from "./richText";

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
  // Block type at the caret, reflected in the toolbar selector (initialized in onMount).
  let currentBlock = $state<BlockType>("p");
  let currentFormat = $state<Attrs>({});

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
  const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

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

  /** Reflect the block type at the caret in the toolbar selector. */
  const syncCurrentBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const start = selection.getRangeAt(0).startContainer;
    if (!editorEl.contains(start)) {
      return; // selection isn't in this editor
    }

    currentFormat = {};

    let el: HTMLElement | null =
      start.nodeType === Node.ELEMENT_NODE ? (start as HTMLElement) : start.parentElement;
    while (el && el.parentElement !== editorEl) {
      if (el.tagName == "STRONG" || el.tagName == "B") {
        currentFormat.bold = true;
      }
      if (el.tagName == "EM" || el.tagName == "I") {
        currentFormat.italic = true;
      }
      if (el.tagName == "U") {
        currentFormat.underline = true;
      }

      el = el.parentElement;
    }
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

  const format = (command: "bold" | "italic" | "underline") => {
    editorEl.focus();
    document.execCommand(command, false);
    currentFormat[command] = currentFormat[command] ? undefined : true;
    commitLocal();
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
    syncCurrentBlock(); // reflect the actual resulting block (a list toggle may revert to default)
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
    document.addEventListener("selectionchange", syncCurrentBlock);
  });
  onDestroy(() => {
    connection.doc.removeListener("op", onOp);
    connection.setLocalSelection(null);
    document.removeEventListener("selectionchange", syncCurrentBlock);
  });
</script>

<div class="rich-text-field" {onfocusin} {onfocusout}>
  <div class="rich-text-toolbar">
    {#if label}
      <span class="rich-text-label">{label}</span>
    {/if}
    <div class="rich-text-blocks">
      {#each blockOptions as option (option.value)}
        <button
          type="button"
          title={option.label}
          class:active={currentBlock === option.value}
          aria-pressed={currentBlock === option.value}
          onmousedown={(e) => e.preventDefault()}
          onclick={() => applyBlock(option.value)}>{option.short}</button
        >
      {/each}
    </div>
    <button
      type="button"
      title="Bold"
      class:active={currentFormat.bold}
      aria-pressed={currentFormat.bold}
      onmousedown={(e) => e.preventDefault()}
      onclick={() => format("bold")}><b>B</b></button
    >
    <button
      type="button"
      title="Italic"
      class:active={currentFormat.italic}
      aria-pressed={currentFormat.italic}
      onmousedown={(e) => e.preventDefault()}
      onclick={() => format("italic")}><i>I</i></button
    >
    <button
      type="button"
      title="Underline"
      class:active={currentFormat.underline}
      aria-pressed={currentFormat.underline}
      onmousedown={(e) => e.preventDefault()}
      onclick={() => format("underline")}><u>U</u></button
    >

    {#if editors.length > 0}
      <div class="rich-text-badges" title={editors.map((e) => e.name).join(", ")}>
        {#each editors as editor (editor.id)}
          <span class="rich-text-badge" style:background-color={editor.color} title={editor.name}>
            {#if editor.image}
              <img src={editor.image} alt={editor.name} />
            {:else}
              {initial(editor.name)}
            {/if}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <div
    bind:this={editorEl}
    class="rich-text-editor control"
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
  }
  .rich-text-toolbar {
    display: flex;
    align-items: center;
    gap: 0.25em;
    margin-bottom: 4px;
  }
  .rich-text-label {
    margin-right: auto;
    color: var(--fg-secondary);
  }
  .rich-text-toolbar button {
    width: 1.8em;
    height: 1.8em;
    padding: 0;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background-color: var(--bg-surface);
    color: var(--fg-primary);
    cursor: pointer;
    line-height: 1;
  }
  .rich-text-toolbar button:hover {
    background-color: var(--bg-sunken);
  }
  .rich-text-toolbar button.active {
    background-color: var(--accent-primary);
    color: var(--fg-on-accent);
    border-color: var(--accent-primary);
  }
  .rich-text-blocks {
    display: flex;
    gap: 0.25em;
    margin-right: 0.25em;
  }
  .rich-text-blocks button {
    width: auto;
    min-width: 1.8em;
    padding: 0 0.35em;
    font-size: 0.85em;
  }
  .rich-text-editor {
    min-height: 60px;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    cursor: text;
    text-align: left;
  }
  /* Block hierarchy inside the contenteditable (renderDelta builds the elements imperatively,
     so they need :global to be styled). Mirrors DeltaView so editing is WYSIWYG-ish. */
  .rich-text-editor :global(h1),
  .rich-text-editor :global(h2),
  .rich-text-editor :global(p) {
    font-weight: normal;
    margin: 0.3em 0;
  }
  .rich-text-editor :global(:first-child) {
    margin-top: 0;
  }
  .rich-text-editor :global(h1) {
    font-size: 2em;
  }
  .rich-text-editor :global(h2) {
    font-size: 1.5em;
  }
  .rich-text-editor :global(p) {
    font-size: 1em;
  }
  .rich-text-editor :global(ul),
  .rich-text-editor :global(ol) {
    margin: 0.3em 0;
    padding-left: 1.5em;
    font-size: 1em;
  }
  .rich-text-editor :global(li) {
    margin: 0;
  }
  .rich-text-badges {
    display: flex;
    align-items: center;
    gap: 0.15em;
  }
  .rich-text-badge {
    width: 1.4em;
    height: 1.4em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    font-weight: 600;
    color: var(--fg-on-accent);
    border: 1px solid var(--bg-surface);
    overflow: hidden;
  }
  .rich-text-badge img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
