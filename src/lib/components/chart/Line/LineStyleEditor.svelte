<script lang="ts">
  import { LabelLocation } from "$lib/chart";
  import { lineStyle } from "$lib/chartStore";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import { formatData } from "./data";
  import { db } from "$lib/chartStore";

  export let style: ReturnType<typeof lineStyle>;
  export let unspecifiecKeys: null | string[] = null;
  export let chartColors: string[];
  export let values: ReturnType<typeof formatData>;
  export let lineSpec: ReturnType<ReturnType<typeof db.chart>["line"]>;

  $: type = typeof values[0]?.value[0]?.x == "number" ? "number" : "date";
  $: updateColor = (color: string) => {
    if ($style.label.color == $style.color) {
      style.setLabelColor(color);
    }
    style.setColor(color);
  };
  $: updateLabelColor = (color: string) => {
    style.setLabelColor(color);
  };
  $: setLabelX = (value: string) => {
    const parsed = type == "number" ? Number.parseInt(value) : new Date(value).getTime();
    const proposed = values
      .find((e) => e.key == $style.k)
      ?.value.map(d => ({ d: Math.abs(parsed - d.x), x: d.x, y: d.y}))
      .sort((a, b) => a.d - b.d)[0] || { x: 0, y: 0 }
    const proposedY = values
      .find((e) => e.key == $style.k)
      ?.value.find((d) => d.x == proposed.x);
    if (typeof proposedY != "undefined") {
      style.setLabelY(proposed.y);
    }
    style.setLabelX(proposed.x instanceof Date ? proposed.x.getTime() : proposed.x);
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

  {#if unspecifiecKeys != null && $style.label.location == LabelLocation.Float}
    <input
      value={type == "number" ? $style.label.x : new Date($style.label.x).toISOString().split("T")[0]}
      on:change={(e) => setLabelX(e.currentTarget.value)}
      on:keyup={(e) => setLabelX(e.currentTarget.value)}
      type={type}
      style="width: 104px;"
    />
  {/if}

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
