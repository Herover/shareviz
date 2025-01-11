<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  interface Props {
    values: { k: string; d: unknown }[];
    title: (d: any) => ReturnType<import("svelte").Snippet>;
    onfocus?: (k: string, i: number, d: (typeof values)[number]["d"]) => void;
    onblur?: (k: string, i: number, d: (typeof values)[number]["d"]) => void;
    searchFn: (str: string, d: (typeof values)[number]) => boolean;
    moveUp: (k: string, i: number) => void;
    moveDown: (k: string, i: number) => void;
    onSelectedChanged: (values: { [key: string]: boolean }, indexes: number[]) => void;
  }

  let { values, title, onfocus, onblur, searchFn, moveUp, moveDown, onSelectedChanged }: Props =
    $props();

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
  <label>
    Search
    <input bind:value={searchString} class="line-search" />
  </label>
  <!-- <LinesEditorLine
    style={defaultStyle}
    selected={defaultSelected}
    {chartColors}
    onSelect={(d) => toggleSelect(null, d.selected, d.replace, null)}
  /> -->
  {#each filteredValues as line, i}
    {#if line}
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
            onkeydown={(e) => e.key == " " && i != filteredValues.length - 1 && moveDown(line.k, i)}
            onclick={() => i != filteredValues.length - 1 && moveDown(line.k, i)}>&#x25BC;</span
          >
          <!-- extra actions -->
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .line-list {
    width: 100%;
    height: 300px;
    overflow-y: scroll;
    border: 1px solid var(--text-primary);
    box-sizing: border-box;
    background-color: var(--main-bg-color);
  }
  .line-search {
    width: 100%;
  }

  .line-item {
    width: 100%;
    padding: 0.3em;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    cursor: pointer;
  }
  .line-selected {
    background-color: #dddddd;
  }
  .line-unselected:hover {
    background-color: var(--hover-bg-color);
  }
  .line-text {
  }
  .line-buttons {
    margin-left: auto;
    height: 16px;
    display: flex;
    align-items: center;
  }
</style>
