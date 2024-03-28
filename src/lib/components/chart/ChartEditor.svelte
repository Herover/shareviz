<script lang="ts">
  import type { Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import HBarEditor from "./HBarEditor.svelte";

  export let chartScope: ReturnType<typeof db.chart>;
  export let spec: Root;

  $: hBarDataSet = spec.data.sets.find(
    (set) => (set.id = spec.chart.hBar.dataSet),
  );
</script>

<p>
  <label>
    Title: <input
      value={spec.chart.title}
      on:keyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Sub title: <input
      value={spec.chart.subTitle}
      on:keyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source text (left): <input
      value={spec.chart.sourceTextLeft}
      on:keyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source link (left): <input
      value={spec.chart.sourceTextLeftLink}
      on:keyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source text (right): <input
      value={spec.chart.sourceTextRight}
      on:keyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source link (right): <input
      value={spec.chart.sourceTextRightLink}
      on:keyup={(e) => chartScope.setSourceTextLeftRight(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Height: <input
      value={spec.chart.height}
      on:keyup={(e) =>
        chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      type="number"
    />
  </label>
</p>
<p>
  <label>
    Width: <input
      value={spec.chart.width}
      on:keyup={(e) =>
        chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
    />
  </label>
</p>

{#if spec.chart.chartType == "hBar"}
  <HBarEditor
    {spec}
    dbHBar={chartScope.hBar()}
    chart={chartScope}
    dataSet={hBarDataSet}
  />
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
