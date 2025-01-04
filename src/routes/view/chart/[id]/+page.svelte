<script lang="ts">
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import { onDestroy } from "svelte";
  import { computeData } from "$lib/data.js";

  import { env } from "$env/dynamic/public";
  import type { EditorMessage, ViewerChartEdit, ViewerChartUpdated } from "$lib/viewerData.js";

  let { data } = $props();

  let chartSpec: Root | undefined = $state();
  let chartData = $derived(computeData(chartSpec));

  let height = $state(0);
  let width = $state(0);

  const onMessage = (event: MessageEvent<EditorMessage>) => {
    // For now only allow rendering data from our own server
    if (event.origin !== env.PUBLIC_ORIGIN) return;

    if (event.data.type == "CHART_DATA") {
      chartSpec = event.data.data.chart;
    }
  };

  window.addEventListener("message", onMessage, false);
  onDestroy(() => {
    window.removeEventListener("message", onMessage, false);
  });
  $effect(() => {
    window.postMessage({
      type: "CHART_UPDATED",
      data: {
        height: height,
      },
    } as ViewerChartUpdated);
  });
  const onEdit = (d: { k: string; v: any }) => {
    window.postMessage({
      type: "CHART_EDIT",
      data: {
        edit: d,
      },
    } as ViewerChartEdit);
  };

  $effect(() => {
    if ($db.doc) chartSpec = $db.doc as Root;
  });
  $effect(() => {
    fetch("/api/chart/" + data.id + "/data")
      .then((resp) => resp.json())
      .then((data) => (chartSpec = data.chart))
      .catch((err) => console.error(err));
  });
</script>

{#if chartSpec && chartData}
  <div class="main" bind:clientWidth={width} bind:clientHeight={height}>
    <ChartViewer {chartSpec} data={chartData} {width} editor={data.editor} onedit={onEdit} />
  </div>
{/if}

<style>
  .main {
    width: 100%;
  }
</style>
