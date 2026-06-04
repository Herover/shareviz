<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Delta } from "rich-text";
  import type {
    PresenceAddress,
    PresenceData,
    ShareDBConnection,
  } from "$lib/chartStores/data.svelte";
  import { placeCaret, readEditor, renderDelta, toDelta } from "./richText";

  interface Props {
    connection: ShareDBConnection;
    /** Document path of the rich-text field, e.g. ["chart", "description"]. */
    path: PresenceAddress;
    label?: string;
  }

  let { connection, path, label }: Props = $props();

  let editorEl: HTMLDivElement;
  // Last document Delta we rendered/serialized. Kept in sync with the doc for this field.
  let currentDelta = new Delta();
  let composing = false;
  let pendingRemote = false;

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
    const { delta } = readEditor(editorEl);
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
    const { caret } = focused ? readEditor(editorEl, window.getSelection()) : { caret: null };
    renderDelta(editorEl, next);
    if (focused && caret != null) {
      placeCaret(editorEl, change.transformPosition(caret));
    }
    currentDelta = next;
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
    commitLocal();
  };

  const onfocusin = () => connection.setLocalSelection(path);
  const onfocusout = (e: FocusEvent) => {
    const wrapper = e.currentTarget as HTMLElement;
    if (!wrapper.contains(e.relatedTarget as Node | null)) {
      connection.setLocalSelection(null);
    }
  };

  onMount(() => {
    currentDelta = readDoc();
    renderDelta(editorEl, currentDelta);
    connection.doc.on("op", onOp);
  });
  onDestroy(() => {
    connection.doc.removeListener("op", onOp);
    connection.setLocalSelection(null);
  });
</script>

<div class="rich-text-field" {onfocusin} {onfocusout}>
  <div class="rich-text-toolbar">
    {#if label}
      <span class="rich-text-label">{label}</span>
    {/if}
    <button
      type="button"
      title="Bold"
      onmousedown={(e) => e.preventDefault()}
      onclick={() => format("bold")}><b>B</b></button
    >
    <button
      type="button"
      title="Italic"
      onmousedown={(e) => e.preventDefault()}
      onclick={() => format("italic")}><i>I</i></button
    >
    <button
      type="button"
      title="Underline"
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
  .rich-text-editor {
    min-height: 60px;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    cursor: text;
    text-align: left;
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
