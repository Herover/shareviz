<script lang="ts">
  import type { Data, Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import HBarEditor from "./HBar/HBarEditor.svelte";
  import EditorCollapsible from "./EditorCollapsible.svelte";
  import LineEditor from "./Line/LineEditor.svelte";

  export let chartScope: ReturnType<typeof db.chart>;
  export let spec: Root;
  export let chartData: {
    [key: string]: DSVParsedArray<any>;
  };
</script>

<p>
  <label>
    Title: <textarea
      value={$chartScope.title}
      on:keyup={(e) => chartScope.setConfigTitle(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Sub title: <textarea
      value={$chartScope.subTitle}
      on:keyup={(e) => chartScope.setConfigSubTitle(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source text (left): <input
      value={$chartScope.sourceTextLeft}
      on:keyup={(e) => chartScope.setSourceTextLeft(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source link (left): <input
      value={$chartScope.sourceTextLeftLink}
      on:keyup={(e) => chartScope.setSourceTextLeftLink(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source text (right): <input
      value={$chartScope.sourceTextRight}
      on:keyup={(e) => chartScope.setSourceTextRight(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label>
    Source link (right): <input
      value={$chartScope.sourceTextRightLink}
      on:keyup={(e) => chartScope.setSourceTextLeftRight(e.currentTarget.value)}
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
    </EditorCollapsible>
  {/if}
{/each}

<style>
  input,
  textarea {
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
