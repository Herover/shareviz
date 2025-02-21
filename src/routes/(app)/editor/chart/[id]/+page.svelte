<script lang="ts">
  import { db, localPrefix } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import DataSetEditor from "$lib/components/chart/DataSetsEditor.svelte";
  import { onDestroy, onMount } from "svelte";
  import StyleEditor from "$lib/components/chart/Style/StyleEditor.svelte";
  import { computeData } from "$lib/data.js";
  import type { DSVParsedArray } from "d3-dsv";
  import type { EditorChartData, EditorChartScreenshot, ViewerMessage } from "$lib/viewerData.js";
  import { ChartStore, ShareDBConnection } from "$lib/chartStores/chart.svelte.js";

  let { data } = $props();

  let viewerFrame: HTMLIFrameElement | undefined = $state();

  let viewScale = $state(100);
  let height = $state(100);

  type section = "data" | "layout" | "charts" | "publish";
  let visibleSection: section = $state("data");

  let disconnect: undefined | (() => void);

  let store = new ShareDBConnection();
  let chartStore = new ChartStore(store);

  $effect(() => console.log("STORE", store, $state.snapshot(store.data)));
  $effect(() => console.log("CHART STORE", chartStore, $state.snapshot(chartStore.data)));
  let x = $derived(chartStore.data);
  $inspect(x);

  const updateViewer = () => {
    viewerFrame?.contentWindow?.postMessage({
      type: "CHART_DATA",
      data: {
        chart: $db.doc,
      },
    } as EditorChartData);
  };

  $effect(() => {
    if (viewerFrame?.contentWindow != null) {
      // Make sure to send chart data the moment the viewer has loaded
      viewerFrame?.contentWindow?.addEventListener("load", updateViewer);

      // Viewer can sends events regarding chart height and editor events
      viewerFrame.contentWindow.addEventListener("message", onMessage, false);
    }
  });

  // Send chart data whenever it changes
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

  onMount(() => {
    disconnect = db.connect();
    db.load(data.id, data.id.includes(localPrefix) == false);

    store.connect();
    store.load(data.id, data.id.includes(localPrefix) == false);
  });

  onDestroy(() => {
    if (disconnect) disconnect();
    viewerFrame?.contentWindow?.removeEventListener("load", updateViewer);

    store.disconnect();
  });

  let chartSpec = $derived($db.doc as Root);

  let chartData = $derived(computeData(chartSpec) as { [key: string]: DSVParsedArray<any> });

  let canEdit = $derived(chartSpec != null);

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

  const chartToPNG = () => {
    viewerFrame?.contentWindow?.postMessage({
      type: "CHART_SCREENSHOT",
      data: {
        format: "png",
      },
    } as EditorChartScreenshot);
  };
</script>

<div class="main">
  {#if chartSpec != null}
    <header>
      <div class="parts-holder">
        <div class="parts-bottom">
          <div
            class:part-item-selected={visibleSection == "data"}
            onclick={() => (visibleSection = "data")}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = "data")}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Data
          </div>
          <div
            class:part-item-selected={visibleSection == "layout"}
            onclick={() => (visibleSection = "layout")}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = "layout")}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Layout
          </div>
          <div
            class:part-item-selected={visibleSection == "charts"}
            onclick={() => (visibleSection = "charts")}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = "charts")}
            class="part-item"
            role="button"
            tabindex="0"
          >
            Charts
          </div>
          <div
            class:part-item-selected={visibleSection == "publish"}
            onclick={() => (visibleSection = "publish")}
            onkeydown={(e) => (e.key == " " || e.key == "Enter") && (visibleSection = "publish")}
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
        {#if canEdit}
          {#if visibleSection == "data"}
            <div class="box">
              <div class="w-025 editor-explain-box p-top-1">
                <span class="editor-column-label">Internal chart name</span>
              </div>
              <div class="w-075 p-top-1">
                <input
                  value={$db?.chartInfo?.name}
                  onchange={(e) => db.updateInfo({ name: e.currentTarget.value })}
                  disabled={!canEdit || $db.chartInfo == null}
                />
              </div>
            </div>
            <DataSetEditor chartData={chartSpec.data} connection={store} />
          {:else if visibleSection == "layout"}
            <StyleEditor style={db.style()} chartScope={db.chart()} />
          {:else if visibleSection == "charts"}
            <ChartEditor spec={chartSpec} chartScope={db.chart()} {chartData} />
          {:else if visibleSection == "publish"}
            <a href="/view/chart/{data.id}">Embed link</a>
            <input
              value={window.location.protocol +
                "//" +
                window.location.host +
                "/view/chart/" +
                data.id}
            />
            <button onclick={() => chartToPNG()}>Generate PNG</button>
          {/if}
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
    background-color: var(--accent-bg-color);

    --editor-header-height: 4em;
    --editor-primary-controls-width: 500px;
  }
  .chart-controls-pane {
    width: fit-content;
  }

  .chart-controls {
    box-sizing: border-box;
    padding: 10px;
    z-index: 10;
  }
  .chart-controls-primary {
    width: var(--editor-primary-controls-width);
    padding-left: 50px;
    padding-right: 50px;
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
    position: sticky;
    top: var(--editor-header-height);
  }
  .chart-view {
    min-height: calc(100vh - var(--editor-header-height));
    display: flex;
    justify-content: center;
    align-items: start;
    align-items: safe center; /* Safari unsupported */
  }
  .view-controls {
    height: 2em;
    width: calc(100% - var(--editor-primary-controls-width));
    z-index: 10;
    position: absolute;
    top: 0px;
    right: 0px;
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
    border-bottom: 1px solid var(--text-primary);
    background-color: var(--main-bg-color);
    position: sticky;
    top: 0px;
  }
  .parts-holder {
    position: relative;
    height: var(--editor-header-height);
    padding-left: 50px;
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
    border-left: 1px solid var(--text-primary);
    border-right: 1px solid var(--text-primary);
    border-top: 1px solid var(--text-primary);
    border-bottom: 1px solid var(--text-primary);
    z-index: 1;
    position: relative;
    top: 0px;
    font-size: 1.1em;
    background-color: var(--accent-bg-color);
  }
  .part-item-selected {
    border-bottom: 1px solid var(--accent-bg-color);
  }
  input {
    width: 100%;
  }
</style>
