<script lang="ts">
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import { dsvFormat, type DSVParsedArray } from "d3-dsv";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import { onDestroy } from "svelte";

  export let data;

  let chartSpec: Root | undefined;

  const live = false;

  if (live) {
    const disconnect = db.connect();
    db.load(data.id);

    onDestroy(() => {
      disconnect();
    });
  }

  $: if (live && $db.doc) chartSpec = $db.doc as Root;
  $: if (!live) {
    fetch("/api/chart/" + data.id)
      .then((resp) => resp.json())
      .then((data) => chartSpec = data.chart)
      .catch((err) => console.error(err));
  }

  $: chartData =
    chartSpec == null
      ? {}
      : chartSpec.data.sets.reduce(
          (acc, data) => {
            acc[data.id] = dsvFormat("\t").parse<any, string>(
              data.raw,
              (row) => {
                return data.rows.reduce((acc: any, rowInfo: any) => {
                  if (rowInfo.type == "number") {
                    acc[rowInfo.key] = Number.parseFloat(row[rowInfo.key]);
                  } else if (rowInfo.type == "text") {
                    acc[rowInfo.key] = row[rowInfo.key];
                  }

                  return acc;
                }, {} as any);
              },
            );
            return acc;
          },
          {} as { [key: string]: DSVParsedArray<any> },
        );

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
