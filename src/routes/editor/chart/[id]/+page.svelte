<script lang="ts">
  import HBar from "$lib/components/chart/HBar/HBar.svelte";
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import { dsvFormat, type DSVParsedArray } from "d3-dsv";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import DataSetEditor from "$lib/components/chart/DataSetsEditor.svelte";

  export let data;

  let viewScale = 100;

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
        <br />
        <DataSetEditor chartData={chartSpec.data} store={db} />
      </div>
    </div>

    <div class="chart-viewer">
      <div class="view-controls">
        <div>Zoom</div>
        <div><button on:click={() => (viewScale -= 10)}>-</button></div>
        <div><input value={viewScale} size="2" /></div>
        <div><button on:click={() => (viewScale += 10)}>+</button></div>
      </div>
      <div class="chart-view">
        <div style:scale={viewScale / 100}>
          <ChartViewer {chartSpec} data={chartData} />
        </div>
      </div>
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
    flex-direction: row;
    align-content: space-between;
    flex-wrap: wrap;
    background-color: #eeeeee;
  }
  .chart-controls-pane {
    height: 100vh;
    width: fit-content;
  }

  .chart-controls {
    box-sizing: border-box;
    padding: 10px;
    z-index: 10;
    height: 100%;
    overflow-y: scroll;
  }
  .chart-controls-primary {
    width: 400px;
    border-right: 1px solid black;
    background-color: white;
  }
  .chart-controls-secondary {
    right: 0px;
    position: fixed;
    width: 400px;
    display: none;
    border-left: 1px solid black;
  }

  .chart-viewer {
    height: 100vh;
    overflow-y: scroll;
    align-self: stretch;
    flex: 1 1 auto;
  }
  .chart-view {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: start;
    align-items: safe center; /* Safari unsupported */
  }
  .view-controls {
    height: 2em;
    width: calc(100% - 400px);
    z-index: 10;
    position: absolute;
    top: 0px;
    display: flex;
    flex-direction: row;
    justify-content: right;
    /* gap: 0.5em; */
    align-items: center;
  }
  .view-controls div {
    margin: 0.25em;
  }
</style>