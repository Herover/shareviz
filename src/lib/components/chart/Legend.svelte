<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import chroma from "chroma-js";

  let {
    keys,
  }: {
    keys: { color: string; legend: string }[];
  } = $props();
</script>

<p>
  {#each keys as d}
    {#if d.legend != ""}
      <span class="legend-title"
        ><span style="background-color:{chroma(d.color).hex()}" class="legend-box"></span>
        {d.legend}</span
      >
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
