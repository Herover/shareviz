<script lang="ts">
  import HBar from "$lib/components/chart/HBar/HBar.svelte";
  import { db } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import { dsvFormat, type DSVParsedArray } from "d3-dsv";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import DataSetEditor from "$lib/components/chart/DataSetsEditor.svelte";
  import EditorCollapsible from "$lib/components/chart/EditorCollapsible.svelte";
  import { onDestroy } from "svelte";
  import { valueParsers } from "$lib/utils.js";

  export let data;

  let viewScale = 100;

  const disconnect = db.connect();
  db.load(data.id);

  onDestroy(() => {
    disconnect();
  });

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
                return data.rows.reduce((acc: any, rowInfo) => {
                  const parser = valueParsers[rowInfo.type];
                  if (!parser) {
                    // TODO: better warning?
                    console.warn("could not find parser", rowInfo.key);
                    acc[rowInfo.key] = row[rowInfo.key];
                    return acc;
                  }
                  acc[rowInfo.key] = parser.fn(row[rowInfo.key]);

                  return acc;
                }, {} as any);
              },
            );
            return acc;
          },
          {} as { [key: string]: DSVParsedArray<any> },
        );
  let chart = db.chart();
</script>

<div class="main">
  {#if chartSpec != null}
    <div class="chart-controls-pane">
      <div class="chart-controls-primary chart-controls">
        <EditorCollapsible
          group="controls"
          key="data"
          label="Data sets"
          startOpen={chartSpec.data.sets.length == 0}
        >
          <DataSetEditor chartData={chartSpec.data} store={db} />
        </EditorCollapsible>
        <EditorCollapsible
          group="controls"
          key="main"
          label="Chart settings"
          startOpen={chartSpec.data.sets.length != 0}
        >
          <ChartEditor spec={chartSpec} chartScope={db.chart()} {chartData} />
        </EditorCollapsible>
        <EditorCollapsible group="controls" key="main" label="Export">
          <a href="/view/chart/{data.id}">Embed link</a>
          <input
            value={window.location.protocol +
              "//" +
              window.location.host +
              "/view/chart/" +
              data.id}
          />
        </EditorCollapsible>
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
    {#if $db.missing}
      <p>Could not find chart</p>
    {:else}
      <p>Loading, hopefully...</p>
    {/if}
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
