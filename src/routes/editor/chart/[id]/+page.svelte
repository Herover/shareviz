<script lang="ts">
  import { db, localPrefix } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import DataSetEditor from "$lib/components/chart/DataSetsEditor.svelte";
  import EditorCollapsible from "$lib/components/chart/EditorCollapsible.svelte";
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";
  import StyleEditor from "$lib/components/chart/Style/StyleEditor.svelte";
  import { computeData } from "$lib/data.js";
  import type { DSVParsedArray } from "d3-dsv";
  import type { EditorChartData, ViewerMessage } from "$lib/viewerData.js";

  let { data } = $props();

  let viewerFrame: HTMLIFrameElement | undefined = $state();

  let viewScale = $state(100);
  let height = $state(100);

  let visibleSection = $state(1);

  let disconnect: undefined | (() => void);

  $effect(() => {
    if ($db.doc != null) {
      viewerFrame?.contentWindow?.postMessage({
        type: "CHART_DATA",
        data: {
          chart: $db.doc,
        },
      } as EditorChartData);
    }
  });
  const onMessage = (event: MessageEvent<ViewerMessage>) => {
    if (event.data.type == "CHART_UPDATED") {
      height = event.data.data.height;
    } else if (event.data.type == "CHART_EDIT") {
      edit(event.data.data.edit);
    }
  };

  $effect(() => {
    if (viewerFrame && viewerFrame.contentWindow) {
      viewerFrame.contentWindow.addEventListener("message", onMessage, false);
    }
  });

  onMount(() => {
    disconnect = db.connect();
    db.load(data.id, data.id.includes(localPrefix) == false);
  });

  onDestroy(() => {
    if (disconnect) disconnect();
  });

  let chartSpec = $derived($db.doc as Root);

  let chartData = $derived(computeData(chartSpec) as { [key: string]: DSVParsedArray<any> });

  let canEdit = $derived(
    chartSpec == null
      ? false
      : $db.mode == "local" ||
          typeof chartSpec.meta.access.find((a) => a.userId == $page.data.session?.user?.id) !=
            "undefined",
  );

  let edit = $derived((e: { k: string; v: any }) => {
    switch (e.k) {
      case "title":
        db.chart().setConfigTitle(e.v);
        break;

      case "subTitle":
        db.chart().setConfigSubTitle(e.v);
        break;

      case "sourceLeft":
        db.chart().setSourceTextLeft(e.v);
        break;

      case "sourceRight":
        db.chart().setSourceTextRight(e.v);
        break;

      case "line": {
        const [i, a] = e.v;
        if (a == "style") {
          const [_1, _2, styleI, styleA, styleV] = e.v;
          if (styleA == "labelRelativePos") {
            db.chart().line(i).lineStyle(styleI).setLabelXOffset(styleV[0]);
            db.chart().line(i).lineStyle(styleI).setLabelYOffset(styleV[1]);
          }
        }
        break;
      }

      default:
        console.warn("attempting to edit unknown key", e.k);
        break;
    }
  });
</script>

<div class="main">
  {#if chartSpec != null}
    <header>
      <div class="parts-holder">
        <div class="parts-bottom">
          <div
            class:part-item-selected={visibleSection == 1}
            onclick={() => (visibleSection = 1)}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = 1)}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Data
          </div>
          <div
            class:part-item-selected={visibleSection == 2}
            onclick={() => (visibleSection = 2)}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = 2)}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Layout
          </div>
          <div
            class:part-item-selected={visibleSection == 3}
            onclick={() => (visibleSection = 3)}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = 3)}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Charts
          </div>
          <div
            class:part-item-selected={visibleSection == 4}
            onclick={() => (visibleSection = 4)}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = 4)}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Publish
          </div>
        </div>
      </div>
    </header>
    <div class="chart-controls-pane">
      <div class="chart-controls-primary chart-controls editor">
        <input
          value={$db?.chartInfo?.name}
          onchange={(e) => db.updateInfo({ name: e.currentTarget.value })}
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
          <EditorCollapsible group="controls" key="style" label="Style">
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
        <div><button onclick={() => (viewScale -= 10)}>-</button></div>
        <div><input value={viewScale} size="2" /></div>
        <div><button onclick={() => (viewScale += 10)}>+</button></div>
      </div>
      <div class="chart-view">
        <div style:scale={viewScale / 100}>
          <!--
            We could use the ChartViewer component directly, but to get a clean window that
            behaves like readers will see it (without our CSS and JS) in embeds, use a iframe.
          -->
          <iframe
            bind:this={viewerFrame}
            src={"/view/chart/" + data.id + "?editor"}
            width={chartSpec.chart.width}
            {height}
            title="Chart preview"
          >
            Viewer content...
          </iframe>
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
  {:else if $db.missing}
    <p>Could not find chart</p>
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

    --editor-header-height: 4em;
  }
  .chart-controls-pane {
    height: calc(100vh - var(--editor-header-height));
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
    height: calc(100vh - var(--editor-header-height));
    overflow-y: scroll;
    align-self: stretch;
    flex: 1 1 auto;
  }
  .chart-view {
    height: calc(100vh - var(--editor-header-height));
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
  iframe {
    border: none;
  }
  header {
    width: 100%;
    height: var(--editor-header-height);
    border-bottom: 1px solid black;
    background-color: white;
  }
  .parts-holder {
    position: relative;
    height: var(--editor-header-height);
  }
  .parts-bottom {
    display: flex;
    position: absolute;
    bottom: 0px;
  }
  .part-item {
    margin-left: 0.2em;
    margin-right: 0.2em;
    padding: 0.2em;
    border-left: 1px solid black;
    border-right: 1px solid black;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    z-index: 1;
    position: relative;
    top: 1px;
    font-size: 1.1em;
  }
  .part-item-selected {
    border-bottom: 1px solid white;
  }
</style>
