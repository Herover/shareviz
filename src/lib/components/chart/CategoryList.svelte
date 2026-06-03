<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { PresenceAddress, ShareDBConnection } from "$lib/chartStores/data.svelte";

  interface Props {
    values: { k: string; d: unknown }[];
    title: (d: any) => ReturnType<import("svelte").Snippet>;
    onfocus?: (k: string, i: number, d: unknown) => void;
    onblur?: (k: string, i: number, d: unknown) => void;
    searchFn: (str: string, d: { k: string; d: unknown }) => boolean;
    moveUp: (k: string, i: number) => void;
    moveDown: (k: string, i: number) => void;
    onSelectedChanged: (values: { [key: string]: boolean }, indexes: number[]) => void;
    /** Optional presence: shows who else is currently editing each item. */
    connection?: ShareDBConnection | undefined;
    addressFor?: (item: { k: string; d: unknown }) => PresenceAddress;
  }

  let {
    values,
    title,
    onfocus,
    onblur,
    searchFn,
    moveUp,
    moveDown,
    onSelectedChanged,
    connection,
    addressFor,
  }: Props = $props();

  const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

  let selected: { [key: string]: boolean } = $state({});

  let searchString = $state("");
  const filteredValues: typeof values = $derived(
    values.filter((e) => (searchString.length == 0 ? true : searchFn(searchString, e))),
  );

  let rangedSelect = $state(false);
  let lastSelected: number | null = $state(-1);
  const keyDown = (e: KeyboardEvent) => {
    if (e.key == "Shift") {
      rangedSelect = true;
    }
  };
  const keyUp = (e: KeyboardEvent) => {
    if (e.key == "Shift") {
      rangedSelect = false;
    }
  };
  onMount(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
  });
  onDestroy(() => {
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  });

  let updateSelect = $derived(
    (key: string | null, select: boolean, replace: boolean, lineIndex: number | null) => {
      if (rangedSelect) {
        if (lineIndex == null) {
          // defaultSelected = true;
          lineIndex = 0;
        }
        if (lastSelected == null) {
          // defaultSelected = true;
          lastSelected = 0;
        }
        for (
          let i = Math.min(lineIndex, lastSelected);
          i <= Math.max(lineIndex, lastSelected);
          i++
        ) {
          if (i < 0 || filteredValues.length <= i) continue;
          const element = filteredValues[i];
          selected[element.k] = true;
        }
        document.getSelection()?.removeAllRanges();
      } else if (replace) {
        if (key == null) {
          // defaultSelected = true;
        } else {
          if (typeof selected[key] == "undefined") selected[key] = true;
          // defaultSelected = false;
        }
        Object.keys(selected).forEach((k) => (selected[k] = k == key));
      } else {
        if (key == null) {
          // defaultSelected = !defaultSelected;
        } else {
          selected[key] = !selected[key];
        }
      }

      lastSelected = lineIndex;
      onSelectedChanged(
        selected,
        Object.keys(selected)
          .filter((k) => selected[k])
          .map((k) => values.findIndex((v) => v.k == k)),
      );
    },
  );
  const toggleSelect = (me: MouseEvent | null, ke: KeyboardEvent | null, k: string, i: number) => {
    let replace = true;
    if (ke) {
      if (ke.code != "Enter" && ke.code != "Space") {
        return;
      }
      ke.preventDefault();
      if (ke.ctrlKey) {
        replace = false;
      }
    } else if (me) {
      if (me.ctrlKey) {
        replace = false;
      }
    }
    updateSelect(k, !selected, replace, i);
  };
</script>

<div class="line-list">
  <div class="line-search-box">
    <input
      bind:value={searchString}
      class="line-search"
      type="text"
      placeholder="Search categories..."
    />
  </div>
  <!-- <LinesEditorLine
    style={defaultStyle}
    selected={defaultSelected}
    {chartColors}
    onSelect={(d) => toggleSelect(null, d.selected, d.replace, null)}
  /> -->
  <div class="line-box">
    {#each filteredValues as line, i (line.k)}
      {#if line}
        {@const editors = connection && addressFor ? connection.editorsUnder(addressFor(line)) : []}
        <div
          onclick={(e) => toggleSelect(e, null, line.k, i)}
          onkeydown={(e) => toggleSelect(null, e, line.k, i)}
          onmouseover={() => onfocus && onfocus(line.k, i, line)}
          onmouseout={() => onblur && onblur(line.k, i, null)}
          onfocus={() => onfocus && onfocus(line.k, i, line.d)}
          onblur={() => onblur && onblur(line.k, i, line.d)}
          class:line-selected={selected[line.k]}
          class:line-unselected={!selected[line.k]}
          class="line-item"
          role="button"
          tabindex="0"
        >
          <div class="line-text">
            {@render title(line)}
          </div>
          {#if editors.length > 0}
            <div class="line-presence" title={editors.map((e) => e.name).join(", ")}>
              {#each editors as editor (editor.id)}
                <span
                  class="line-presence-badge"
                  style:background-color={editor.color}
                  title={editor.name}
                >
                  {#if editor.image}
                    <img src={editor.image} alt={editor.name} />
                  {:else}
                    {initial(editor.name)}
                  {/if}
                </span>
              {/each}
            </div>
          {/if}
          <div class="line-buttons">
            <span
              role="button"
              tabindex="0"
              onkeydown={(e) => e.key == " " && i != 0 && moveUp(line.k, i)}
              onclick={() => i != 0 && moveUp(line.k, i)}>&#x25B2;</span
            >
            <span
              role="button"
              tabindex="0"
              onkeydown={(e) =>
                e.key == " " && i != filteredValues.length - 1 && moveDown(line.k, i)}
              onclick={() => i != filteredValues.length - 1 && moveDown(line.k, i)}>&#x25BC;</span
            >
            <!-- extra actions -->
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .line-list {
    width: 100%;
    overflow-y: scroll;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background-color: var(--bg-surface);
  }
  .line-search-box {
    padding: 6px 8px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-base);
  }
  .line-search {
    width: 100%;
  }
  .line-box {
    max-height: 300px;
    overflow-y: auto;
  }
  .line-item {
    display: flex;
    cursor: pointer;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border-subtle);
    transition: background var(--duration-micro) var(--ease-standard);
    color: var(--fg-primary);
  }
  .line-selected {
    background-color: var(--bg-sunken);
  }
  .line-unselected:hover {
    background-color: var(--bg-sunken);
  }
  .line-buttons {
    margin-left: auto;
    height: 16px;
    display: flex;
    align-items: center;
    color: var(--fg-tertiary);
  }
  .line-buttons span {
    padding: 4px 6px;
    font-size: 0.7rem;
  }
  .line-presence {
    display: flex;
    align-items: center;
    gap: 0.15em;
    margin-left: 6px;
  }
  .line-presence-badge {
    box-sizing: border-box;
    width: 1.3em;
    height: 1.3em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    font-weight: 600;
    color: var(--fg-on-accent);
    border: 1px solid var(--bg-surface);
    overflow: hidden;
  }
  .line-presence-badge img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
