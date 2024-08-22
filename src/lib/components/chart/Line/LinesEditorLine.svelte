<script lang="ts">
  import type { lineStyle } from "$lib/chartStore";
  import { orDefault } from "$lib/utils";
  import { createEventDispatcher } from "svelte";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  export let style: ReturnType<typeof lineStyle> | undefined = undefined;
  export let key: string | undefined = undefined;
  export let chartColors: string[] = [];
  export let selected: boolean;

  const dispatch = createEventDispatcher<{
    onSelect: { selected: boolean; replace: boolean };
  }>();

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
    dispatch("onSelect", { replace, selected: !selected });
  };
</script>

<div
  on:click={(e) => toggleSelect(e, null)}
  on:keydown={(e) => toggleSelect(null, e)}
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
          color={orDefault($style?.color, "#00000000")}
          {chartColors}
          on:change={(e) => style.setColor(e.detail)}
        />
        &nbsp;
        <span
          on:click={() => style.delete()}
          on:keydown={(e) => (e.code == "Space" ? style.delete() : "")}
          role="button"
          tabindex="0"
          title="delete">❌</span
        >
      {:else}
        <ColorPicker
          color={orDefault($style?.color, "#00000000")}
          {chartColors}
          on:change={(e) => style.setColor(e.detail)}
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
