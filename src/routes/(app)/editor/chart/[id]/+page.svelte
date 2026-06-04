<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { db, localPrefix } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";
  import DataSetEditor from "$lib/components/chart/DataSetsEditor.svelte";
  import PublishTab from "$lib/components/chart/PublishTab.svelte";
  import { onDestroy, onMount } from "svelte";
  import StyleEditor from "$lib/components/chart/Style/StyleEditor.svelte";
  import { computeData } from "$lib/data.js";
  import type {
    EditorChartData,
    EditorChartHighlight,
    EditorChartScreenshot,
    ViewerMessage,
  } from "$lib/viewerData.js";
  import { ShareDBConnection } from "$lib/chartStores/data.svelte.js";
  import { ChartStore } from "$lib/chartStores/chart.svelte.js";
  import { env } from "$env/dynamic/public";
  import { LineStore } from "$lib/chartStores/line.svelte.js";
  import { chartToEditor } from "$lib/chartToEditorStore.svelte.js";
  import { addPublication, getChartPublications } from "$lib/api.js";
  import { resolve } from "$app/paths";
  import { notifications } from "$lib/notificationStore.js";
  import { goto } from "$app/navigation";
  import type { PageProps, PageServerData } from "./$types";
  import { getLogger } from "$lib/log.js";
  import { scale } from "svelte/transition";

  /* eslint-disable svelte/no-navigation-without-resolve */

  const logger = getLogger();

  let { data }: PageProps & { data: PageServerData } = $props();

  let viewerFrame: HTMLIFrameElement | undefined = $state();

  let viewScale = $state(100);
  let height = $state(100);
  let imageScale = $state(2);
  let publications: {
    charts: {
      id: string;
      name: string;
      chartRef: string;
      teamId: string | null;
      created: number;
      updated: number;
      archived: number | null;
      folderId: string | null;
    };
    chartPublication: {
      id: string;
      chartId: string;
      v: number;
      created: number;
    };
  }[] = $state([]);

  type section = "data" | "layout" | "charts" | "publish";
  let visibleSection: section = $state("data");

  let disconnect: undefined | (() => void);

  let store = new ShareDBConnection();
  let chartStore: ChartStore | undefined = $state();

  const updateViewer = (data?: Root) => {
    viewerFrame?.contentWindow?.window.postMessage(
      {
        type: "CHART_DATA",
        data: {
          chart: data || $db.doc,
        },
      } as EditorChartData,
      env.PUBLIC_VIEWER_ORIGIN,
    );
  };

  const onData = (e: CustomEvent) => {
    updateViewer(JSON.parse(JSON.stringify(e.detail.doc)));
  };
  const onError = (e: CustomEvent) => {
    if (e.detail.error.message == "unauthorized" && !data.signedIn) {
      goto(resolve("/", {}) + "?return_url=" + encodeURI(data.url));
    } else {
      notifications.addError(e.detail.error.message);
    }
  };
  store.on("data", onData);
  store.on("error", onError);

  $effect(() => {
    if (viewerFrame?.contentWindow != null) {
      // Make sure to send chart data the moment the viewer has loaded
      viewerFrame?.addEventListener("load", () => updateViewer());

      // Viewer can sends events regarding chart height and editor events
      window.addEventListener("message", onMessage);
    }
  });

  const onMessage = (event: MessageEvent<ViewerMessage>) => {
    if (event.origin != env.PUBLIC_VIEWER_ORIGIN) {
      return;
    }
    if (event.data.type == "CHART_UPDATED") {
      height = event.data.data.height;
    } else if (event.data.type == "READY") {
      updateViewer();
    } else if (event.data.type == "CHART_EDIT") {
      edit(event.data.data.edit);
    }
  };

  onMount(() => {
    disconnect = db.connect();
    db.load(data.id, data.id.includes(localPrefix) == false);

    store.connect();
    store.load(data.id, data.id.includes(localPrefix) == false);
    chartStore = new ChartStore(store);
  });

  onDestroy(() => {
    if (disconnect) disconnect();
    viewerFrame?.contentWindow?.removeEventListener("load", () => updateViewer());

    store.off("data", onData);
    store.disconnect();
  });

  let chartSpec = $derived($db.doc as Root);

  let chartData = $derived(computeData(chartSpec));

  let canEdit = $derived(chartSpec != null);

  let edit = $derived((e: { k: string; v: any }) => {
    if (!chartStore) return;
    switch (e.k) {
      case "sourceLeft":
        chartStore.setSourceTextLeft(e.v);
        break;

      case "sourceRight":
        chartStore.setSourceTextRight(e.v);
        break;

      case "line": {
        const [i, a] = e.v;
        if (a == "style") {
          const [_1, _2, styleI, styleA, styleV] = e.v;
          if (styleA == "labelRelativePos" && chartStore.data?.elements[i]) {
            const lineStore = new LineStore(store, chartStore.data.elements[i].id);
            lineStore.lineStyle(styleI).setLabelXOffset(styleV[0]);
            lineStore.lineStyle(styleI).setLabelYOffset(styleV[1]);
          }
        }
        break;
      }

      default:
        logger.log("attempting to edit unknown key " + e.k);
        break;
    }
  });

  const chartToPNG = () => {
    const data: EditorChartScreenshot = {
      type: "CHART_SCREENSHOT",
      data: {
        format: "png",
        zoom: imageScale,
        name: $db?.chartInfo?.name,
      },
    };
    viewerFrame?.contentWindow?.window.postMessage(data, env.PUBLIC_VIEWER_ORIGIN);
  };

  const updatePublications = async (id: string) => {
    publications = (await getChartPublications(id)).publications.sort(
      (a, b) => b.chartPublication.v - a.chartPublication.v,
    );
  };
  $effect(() => {
    if (!store.chartInfo) {
      return;
    }
    updatePublications(store.chartInfo.id);
  });

  let publisize = () => {};
  $effect(() => {
    publisize = async () => {
      if (!store.chartInfo) {
        return;
      }
      await addPublication(store.chartInfo.id, store.version);
      await updatePublications(store.chartInfo.id);
    };
  });

  $effect(() => {
    const data: EditorChartHighlight = {
      type: "CHART_HIGHLIGHT",
      data: {
        target: [...chartToEditor.highlight],
      },
    };
    viewerFrame?.contentWindow?.window.postMessage(data, env.PUBLIC_VIEWER_ORIGIN);
  });
</script>

<div class="main">
  {#if chartSpec != null}
    <header>
      <h1>
        <a
          href={data.chartRelations
            ? resolve("/(app)/org/[organizationId]/team/[teamId]/charts", {
                organizationId: data.chartRelations?.teams.organizationId,
                teamId: data.chartRelations?.teams.id,
              })
            : "/"}
        >
          DT
        </a>
      </h1>
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

      <div class="presence">
        {#each Object.keys(store.presences) as presence (presence)}
          <div
            style:border="2px solid {store.presences[presence].color}"
            transition:scale
            class="user-presence"
            title={store.presences[presence].name}
          >
            {store.presences[presence].name.slice(0, 1)}
          </div>
        {/each}
      </div>
    </header>
    <div class="chart-controls-pane">
      <div class="chart-controls-primary chart-controls editor">
        {#if canEdit && store.data}
          {#if visibleSection == "data"}
            <div class="editor-row">
              <div class="editor-column-label">
                <label for="editor-chart-name">Internal chart name</label>
              </div>
              <div>
                <input
                  id="editor-chart-name"
                  value={$db?.chartInfo?.name}
                  onchange={(e) => db.updateInfo({ name: e.currentTarget.value })}
                  disabled={!canEdit || $db.chartInfo == null}
                  type="text"
                />
              </div>
            </div>

            <DataSetEditor chartData={chartSpec.data} connection={store} />
          {:else if visibleSection == "layout"}
            <StyleEditor connection={store} />
          {:else if visibleSection == "charts"}
            <ChartEditor spec={chartSpec} {chartData} connection={store} />
          {:else if visibleSection == "publish"}
            <PublishTab
              {publications}
              version={chartStore?.version}
              viewerOrigin={env.PUBLIC_VIEWER_ORIGIN}
              {chartSpec}
              bind:imageScale
              onPublish={() => publisize()}
              onGeneratePng={() => chartToPNG()}
            />
          {/if}
        {:else}
          <p>You do not have editor access to this chart.</p>
        {/if}
      </div>
    </div>

    <div class="chart-viewer">
      <div class="view-controls">
        <div><label for="view-zoom">Zoom</label></div>
        <div><button onclick={() => (viewScale -= 10)}>-</button></div>
        <div><input id="view-zoom" type="number" value={viewScale} min="10" /></div>
        <div><button onclick={() => (viewScale += 10)}>+</button></div>
      </div>
      <div class="chart-view">
        <div class="chart-view-holder" style:scale={viewScale / 100}>
          <!--
            We could use the ChartViewer component directly, but to get a clean window that
            behaves like readers will see it (without our CSS and JS) in embeds, use a iframe.
          -->
          <iframe
            bind:this={viewerFrame}
            src={env.PUBLIC_VIEWER_ORIGIN + "/view/chart/?editor"}
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
    background-color: var(--bg-base);

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
  .chart-view-holder {
    box-shadow: var(--shadow-3);
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
    display: block;
  }
  header {
    width: 100%;
    height: var(--editor-header-height);
    border-bottom: 1px solid var(--border-default);
    background-color: var(--bg-surface);
    position: sticky;
    top: 0px;
    z-index: 10;
    display: flex;
    justify-content: stretch;
    padding-left: 50px;
  }
  header a,
  header a:visited {
    color: var(--fg-primary);
    text-decoration: none;
  }
  .parts-holder {
    position: relative;
    height: var(--editor-header-height);
    padding-left: 50px;
    flex: 1;
  }
  .parts-bottom {
    display: flex;
    position: absolute;
    bottom: 0px;
  }
  .part-item {
    margin-left: 0.2em;
    margin-right: 0.2em;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-left: 1px solid var(--border-default);
    border-right: 1px solid var(--border-default);
    border-top: 1px solid var(--border-default);
    border-bottom: 1px solid var(--border-default);
    z-index: 1;
    position: relative;
    top: 0px;
    background-color: var(--bg-base);
    color: var(--fg-secondary);
  }
  .part-item-selected {
    border-bottom: 1px solid var(--bg-base);
  }
  .presence {
    position: relative;
    height: var(--editor-header-height);
    padding-right: 50px;
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .user-presence {
    color: var(--fg-primary);
    background-color: var(--bg-base);
    border-radius: 50%;
    height: 2em;
    width: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.2em;
  }
  input[type="text"] {
    width: 100%;
  }
  /* Hide buttons */
  input#view-zoom[type="number"] {
    appearance: textfield;
    width: 5em;
    text-align: center;
  }
</style>
