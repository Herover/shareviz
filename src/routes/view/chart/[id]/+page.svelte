<script lang="ts">
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import { dsvFormat } from "d3-dsv";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";

  export let data;

  const disconnect = db.connect(data.id);

  $: chartSpec = $db.doc as Root;
  $: console.log(chartSpec, JSON.stringify(chartSpec));

  $: chartData =
    chartSpec == null
      ? []
      : dsvFormat("\t").parse(chartSpec.data.raw, (row) => {
          return chartSpec.data.rows.reduce((acc: any, rowInfo: any) => {
            if (rowInfo.type == "number") {
              acc[rowInfo.key] = Number.parseFloat(row[rowInfo.key]);
            } else if (rowInfo.type == "text") {
              acc[rowInfo.key] = row[rowInfo.key];
            }

            return acc;
          }, {} as any);
        });
</script>

{#if chartSpec && chartData}
  <div class="main">
    <ChartViewer {chartSpec} data={chartData} />
  </div>
{/if}

<style>
  .main {
    width: fit-content;
    margin: auto;
  }
</style>
