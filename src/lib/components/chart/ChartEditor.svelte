<script lang="ts">
  import type { Data, Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import HBarEditor from "./HBar/HBarEditor.svelte";
  import EditorCollapsible from "./EditorCollapsible.svelte";
  import LineEditor from "./Line/LineEditor.svelte";

  export let chartScope: ReturnType<typeof db.chart>;
  export let styleScope: ReturnType<typeof db.style>;
  export let spec: Root;
  export let chartData: {
    [key: string]: DSVParsedArray<any>;
  };

  const addBarChart = () => {
    chartScope.addBarChart($chartScope.elements.length);
  };
  const addLineChart = () => {
    chartScope.addLineChart($chartScope.elements.length);
  };
  const removeElement = (i: number) => {
    chartScope.removeChartElement(i);
  };
  const moveElementUp = (i: number) => {
    chartScope.moveElementUp(i);
  };
  const moveElementDown = (i: number) => {
    chartScope.moveElementDown(i);
  };
</script>

<p>
  <label>
    Title: <textarea
      value={$chartScope.title}
      on:keyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Bold:
    <input
      bind:checked={$styleScope.titleBold}
      on:change={(e) => styleScope.setTitleBold(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Sub title: <textarea
      value={$chartScope.subTitle}
      on:keyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Bold:
    <input
      bind:checked={$styleScope.subTitleBold}
      on:change={(e) => styleScope.setSubTitleBold(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Source text (left): <input
      value={$chartScope.sourceTextLeft}
      on:keyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Source link (left): <input
      value={$chartScope.sourceTextLeftLink}
      on:keyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Source text (right): <input
      value={$chartScope.sourceTextRight}
      on:keyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Source link (right): <input
      value={$chartScope.sourceTextRightLink}
      on:keyup={(e) => chartScope.setSourceTextLeftRight(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Height: <input
      value={$chartScope.height}
      on:keyup={(e) =>
        chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        chartScope.setConfigHeight(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Width: <input
      value={$chartScope.width}
      on:keyup={(e) =>
        chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        chartScope.setConfigWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
      class="control"
    />
  </label>
</p>

{#each $chartScope.elements as element, i}
  {#if element.type == "hBar"}
    <EditorCollapsible
      group="element-controls"
      key={"element-" + i}
      label={`#${i + 1}`}
      startOpen={true}
      lvl={2}
    >
      <HBarEditor
        {spec}
        dbHBar={chartScope.hBar(i)}
        chart={chartScope}
        {chartData}
      />
      <div slot="actions">
        <button on:click={() => removeElement(i)}>Delete</button>
        <button disabled={i == 0} on:click={() => moveElementUp(i)}
          >Move up</button
        >
        <button
          disabled={i == $chartScope.elements.length - 1}
          on:click={() => moveElementDown(i)}>Move down</button
        >
      </div>
    </EditorCollapsible>
  {:else if element.type == "line"}
    <EditorCollapsible
      group="element-controls"
      key={"element-" + i}
      label={`#${i + 1}`}
      startOpen={true}
      lvl={2}
    >
      <LineEditor
        {spec}
        dbLine={chartScope.line(i)}
        chart={chartScope}
        {chartData}
      />
      <div slot="actions">
        <button on:click={() => removeElement(i)}>Delete</button>
        <button disabled={i == 0} on:click={() => moveElementUp(i)}
          >Move up</button
        >
        <button
          disabled={i == $chartScope.elements.length - 1}
          on:click={() => moveElementDown(i)}>Move down</button
        >
      </div>
    </EditorCollapsible>
  {/if}
{/each}

<button on:click={() => addBarChart()}>+ Bars</button>
<button on:click={() => addLineChart()}>+ Lines</button>

<style>
  .control {
    width: 100%;
    box-sizing: border-box;
  }
  textarea {
    resize: vertical;
  }
  /* p {
    margin-top: 1em;
  } */
</style>
