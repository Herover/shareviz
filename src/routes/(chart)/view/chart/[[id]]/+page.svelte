<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { localPrefix } from "$lib/chartStore";
  import type { Root } from "$lib/chart.d.ts";
  import ChartViewer from "$lib/components/chart/ChartViewer.svelte";
  import { onDestroy, onMount, tick } from "svelte";
  import { computeData } from "$lib/data.js";

  import { env } from "$env/dynamic/public";
  import type {
    EditorMessage,
    ViewerChartEdit,
    ViewerChartUpdated,
    ViewerReady,
  } from "$lib/viewerData.js";
  import html2canvas from "html2canvas";
  import { fontStore, type FONTS } from "$lib/fontStore.svelte.js";

  let { data } = $props();

  let chartSpec: Root | undefined = $state();
  let chartData = $derived(computeData(chartSpec));

  let height = $state(0);
  let width = $state(0);
  let zoomLevel = $state(1);
  let mainView: HTMLDivElement | undefined = $state();

  const onMessage = async (event: MessageEvent<EditorMessage>) => {
    // For now only allow rendering data from our own server
    if (event.origin !== env.PUBLIC_ORIGIN) return;

    if (event.data.type == "CHART_DATA") {
      chartSpec = event.data.data.chart;
    }

    if (event.data.type == "CHART_SCREENSHOT") {
      try {
        if (typeof mainView == "undefined") {
          return;
        }

        // Load fonts
        const fontMap: FONTS = {};
        for (let s = 0; s < document.styleSheets.length; s++) {
          const sheet = document.styleSheets[s];
          for (let r = 0; r < sheet.cssRules.length; r++) {
            const rule = sheet.cssRules[r];
            if (rule instanceof CSSFontFaceRule) {
              const family = rule.style.getPropertyValue("font-family");
              const src = rule.style.getPropertyValue("src");

              const srcs = src.split(/,\s*/g);
              for (let sr = 0; sr < srcs.length; sr++) {
                const source = srcs[sr];
                if (source.startsWith("url(")) {
                  const url = source.match(/url\((?:"|')((\w|\d|\/|\.|-)*)(?:"|')\)/);
                  const format = source.match(/format\((?:"|')((\w|\d|\/|\.|-)*)(?:"|')\)/);
                  if (url && url.length > 2 && format && format.length > 2) {
                    fontMap[family] = {
                      url: url[1],
                      format: format[1],
                    };
                    break;
                  }
                }
              }
            }
          }
        }

        const blobToBase64 = (blob: Blob): Promise<string> => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return new Promise((resolve) => {
            reader.onloadend = () => {
              resolve(reader.result?.toString() ?? "");
            };
          });
        };
        await Promise.all(
          Object.keys(fontMap).map(
            (k) =>
              new Promise<void>((resolve, reject) => {
                fetch(fontMap[k].url)
                  .then((res) => res.blob())
                  .then(blobToBase64)
                  .then((str) => (fontMap[k].url = str))
                  .then(() => resolve())
                  .catch((e) => reject(e));
              }),
          ),
        );

        fontStore.setFontMap(fontMap);

        await tick();

        const view = mainView;
        const canvas = await html2canvas(view, {
          scale: event.data.data.zoom,
        });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download =
          (event.data.data.name || chartSpec?.chart.title || data.id || "chart") + ".png";
        link.click();
      } catch (err) {
        console.error("Error: " + err);
      }
    }
  };

  window.addEventListener("message", onMessage, false);
  onDestroy(() => {
    window.removeEventListener("message", onMessage, false);
  });
  $effect(() => {
    window.parent.postMessage(
      {
        type: "CHART_UPDATED",
        data: {
          height: height,
        },
      } as ViewerChartUpdated,
      env.PUBLIC_ORIGIN,
    );
  });
  const onEdit = (d: { k: string; v: any }) => {
    window.parent.postMessage(
      {
        type: "CHART_EDIT",
        data: {
          edit: d,
        },
      } as ViewerChartEdit,
      env.PUBLIC_ORIGIN,
    );
  };

  onMount(() => {
    window.parent.postMessage(
      {
        type: "READY",
      } as ViewerReady,
      env.PUBLIC_ORIGIN,
    );
  });

  $effect(() => {
    if (data.id && !data.id.startsWith(localPrefix) && !data.editor) {
      fetch("/api/chart/" + data.id + "/data")
        .then((resp) => resp.json())
        .then((data) => (chartSpec = data.chart))
        .catch((err) => console.error(err));
    }
  });
</script>

{#if chartSpec && chartData}
  <div
    class="main"
    bind:clientWidth={width}
    bind:clientHeight={height}
    bind:this={mainView}
    style:scale={zoomLevel}
  >
    <ChartViewer {chartSpec} data={chartData} {width} editor={data.editor} onedit={onEdit} />
  </div>
{/if}

<style>
  .main {
    width: 100%;
  }
</style>
