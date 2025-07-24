<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { orDefault } from "$lib/utils";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import { chartToEditor } from "../../../chartToEditorStore.svelte";
  import type { LineStyleStore } from "$lib/chartStores/lineStyle.svelte";

  interface Props {
    style?: LineStyleStore;
    key?: string | undefined;
    index?: number;
    chartColors?: string[];
    selected: boolean;
    onSelect: (d: { selected: boolean; replace: boolean }) => void;
  }

  let {
    style,
    key = undefined,
    index = -1,
    chartColors = [],
    selected,
    onSelect,
  }: Props = $props();

  const toggleSelect = (me: MouseEvent | null, ke: KeyboardEvent | null) => {
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
    onSelect({ replace, selected: !selected });
  };

  const toggleHover = (me: Event | null) => {
    if (me == null) {
      chartToEditor.setHighlight([]);
    } else {
      chartToEditor.setHighlight(["elements", index, key]);
    }
  };
</script>

<div
  onclick={(e) => toggleSelect(e, null)}
  onkeydown={(e) => toggleSelect(null, e)}
  onmouseover={(e) => toggleHover(e)}
  onmouseout={() => toggleHover(null)}
  onfocus={(e) => toggleHover(e)}
  onblur={() => toggleHover(null)}
  class:line-selected={selected}
  class:line-unselected={!selected}
  class="line-item"
  role="button"
  tabindex="0"
>
  <div class="line-text">
    {orDefault(key, "Default")}
  </div>
  <div class="line-buttons">
    {#if typeof style != "undefined"}
      {#if typeof key != "undefined"}
        &#x25B2; &#x25BC; &nbsp;
        <ColorPicker
          color={orDefault(style?.data.color, "#00000000")}
          {chartColors}
          onchange={(s) => style.setColor(s)}
        />
        &nbsp;
        <span
          onclick={() => style.delete()}
          onkeydown={(e) => (e.code == "Space" ? style.delete() : "")}
          role="button"
          tabindex="0"
          title="delete">❌</span
        >
      {:else}
        <ColorPicker
          color={orDefault(style?.data.color, "#00000000")}
          {chartColors}
          onchange={(s) => style.setColor(s)}
        />
        &nbsp;
        <span style:visibility="hidden" title="delete">❌</span>
      {/if}
    {/if}
  </div>
</div>

<style>
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
    background-color: #eeeeee;
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
