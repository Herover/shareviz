<script lang="ts">
  import { db, localPrefix } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import DataSetEditor from "$lib/components/chart/DataSetsEditor.svelte";
  import EditorCollapsible from "$lib/components/chart/EditorCollapsible.svelte";
  import { onDestroy, onMount } from "svelte";
  import { user } from "$lib/userStore";
  import StyleEditor from "$lib/components/chart/Style/StyleEditor.svelte";
  import { computeData } from "$lib/data.js";

  export let data;

  let viewScale = 100;

  let disconnect: undefined | (() => void);

  onMount(() => {
    disconnect = db.connect();
    db.load(data.id, !data.id.includes(localPrefix));
  });

  onDestroy(() => {
    if (disconnect) disconnect();
  });

  $: chartSpec = $db.doc as Root;

  $: chartData = computeData(chartSpec);
    
  $: canEdit = chartSpec == null ? false : $db.mode == "local" || typeof chartSpec.meta.access.find(a => a.userId == $user.userId) != "undefined";

  $: edit = (e: CustomEvent<{ k: string, v: any}>) => {
    switch (e.detail.k) {
      case "title":
        db.chart().setConfigTitle(e.detail.v);
        break;
    
      case "subTitle":
        db.chart().setConfigSubTitle(e.detail.v);
        break;
    
      case "sourceLeft":
        db.chart().setSourceTextLeft(e.detail.v);
        break;
    
      case "sourceRight":
        db.chart().setSourceTextRight(e.detail.v);
        break;
      
      case "line": {
        const [i, a] = e.detail.v;
        if (a == "style") {
          const [_1, _2, styleI, styleA, styleV] = e.detail.v;
          if (styleA == "labelRelativePos") {
            db.chart().line(i).lineStyle(styleI).setLabelXOffset(styleV[0]);
            db.chart().line(i).lineStyle(styleI).setLabelYOffset(styleV[1]);
          }
        }
        break;
      }
    
      default:
        console.warn("attempting to edit unknown key", e.detail.k);
        break;
    }
  };
</script>

<div class="main">
  {#if chartSpec != null}
    <div class="chart-controls-pane">
      <div class="chart-controls-primary chart-controls">
        <input
          value={$db?.chartInfo?.name}
          on:change={e => db.updateInfo({ name: e.currentTarget.value })}
          disabled={!canEdit || $db.chartInfo == null}
        />
        {#if canEdit}
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
          key="style"
          label="Style"
        >
          <StyleEditor style={db.style()} />
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
        {:else}
          <p>You do not have editor access to this chart.</p>
        {/if}
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
          <ChartViewer {chartSpec} data={chartData} editor={true} on:edit={e => edit(e)} />
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
