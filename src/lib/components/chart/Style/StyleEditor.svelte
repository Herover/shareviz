<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { ChartStore } from "$lib/chartStores/chart.svelte";
  import { StyleStore } from "$lib/chartStores/style.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";

  interface Props {
    connection: ShareDBConnection;
  }

  let { connection }: Props = $props();

  let chartStore = new ChartStore(connection);
  let styletStore = new StyleStore(connection);

  const cssExample = `.chart {
  --background-color: #ffffff;
  --text-primary-color: #000000;
  --text-mute-color: #888888;
  --chart-padding-left: 16px;
  --chart-padding-right: 16px;
  --chart-padding-top: 16px;
  --chart-padding-bottom: 16px;

  --axis-line-color: #aaaaaa;
  --axis-text-size: 0.9em;
}`;
</script>

<h3 class="editor-sub-section">Labels</h3>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Title</span>
  </div>
  <div>
    <textarea
      id="editor-title"
      value={chartStore.data?.title}
      onkeyup={(e) => chartStore.setConfigTitle(e.currentTarget.value)}
      class="control"
      style:height="60px"
    ></textarea>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Sub title</span>
  </div>
  <div>
    <textarea
      id="editor-subtitle"
      value={chartStore.data?.subTitle}
      onkeyup={(e) => chartStore.setConfigSubTitle(e.currentTarget.value)}
      class="control"
      style:height="60px"
    ></textarea>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Source text (left)</span>
  </div>
  <div>
    <input
      id="editor-source-text-left"
      value={chartStore.data?.sourceTextLeft}
      onkeyup={(e) => chartStore.setSourceTextLeft(e.currentTarget.value)}
      type="text"
      class="control"
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Source link (left)</span>
  </div>
  <div>
    <input
      id="editor-source-link-left"
      value={chartStore.data?.sourceTextLeftLink}
      onkeyup={(e) => chartStore.setSourceTextLeftLink(e.currentTarget.value)}
      type="text"
      class="control"
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Source text (right)</span>
  </div>
  <div>
    <input
      id="editor-source-text-lerightft"
      value={chartStore.data?.sourceTextRight}
      onkeyup={(e) => chartStore.setSourceTextRight(e.currentTarget.value)}
      type="text"
      class="control"
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Source link (right)</span>
  </div>
  <div>
    <input
      id="editor-source-text-right"
      value={chartStore.data?.sourceTextRightLink}
      onkeyup={(e) => chartStore.setSourceTextRightLink(e.currentTarget.value)}
      type="text"
      class="control"
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Height</span>
  </div>
  <div>
    <input
      value={chartStore.data?.height}
      onkeyup={(e) => chartStore.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => chartStore.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Width</span>
  </div>
  <div>
    <input
      value={chartStore.data?.width}
      onkeyup={(e) => chartStore.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => chartStore.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </div>
</div>

<h3 class="editor-sub-section">Style</h3>

<p><label for="style-overrides">Style overrides</label></p>
<p class="editor-sub-section-description">Override css, use on own risk!</p>
<pre class="editor-sub-section-description">{cssExample}</pre>
<textarea
  rows="10"
  onchange={(e) => styletStore.setCSS(e.currentTarget.value)}
  onkeyup={(e) => styletStore.setCSS(e.currentTarget.value)}>{styletStore.data?.css}</textarea
>

<style>
  .control {
    width: 100%;
    box-sizing: border-box;
  }
  textarea {
    resize: vertical;
  }
</style>
