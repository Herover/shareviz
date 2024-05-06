<script lang="ts">
  import type { Root, Style } from "$lib/chart";
  import type { db } from "$lib/chartStore";

  export let spec: Root;
  export let style: ReturnType<typeof db.style>;
</script>

<p>
  <label>
    Title text size (em)
    <input
      value={$style.titleSize}
      on:change={(e) =>
        style.setTitleSize(Number.parseFloat(e.currentTarget.value))}
      on:keyup={(e) =>
        style.setTitleSize(Number.parseFloat(e.currentTarget.value))}
      step=0.1
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    <input
      bind:checked={$style.titleBold}
      on:change={(e) => style.setTitleBold(e.currentTarget.checked)}
      type="checkbox"
    />Bold
  </label>
</p>

<p>
  <label>
    Subtitle text size (em)
    <input
      value={$style.subTitleSize}
      on:change={(e) =>
        style.setSubTitleSize(Number.parseFloat(e.currentTarget.value))}
      on:keyup={(e) =>
        style.setSubTitleSize(Number.parseFloat(e.currentTarget.value))}
      step=0.1
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    <input
      bind:checked={$style.subTitleBold}
      on:change={(e) => style.setSubTitleBold(e.currentTarget.checked)}
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
      on:change={(e) =>
        style.setMarginLeft(Number.parseFloat(e.currentTarget.value))}
      on:keyup={(e) =>
        style.setMarginLeft(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    Right
    <input
      value={$style.marginRight}
      on:change={(e) =>
        style.setMarginRight(Number.parseFloat(e.currentTarget.value))}
      on:keyup={(e) =>
        style.setMarginRight(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <br />
  <label>
    Top
    <input
      value={$style.marginTop}
      on:change={(e) =>
        style.setMarginTop(Number.parseFloat(e.currentTarget.value))}
      on:keyup={(e) =>
        style.setMarginTop(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    Bottom
    <input
      value={$style.marginBottom}
      on:change={(e) =>
        style.setMarginBottom(Number.parseFloat(e.currentTarget.value))}
      on:keyup={(e) =>
        style.setMarginBottom(Number.parseFloat(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
</p>

<p>
  <label>
    Background color:
    <input
      value={$style.bgColor}
      on:change={(e) => style.setBGColor(e.currentTarget.value)}
      on:keyup={(e) => style.setBGColor(e.currentTarget.value)}
      type="color"
      style="width: 90px"
    />
  </label>
</p>
<p>
  <label>
    Text color:
    <input
      value={$style.textColor}
      on:change={(e) => style.setTextColor(e.currentTarget.value)}
      on:keyup={(e) => style.setTextColor(e.currentTarget.value)}
      type="color"
      style="width: 90px"
    />
  </label>
</p>

<style>
  .control {
    width: 100%;
    box-sizing: border-box;
  }
</style>
