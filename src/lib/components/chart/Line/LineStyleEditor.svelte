<script lang="ts">
  import { LabelLocation } from "$lib/chart";
  import { lineStyle } from "$lib/chartStore";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  export let style: ReturnType<typeof lineStyle>;
  export let unspecifiecKeys: null | string[] = null;
  export let chartColors: string[];

  $: updateColor = (color: string) => {
    if ($style.label.color == $style.color) {
      style.setLabelColor(color);
    }
    style.setColor(color);
  };
  $: updateLabelColor = (color: string) => {
    style.setLabelColor(color);
  };
</script>

<div class="line-style-editor">
  {#if unspecifiecKeys != null}
    <select
      value={$style.k}
      on:change={(e) => style.setKey(e.currentTarget.value)}
    >
      <option>{$style.k}</option>
      {#each unspecifiecKeys as k}
        <option>{k}</option>
      {/each}
    </select>
  {/if}

  <input
    value={$style.label.text}
    on:change={(e) => style.setLabelText(e.currentTarget.value)}
    on:keyup={(e) => style.setLabelText(e.currentTarget.value)}
  />

  <select
    value={$style.label.location}
    on:change={(e) => style.setLabelLocation(e.currentTarget.value)}
  >
    {#each Object.values(LabelLocation) as orientation}
      <option>{orientation}</option>
    {/each}
  </select>

  <ColorPicker
    color={$style.color}
    {chartColors}
    on:change={(e) => updateColor(e.detail)}
  />

  <ColorPicker
    color={$style.label.color}
    {chartColors}
    on:change={(e) => updateLabelColor(e.detail)}
  />

  <input
    value={$style.width}
    on:change={(e) => style.setwidth(Number.parseInt(e.currentTarget.value))}
    on:keyup={(e) => style.setwidth(Number.parseInt(e.currentTarget.value))}
    type="number"
    style="width: 80px;"
  />

  {#if unspecifiecKeys != null}
    <button on:click={() => style.delete()}>Delete</button>
  {/if}
</div>

<style>
  .line-style-editor {
    display: block;
  }
</style>
