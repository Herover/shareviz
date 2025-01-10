<script lang="ts">
  import type { db } from "$lib/chartStore";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  interface Props {
    style: ReturnType<typeof db.style>;
    chartScope: ReturnType<typeof db.chart>;
  }

  let { style, chartScope }: Props = $props();
</script>

<h3 class="editor-sub-section">Labels</h3>
<div class="box">
  <div class="w-025 editor-column-label"><label for="editor-title">Title: </label></div>
  <div class="w-075">
    <textarea
      id="editor-title"
      value={$chartScope.title}
      onkeyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
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
      value={$chartScope.subTitle}
      onkeyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
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
      value={$chartScope.sourceTextLeft}
      onkeyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
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
      value={$chartScope.sourceTextLeftLink}
      onkeyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
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
      value={$chartScope.sourceTextRight}
      onkeyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
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
      value={$chartScope.sourceTextRightLink}
      onkeyup={(e) => chartScope.setSourceTextRightLink(e.currentTarget.value)}
      class="control"
    />
  </div>
</div>

<p>
  <label>
    Height: <input
      value={$chartScope.height}
      onkeyup={(e) => chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Width: <input
      value={$chartScope.width}
      onkeyup={(e) => chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      onchange={(e) => chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
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
      value={$style.titleSize}
      onchange={(e) => style.setTitleSize(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => style.setTitleSize(Number.parseFloat(e.currentTarget.value))}
      step="0.1"
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    <input
      bind:checked={$style.titleBold}
      onchange={(e) => style.setTitleBold(e.currentTarget.checked)}
      type="checkbox"
    />Bold
  </label>
</p>

<p>
  <label>
    Subtitle text size (em)
    <input
      value={$style.subTitleSize}
      onchange={(e) => style.setSubTitleSize(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => style.setSubTitleSize(Number.parseFloat(e.currentTarget.value))}
      step="0.1"
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    <input
      bind:checked={$style.subTitleBold}
      onchange={(e) => style.setSubTitleBold(e.currentTarget.checked)}
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
      value={$style.marginLeft}
      onchange={(e) => style.setMarginLeft(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => style.setMarginLeft(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    Right
    <input
      value={$style.marginRight}
      onchange={(e) => style.setMarginRight(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => style.setMarginRight(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <br />
  <label>
    Top
    <input
      value={$style.marginTop}
      onchange={(e) => style.setMarginTop(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => style.setMarginTop(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    Bottom
    <input
      value={$style.marginBottom}
      onchange={(e) => style.setMarginBottom(Number.parseFloat(e.currentTarget.value))}
      onkeyup={(e) => style.setMarginBottom(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
</p>

<p>
  Background color:
  <ColorPicker color={$style.bgColor} onchange={(s) => style.setBGColor(s)} />
</p>
<p>
  Text color:
  <ColorPicker color={$style.textColor} onchange={(s) => style.setTextColor(s)} />
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
