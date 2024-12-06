<script lang="ts">
  import type { Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import HBarEditor from "./HBar/HBarEditor.svelte";
  import EditorCollapsible from "./EditorCollapsible.svelte";
  import LineEditor from "./Line/LineEditor.svelte";

  interface Props {
    chartScope: ReturnType<typeof db.chart>;
    spec: Root;
    chartData: {
      [key: string]: DSVParsedArray<any>;
    };
  }

  let { chartScope, spec, chartData }: Props = $props();

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
      onkeyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
      class="control"
    ></textarea>
  </label>
</p>
<p>
  <label>
    Sub title: <textarea
      value={$chartScope.subTitle}
      onkeyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
      class="control"
    ></textarea>
  </label>
</p>
<p>
  <label>
    Source text (left): <input
      value={$chartScope.sourceTextLeft}
      onkeyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Source link (left): <input
      value={$chartScope.sourceTextLeftLink}
      onkeyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Source text (right): <input
      value={$chartScope.sourceTextRight}
      onkeyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
<p>
  <label>
    Source link (right): <input
      value={$chartScope.sourceTextRightLink}
      onkeyup={(e) => chartScope.setSourceTextLeftRight(e.currentTarget.value)}
      class="control"
    />
  </label>
</p>
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

{#each $chartScope.elements as element, i}
  {#if element.type == "hBar"}
    <EditorCollapsible
      group="element-controls"
      key={"element-" + i}
      label={`#${i + 1}`}
      startOpen={true}
      lvl={2}
    >
      <HBarEditor {spec} dbHBar={chartScope.hBar(i)} chart={chartScope} {chartData} />
      {#snippet actions()}
        <div>
          <button onclick={() => removeElement(i)}>Delete</button>
          <button disabled={i == 0} onclick={() => moveElementUp(i)}>Move up</button>
          <button disabled={i == $chartScope.elements.length - 1} onclick={() => moveElementDown(i)}
            >Move down</button
          >
        </div>
      {/snippet}
    </EditorCollapsible>
  {:else if element.type == "line"}
    <EditorCollapsible
      group="element-controls"
      key={"element-" + i}
      label={`#${i + 1}`}
      startOpen={true}
      lvl={2}
    >
      <LineEditor {spec} dbLine={chartScope.line(i)} chart={chartScope} {chartData} index={i} />
      {#snippet actions()}
        <div>
          <button onclick={() => removeElement(i)}>Delete</button>
          <button disabled={i == 0} onclick={() => moveElementUp(i)}>Move up</button>
          <button disabled={i == $chartScope.elements.length - 1} onclick={() => moveElementDown(i)}
            >Move down</button
          >
        </div>
      {/snippet}
    </EditorCollapsible>
  {/if}
{/each}

<button onclick={() => addBarChart()}>+ Bars</button>
<button onclick={() => addLineChart()}>+ Lines</button>

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
