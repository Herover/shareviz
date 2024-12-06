<script lang="ts">
  import type { db } from "$lib/chartStore";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";

  interface Props {
    style: ReturnType<typeof db.style>;
  }

  let { style }: Props = $props();
</script>

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
</style>
