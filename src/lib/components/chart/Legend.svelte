<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  let {
    keys,
    indicator,
  }: {
    keys: { color: string; legend: string }[];
    indicator?: (d: any) => ReturnType<import("svelte").Snippet>;
  } = $props();
</script>

<p>
  {#each keys as d, i (i)}
    {#if d.legend != ""}
      <span class="legend-title">
        {#if indicator}
          {@render indicator(d)}
        {:else}
          <span style="background-color:{d.color}" class="legend-box"></span>
        {/if}
        {d.legend}
      </span>
    {/if}
  {/each}
</p>

<style>
  .legend-box {
    display: inline-block;
    width: 1em;
    height: 1em;
    position: relative;
    top: 0.1em;
    margin-right: 0.2em;
  }
  .legend-title {
    display: inline-block;
    margin-right: 0.5em;
  }
</style>
