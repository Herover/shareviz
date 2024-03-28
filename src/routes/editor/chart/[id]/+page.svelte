<script lang="ts">
  import HBar from "$lib/components/chart/HBar.svelte";
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import { dsvFormat, type DSVParsedArray } from "d3-dsv";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";

  export let data;

  const disconnect = db.connect(data.id);

  $: chartSpec = $db.doc as Root;
  $: console.log(chartSpec, JSON.stringify(chartSpec));

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
</script>

<div class="main">
  {#if chartSpec != null}
    <div class="chart-controls-pane">
      <div class="chart-controls-primary chart-controls">
        <ChartEditor spec={chartSpec} chartScope={db.chart()} />
      </div>
    </div>

    <div class="chart-viewer">
      <ChartViewer {chartSpec} data={chartData} />
    </div>

    <div class="chart-controls-pane">
      <div class="chart-controls-secondary chart-controls">
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
      </div>
    </div>
  {:else}
    <p>Loading, hopefully...</p>
  {/if}
</div>

<style>
  .main {
    display: flex;
    /* justify-content: space-between; */
  }
  .chart-controls-pane {
    /* width: 100%; */
    /* flex-basis: 400px; */
    flex-grow: 0;
    height: 100vh;
  }

  .chart-controls {
    background-color: white;
    position: fixed;
    box-sizing: border-box;
    padding: 10px;
    z-index: 10;
    height: 100%;
    overflow-y: scroll;
  }
  .chart-controls-primary {
    width: 400px;
    border-right: 1px solid black;
  }
  .chart-controls-secondary {
    right: 0px;
    width: 400px;
    border-left: 1px solid black;
  }

  .chart-viewer {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #eeeeee;
  }
</style>
