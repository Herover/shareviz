<script lang="ts">
  import { ChartStore } from "$lib/chartStores/chart.svelte";
  import { StyleStore } from "$lib/chartStores/style.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  interface Props {
    connection: ShareDBConnection;
  }

  let { connection }: Props = $props();

  let chartStore = new ChartStore(connection);
  let styletStore = new StyleStore(connection);
</script>

<h3 class="editor-sub-section">Labels</h3>
<div class="box">
  <div class="w-025 editor-column-label"><label for="editor-title">Title: </label></div>
  <div class="w-075">
    <textarea
      id="editor-title"
      value={chartStore.data?.title}
      onkeyup={(e) => chartStore.setConfigTitle(e.currentTarget.value)}
      class="control"
      style:height="60px"
    ></textarea>
  </div>
</div>
<div class="box">
  <div class="w-025 editor-column-label p-top-1">
    <label for="editor-subtitle"> Sub title: </label>
  </div>
  <div class="w-075 p-top-1">
    <textarea
      id="editor-subtitle"
      value={chartStore.data?.subTitle}
      onkeyup={(e) => chartStore.setConfigSubTitle(e.currentTarget.value)}
      class="control"
      style:height="60px"
    ></textarea>
  </div>
</div>

<div class="box">
  <div class="w-025 editor-column-label p-top-1">
    <label for="editor-source-text-left"> Source text (left):</label>
  </div>
  <div class="w-075 p-top-1">
    <input
      id="editor-source-text-left"
      value={chartStore.data?.sourceTextLeft}
      onkeyup={(e) => chartStore.setSourceTextLeft(e.currentTarget.value)}
      class="control"
    />
  </div>
</div>

<div class="box">
  <div class="w-025 editor-column-label p-top-1">
    <label for="editor-source-link-left"> Source link (left):</label>
  </div>
  <div class="w-075 p-top-1">
    <input
      id="editor-source-link-left"
      value={chartStore.data?.sourceTextLeftLink}
      onkeyup={(e) => chartStore.setSourceTextLeftLink(e.currentTarget.value)}
      class="control"
    />
  </div>
</div>

<div class="box">
  <div class="w-025 editor-column-label p-top-1">
    <label for="editor-source-text-right"> Source text (right):</label>
  </div>
  <div class="w-075 p-top-1">
    <input
      id="editor-source-text-lerightft"
      value={chartStore.data?.sourceTextRight}
      onkeyup={(e) => chartStore.setSourceTextRight(e.currentTarget.value)}
      class="control"
    />
  </div>
</div>

<div class="box">
  <div class="w-025 editor-column-label p-top-1">
    <label for="editor-source-text-right"> Source link (right):</label>
  </div>
  <div class="w-075 p-top-1">
    <input
      id="editor-source-text-right"
      value={chartStore.data?.sourceTextRightLink}
      onkeyup={(e) => chartStore.setSourceTextRightLink(e.currentTarget.value)}
      class="control"
    />
  </div>
</div>

<p>
  <label>
    Height: <input
      value={chartStore.data?.height}
      onkeyup={(e) => chartStore.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => chartStore.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Width: <input
      value={chartStore.data?.width}
      onkeyup={(e) => chartStore.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => chartStore.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </label>
</p>

<h3 class="editor-sub-section">Style</h3>
<p>
  <label>
    Title text size (em)
    <input
      value={styletStore.data?.titleSize}
      onchange={(e) => styletStore.setTitleSize(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => styletStore.setTitleSize(Number.parseFloat(e.currentTarget.value))}
      step="0.1"
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    <input
      checked={styletStore.data?.titleBold ?? false}
      onchange={(e) => styletStore.setTitleBold(e.currentTarget.checked)}
      type="checkbox"
    />Bold
  </label>
</p>

<p>
  <label>
    Subtitle text size (em)
    <input
      value={styletStore.data?.subTitleSize}
      onchange={(e) => styletStore.setSubTitleSize(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => styletStore.setSubTitleSize(Number.parseFloat(e.currentTarget.value))}
      step="0.1"
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    <input
      checked={styletStore.data?.subTitleBold}
      onchange={(e) => styletStore.setSubTitleBold(e.currentTarget.checked)}
      type="checkbox"
    />Bold
  </label>
</p>

<p>
  Margins (px):
  <br />
  <label>
    Left
    <input
      value={styletStore.data?.marginLeft}
      onchange={(e) => styletStore.setMarginLeft(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => styletStore.setMarginLeft(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    Right
    <input
      value={styletStore.data?.marginRight}
      onchange={(e) => styletStore.setMarginRight(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => styletStore.setMarginRight(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <br />
  <label>
    Top
    <input
      value={styletStore.data?.marginTop}
      onchange={(e) => styletStore.setMarginTop(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => styletStore.setMarginTop(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    Bottom
    <input
      value={styletStore.data?.marginBottom}
      onchange={(e) => styletStore.setMarginBottom(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => styletStore.setMarginBottom(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
</p>

<p>
  Background color:
  <ColorPicker
    color={styletStore.data?.bgColor || ""}
    onchange={(s) => styletStore.setBGColor(s)}
  />
</p>
<p>
  Text color:
  <ColorPicker
    color={styletStore.data?.textColor || ""}
    onchange={(s) => styletStore.setTextColor(s)}
  />
</p>

<style>
  .control {
    width: 100%;
    box-sizing: border-box;
  }
  textarea {
    resize: vertical;
  }
</style>
