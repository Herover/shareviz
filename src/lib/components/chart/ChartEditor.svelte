<script lang="ts">
  import type { Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import HBarEditor from "./HBarEditor.svelte";

  export let chartScope: ReturnType<typeof db.chart>;
  export let spec: Root;
</script>

<p>
  Title: <input
    value={spec.chart.title}
    on:keyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
  />
</p>
<p>
  Sub title: <input
    value={spec.chart.subTitle}
    on:keyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
  />
</p>
<p>
  Source text (left): <input
    value={spec.chart.sourceTextLeft}
    on:keyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
  />
</p>
<p>
  Source link (left): <input
    value={spec.chart.sourceTextLeftLink}
    on:keyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
  />
</p>
<p>
  Source text (right): <input
    value={spec.chart.sourceTextRight}
    on:keyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
  />
</p>
<p>
  Source link (right): <input
    value={spec.chart.sourceTextRightLink}
    on:keyup={(e) => chartScope.setSourceTextLeftRight(e.currentTarget.value)}
  />
</p>
<p>
  Height: <input
    value={spec.chart.height}
    on:keyup={(e) => chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
    on:change={(e) => chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
    type="number"
  />
</p>
<p>
  Width: <input
    value={spec.chart.width}
    on:keyup={(e) => chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
    on:change={(e) => chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
    type="number"
  />
</p>

{#if spec.chart.chartType == "hBar"}
  <HBarEditor spec={spec} dbHBar={chartScope.hBar()}/>
{/if}

<style>
  input {
    width: 100%;
    box-sizing: border-box;
  }
  /* p {
    margin-top: 1em;
  } */
</style>