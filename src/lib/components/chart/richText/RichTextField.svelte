<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { Delta } from "rich-text";
  import type {
    PresenceAddress,
    PresenceData,
    ShareDBConnection,
  } from "$lib/chartStores/data.svelte";
  import {
    caretPosition,
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

  // --- Toolbar overflow ---
  // The toolbar is one flat, ordered list of items rendered by a single snippet, so the same item
  // renders identically whether it sits in the bar or the overflow menu. `group` drives the divider
  // between the block controls and the inline marks.
  type ToolbarItem =
    | { group: "block"; block: (typeof blockOptions)[number] }
    | { group: "inline"; mark: InlineMark };
  const toolbarItems: ToolbarItem[] = [
    ...blockOptions.map((block) => ({ group: "block", block }) as const),
    ...inlineMarks.map((mark) => ({ group: "inline", mark }) as const),
  ];
  const itemKey = (item: ToolbarItem) =>
    item.group === "block" ? `b:${item.block.value}` : `m:${item.mark.attr}`;
  // A group divider precedes an item whose group differs from the one before it in the full list.
  const startsGroup = (index: number) =>
    index > 0 && toolbarItems[index].group !== toolbarItems[index - 1].group;

  let toolbarEl = $state<HTMLDivElement>();
  let itemsEl = $state<HTMLDivElement>();
  let overflowEl = $state<HTMLDivElement>();
  // How many leading items fit in the bar; the rest move to the overflow menu on the right.
  let visibleCount = $state(toolbarItems.length);
  let overflowOpen = $state(false);
  // Cached natural width per item index. Item widths are stable, so we measure each while it's in
  // the bar (every item is, on the first all-visible pass) and reuse the value once it overflows.
  const itemWidths: number[] = [];

  let visibleItems = $derived(toolbarItems.slice(0, visibleCount));
  let overflowItems = $derived(toolbarItems.slice(visibleCount));
  let hasOverflow = $derived(overflowItems.length > 0);

  /** Re-measure widths of the items in the bar, then pick how many fit (reserving the menu button). */
  const measureToolbar = () => {
    if (!toolbarEl || !itemsEl) {
      return;
    }
    const children = itemsEl.children;
    for (let i = 0; i < children.length; i++) {
      itemWidths[i] = (children[i] as HTMLElement).offsetWidth;
    }
    if (itemWidths.length < toolbarItems.length) {
      return; // not every item measured yet (waiting for the first all-visible render)
    }
    const gap = parseFloat(getComputedStyle(itemsEl).columnGap) || 0;
    const t = getComputedStyle(toolbarEl);
    const avail =
      toolbarEl.clientWidth - (parseFloat(t.paddingLeft) || 0) - (parseFloat(t.paddingRight) || 0);
    const overflowW = overflowEl ? overflowEl.offsetWidth + gap : 34;

    // Greedy: largest prefix of items whose total width (with gaps) stays within `limit`.
    const countWithin = (limit: number) => {
      let used = 0;
      let n = 0;
      while (n < toolbarItems.length) {
        used += itemWidths[n] + (n > 0 ? gap : 0);
        if (used > limit) {
          break;
        }
        n++;
      }
      return n;
    };
    let count = countWithin(avail);
    if (count < toolbarItems.length) {
      count = countWithin(avail - overflowW); // need the menu button, so reserve its width
    }
    visibleCount = Math.max(1, count);
    if (visibleCount >= toolbarItems.length) {
      closeOverflow();
    }
  };

  // Close the overflow menu on an outside click or Escape (mirrors the app's other dropdowns).
  let overflowOpenedAt = 0;
  const isInOverflow = (node: Node | null): boolean => {
    for (let n = node; n; n = n.parentNode) {
      if (n === overflowEl) {
        return true;
      }
    }
    return false;
  };
  const onOverflowDocClick = (e: MouseEvent) => {
    if (overflowOpenedAt < Date.now() && !isInOverflow(e.target as Node)) {
      closeOverflow();
    }
  };
  const onOverflowDocKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeOverflow();
    }
  };
  const openOverflow = () => {
    overflowOpen = true;
    overflowOpenedAt = Date.now() + 100;
    document.addEventListener("click", onOverflowDocClick);
    document.addEventListener("keyup", onOverflowDocKey);
  };
  function closeOverflow() {
    if (!overflowOpen) {
      return;
    }
    overflowOpen = false;
    document.removeEventListener("click", onOverflowDocClick);
    document.removeEventListener("keyup", onOverflowDocKey);
  }
  const toggleOverflow = () => (overflowOpen ? closeOverflow() : openOverflow());

  // Created in onMount so it never runs during SSR (ResizeObserver is browser-only).
  let resizeObserver: ResizeObserver | undefined;
  // Re-measure when an item's width can change (the link's "remove" button toggles with the caret).
  $effect(() => {
    void currentMarks;
    measureToolbar();
  });

  // Presence shows who else is here (this field is never locked, since concurrent editing is
  // the whole point) and carries each collaborator's caret index for the overlay below.
  let editors = $derived<PresenceData[]>(connection.editorsAt(path));

  // --- Remote carets ---
  // Each remote editor's caret arrives via presence as a document character index. Between
  // announcements (a collaborator only re-announces when their own selection changes) the index
  // goes stale as the document changes, so every change we apply — local edits and remote ops —
  // transforms the tracked indices through it, exactly like the local caret in `applyRemote`.
  let editorWrapEl = $state<HTMLDivElement>();
  type RemoteCaret = {
    key: string;
    name: string;
    color: string;
    left: number;
    top: number;
    height: number;
  };
  let remoteCarets = $state<RemoteCaret[]>([]);
  // Key of the caret whose name flag is shown (hover is tracked manually — see onEditorMouseMove).
  let hoveredCaret = $state<string | null>(null);
  // Per-session caret state: the last index that session announced, and that index transformed
  // through every change applied since. A changed announcement resets the transform.
  // Deliberately non-reactive — the rendered output is the `remoteCarets` state above.
  /* eslint-disable-next-line svelte/prefer-svelte-reactivity */
  const caretIndices = new Map<string, { announced: number; index: number }>();

  /** Shift tracked remote caret indices through a change we just applied to the document. */
  const transformRemoteCarets = (change: Delta) => {
    for (const state of caretIndices.values()) {
      state.index = change.transformPosition(state.index);
    }
  };

  /** Recompute the pixel position of every remote caret from the current DOM. */
  const updateRemoteCarets = () => {
    if (!editorEl || !editorWrapEl) {
      return;
    }
    const wrapRect = editorWrapEl.getBoundingClientRect();
    const next: RemoteCaret[] = [];
    // Non-reactive scratch set, only used within this call.
    /* eslint-disable-next-line svelte/prefer-svelte-reactivity */
    const seen = new Set<string>();
    for (const editor of editors) {
      if (typeof editor.caret !== "number") {
        continue;
      }
      const key = editor.presenceId ?? editor.id;
      seen.add(key);
      let state = caretIndices.get(key);
      if (!state || state.announced !== editor.caret) {
        state = { announced: editor.caret, index: editor.caret };
        caretIndices.set(key, state);
      }
      // Clamp to the last valid position (the document ends with a "\n" that isn't addressable).
      // An announcement can race the op it reflects and end up transformed past the end; without
      // the clamp such a caret falls back to the block-element rect and renders as a full-height
      // bar at the line start.
      const index = Math.min(state.index, Math.max(0, currentDelta.length() - 1));
      const pos = caretPosition(editorEl, index);
      if (!pos) {
        continue;
      }
      next.push({
        key,
        name: editor.name,
        color: editor.color,
        left: pos.left - wrapRect.left,
        top: pos.top - wrapRect.top,
        height: pos.height,
      });
    }
    // Forget sessions that left the field so their state doesn't linger.
    for (const key of caretIndices.keys()) {
      if (!seen.has(key)) {
        caretIndices.delete(key);
      }
    }
    remoteCarets = next;
    if (hoveredCaret != null && !seen.has(hoveredCaret)) {
      hoveredCaret = null;
    }
  };

  // Reposition when presence changes (reads `editors`, so it tracks it).
  $effect(() => updateRemoteCarets());

  // The caret bars are pointer-events: none so they never steal clicks from the contenteditable
  // beneath; hover for the name flag is resolved by hand from mouse coordinates instead.
  const onEditorMouseMove = (e: MouseEvent) => {
    if (remoteCarets.length === 0) {
      return;
    }
    const wrapRect = editorWrapEl?.getBoundingClientRect();
    if (!wrapRect) {
      return;
    }
    const x = e.clientX - wrapRect.left;
    const y = e.clientY - wrapRect.top;
    const hit = remoteCarets.find(
      (caret) =>
        x >= caret.left - 4 &&
        x <= caret.left + 5 &&
        y >= caret.top - 2 &&
        y <= caret.top + caret.height + 2,
    );
    hoveredCaret = hit?.key ?? null;
  };
  const onEditorMouseLeave = () => (hoveredCaret = null);

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
      transformRemoteCarets(change);
      updateRemoteCarets();
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
    transformRemoteCarets(change);
    updateRemoteCarets();
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

    // Announce the caret to collaborators. Only while the editor itself has focus — a stale
    // selection can still point in here after focus moved to another field's input.
    if (document.activeElement === editorEl) {
      connection.setLocalSelection(path, readEditor(editorEl, selection, defaultBlock).caret);
    }

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
    resizeObserver = new ResizeObserver(() => {
      measureToolbar();
      updateRemoteCarets(); // reflow moves the carets' pixel positions
    });
    if (toolbarEl) {
      resizeObserver.observe(toolbarEl);
    }
    resizeObserver.observe(editorEl);
    // Measure once the bar has laid out, then again next frame so the menu button's own width
    // (and any late font metrics) are accounted for.
    tick().then(() => {
      measureToolbar();
      requestAnimationFrame(measureToolbar);
    });
  });
  onDestroy(() => {
    connection.doc.removeListener("op", onOp);
    connection.setLocalSelection(null);
    document.removeEventListener("selectionchange", syncToolbar);
    resizeObserver?.disconnect();
    closeOverflow();
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

  <!-- One snippet renders an item the same way in the bar or the overflow menu. -->
  {#snippet toolbarItem(item: ToolbarItem)}
    {#if item.group === "block"}
      <button
        type="button"
        class="rich-text-btn block"
        title={item.block.label}
        class:active={currentBlock === item.block.value}
        aria-pressed={currentBlock === item.block.value}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => applyBlock(item.block.value)}>{item.block.short}</button
      >
    {:else if item.mark.color}
      <div class="rich-text-color" title={item.mark.button.title}>
        <span class="rich-text-color-label" aria-hidden="true">{item.mark.button.label}</span>
        <ColorPicker
          color={typeof currentMarks[item.mark.attr] === "string"
            ? (currentMarks[item.mark.attr] as string)
            : defaultColor(item.mark)}
          onchange={(c) => applyColor(item.mark, c.c)}
        />
        <button
          type="button"
          class="rich-text-btn"
          title="Remove {item.mark.button.title.toLowerCase()}"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => clearColor(item.mark)}>×</button
        >
      </div>
    {:else if item.mark.link}
      <button
        type="button"
        class="rich-text-btn"
        title={item.mark.button.title}
        class:active={currentMarks[item.mark.attr] !== undefined}
        aria-pressed={currentMarks[item.mark.attr] !== undefined}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => applyLink(item.mark)}><Icon name="link" /></button
      >
      {#if currentMarks[item.mark.attr] !== undefined}
        <button
          type="button"
          class="rich-text-btn"
          title="Remove {item.mark.button.title.toLowerCase()}"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => removeLink(item.mark)}>×</button
        >
      {/if}
    {:else}
      <button
        type="button"
        class="rich-text-btn"
        title={item.mark.button.title}
        class:active={currentMarks[item.mark.attr] !== undefined}
        aria-pressed={currentMarks[item.mark.attr] !== undefined}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => toggleMark(item.mark)}
        ><svelte:element this={item.mark.tag ?? "span"}>{item.mark.button.label}</svelte:element
        ></button
      >
    {/if}
  {/snippet}

  <div
    class="rich-text-toolbar"
    role="toolbar"
    aria-label={label ?? "Formatting"}
    bind:this={toolbarEl}
  >
    <div class="rich-text-toolbar-items" bind:this={itemsEl}>
      {#each visibleItems as item, i (itemKey(item))}
        <div class="rich-text-item" class:sep={startsGroup(i)}>{@render toolbarItem(item)}</div>
      {/each}
    </div>
    {#if hasOverflow}
      <div class="rich-text-overflow" bind:this={overflowEl}>
        <button
          type="button"
          class="rich-text-btn rich-text-overflow-btn"
          class:active={overflowOpen}
          title="More formatting"
          aria-label="More formatting"
          aria-haspopup="menu"
          aria-expanded={overflowOpen}
          onmousedown={(e) => e.preventDefault()}
          onclick={toggleOverflow}><Icon name="moreHorizontal" /></button
        >
        {#if overflowOpen}
          <div class="rich-text-overflow-panel" role="menu" aria-label="More formatting">
            {#each overflowItems as item, i (itemKey(item))}
              <div class="rich-text-item" class:sep={i > 0 && startsGroup(visibleCount + i)}>
                {@render toolbarItem(item)}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- The mousemove/mouseleave handlers only resolve hover for the caret name flags. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="rich-text-editor-wrap"
    bind:this={editorWrapEl}
    onmousemove={onEditorMouseMove}
    onmouseleave={onEditorMouseLeave}
  >
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
      onscroll={updateRemoteCarets}
    ></div>
    <!-- Collaborators' carets, painted over the editor (never inside the contenteditable, so
         serialization and execCommand never see them). pointer-events: none throughout — hover
         for the name flag comes from the wrapper's mousemove. -->
    {#if remoteCarets.length > 0}
      <div class="rich-text-carets" aria-hidden="true">
        {#each remoteCarets as caret (caret.key)}
          <div
            class="rich-text-caret"
            class:hovered={hoveredCaret === caret.key}
            class:flag-below={caret.top < 28}
            style:left="{caret.left}px"
            style:top="{caret.top}px"
            style:height="{caret.height}px"
            style:--caret-color={caret.color}
          >
            <span class="rich-text-caret-flag">{caret.name}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
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
  /* The items that fit; clipped (never wrapped) so overflowing ones are hidden, not shown, until
     `measureToolbar` moves them into the menu. */
  .rich-text-toolbar-items {
    display: flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
    flex: 0 1 auto;
    overflow: hidden;
  }
  .rich-text-item {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex: 0 0 auto;
  }
  /* Divider before the first item of a new group (block vs inline marks). Uses border + padding
     only (both counted in offsetWidth) so `measureToolbar` stays accurate; no margin. */
  .rich-text-item.sep {
    border-left: 1px solid var(--border-subtle);
    padding-left: 7px;
  }
  /* Overflow menu, pinned to the right edge of the toolbar. */
  .rich-text-overflow {
    position: relative;
    flex: 0 0 auto;
    margin-left: auto;
    display: inline-flex;
  }
  .rich-text-overflow-panel {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    z-index: 25;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    max-width: 280px;
    padding: 5px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-2);
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

  /* Editor area. The wrap hosts the remote-caret overlay; it clips so carets on content
     scrolled out of the editor don't paint outside it. */
  .rich-text-editor-wrap {
    position: relative;
    overflow: hidden;
  }
  .rich-text-carets {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .rich-text-caret {
    position: absolute;
    width: 2px;
    border-radius: 1px;
    background: var(--caret-color);
  }
  /* The little knob that marks the caret as a collaborator's (the hover target's center). */
  .rich-text-caret::before {
    content: "";
    position: absolute;
    top: -3px;
    left: -2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--caret-color);
  }
  /* Name flag, revealed while the pointer is on the caret. */
  .rich-text-caret-flag {
    position: absolute;
    bottom: 100%;
    left: -2px;
    margin-bottom: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--caret-color);
    color: var(--fg-on-accent);
    font-size: 11px;
    line-height: 1.3;
    font-weight: var(--weight-medium);
    white-space: nowrap;
    opacity: 0;
    transform: translateY(2px);
    transition:
      opacity var(--duration-micro) var(--ease-standard),
      transform var(--duration-micro) var(--ease-standard);
  }
  .rich-text-caret.hovered .rich-text-caret-flag {
    opacity: 1;
    transform: translateY(0);
  }
  /* Near the top edge the flag would leave the (clipping) wrap; open it below the caret. */
  .rich-text-caret.flag-below .rich-text-caret-flag {
    bottom: auto;
    top: 100%;
    margin-bottom: 0;
    margin-top: 4px;
  }

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
