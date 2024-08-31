<script lang="ts">
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import { onDestroy } from "svelte";
  import { computeData } from "$lib/data.js";

  export let data;

  let chartSpec: Root | undefined;

  const live = false;

  if (live) {
    const disconnect = db.connect();
    db.load(data.id, true);

    onDestroy(() => {
      disconnect();
    });
  }

  $: if (live && $db.doc) chartSpec = $db.doc as Root;
  $: if (!live) {
    fetch("/api/chart/" + data.id + "/data")
      .then((resp) => resp.json())
      .then((data) => chartSpec = data.chart)
      .catch((err) => console.error(err));
  }

  $: chartData = computeData(chartSpec);

  let width = 0;
</script>

{#if chartSpec && chartData}
  <div class="main" bind:clientWidth={width}>
    <ChartViewer {chartSpec} data={chartData} {width} editor={false} />
  </div>
{/if}

<style>
  .main {
    width: 100%;
  }
</style>
