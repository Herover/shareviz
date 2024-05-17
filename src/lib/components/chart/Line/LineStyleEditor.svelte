<script lang="ts">
  import { LabelLocation, type LineStyleKey } from "$lib/chart";
  import { lineStyle } from "$lib/chartStore";

  export let style: ReturnType<typeof lineStyle>;
  export let unspecifiecKeys: string[] = [];

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
  {#if unspecifiecKeys.length != 0}
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

  <input
    value={$style.color}
    on:change={(e) => updateColor(e.currentTarget.value)}
    on:keyup={(e) => updateColor(e.currentTarget.value)}
    style="width: 80px;"
  />

  <input
    value={$style.label.color}
    on:change={(e) => updateLabelColor(e.currentTarget.value)}
    on:keyup={(e) => updateLabelColor(e.currentTarget.value)}
    style="width: 80px;"
  />

  <input
    value={$style.width}
    on:change={(e) => style.setwidth(Number.parseInt(e.currentTarget.value))}
    on:keyup={(e) => style.setwidth(Number.parseInt(e.currentTarget.value))}
    type="number"
    style="width: 80px;"
  />

  {#if unspecifiecKeys.length != 0}
    <button on:click={() => style.delete()}>Delete</button>
  {/if}
</div>

<style>
  .line-style-editor {
    display: block;
  }
</style>
