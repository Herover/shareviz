<!-- SPDX-License-Identifier: MPL-2.0 -->
<script lang="ts">
  import { env } from "$env/dynamic/public";
  import type { Root } from "$lib/chart";
  import type { File } from "./types";
  import type { EditorChartData, ViewerMessage } from "$lib/viewerData";
  import { onDestroy } from "svelte";

  interface Props {
    item: File;
  }

  let { item }: Props = $props();

  const ZOOM = 1.5;

  let viewerFrame: HTMLIFrameElement | undefined = $state();
  let holderWidth: number = $state(100);

  let data: Root | "pending" | undefined;

  const updateViewer = () => {
    if (!data || data == "pending") {
      return;
    }

    viewerFrame?.contentWindow?.window.postMessage(
      {
        type: "CHART_DATA",
        data: {
          chart: data,
        },
      } as EditorChartData,
      env.PUBLIC_VIEWER_ORIGIN,
    );
  };

  $effect(() => {
    if (!data && data != "pending") {
      data = "pending";
      fetch(`/api/chart/${item.id}/data`)
        .then((res) => res.json())
        .then((d) => {
          data = d.chart;
          updateViewer();
        });
    }
  });

  const onMessage = (event: MessageEvent<ViewerMessage>) => {
    if (event.origin != env.PUBLIC_VIEWER_ORIGIN) {
      return;
    }
    if (event.data.type == "READY") {
      updateViewer();
    }
  };
  $effect(() => {
    if (
      viewerFrame &&
      viewerFrame.contentWindow &&
      typeof data != "undefined" &&
      data != "pending"
    ) {
      viewerFrame?.addEventListener("load", updateViewer);
    }
  });

  window.addEventListener("message", onMessage, false);
  onDestroy(() => {
    window.removeEventListener("message", onMessage, false);
    viewerFrame?.removeEventListener("load", updateViewer, false);
  });
</script>

<div class="holder" bind:clientWidth={holderWidth}>
  <div style:scale={1 / ZOOM}>
    <iframe
      bind:this={viewerFrame}
      src={env.PUBLIC_VIEWER_ORIGIN + "/view/chart/?"}
      title="Chart preview"
      width="{holderWidth * ZOOM}px"
      height="{300 * ZOOM}px"
    >
      Viewer content...
    </iframe>
  </div>
</div>

<style>
  .holder {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  iframe {
    display: block;
    border: none;
  }
</style>
