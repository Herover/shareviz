<script lang="ts">
  import type { Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import EditorCollapsible from "./EditorCollapsible.svelte";
  import { getComponentList, getEditorComponent } from "./chartComponents";
  import "./editor.css";

  interface Props {
    chartScope: ReturnType<typeof db.chart>;
    spec: Root;
    chartData: {
      [key: string]: DSVParsedArray<any>;
    };
  }

  let { chartScope, spec, chartData }: Props = $props();

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

<div>
  <div class="box">
    <div class="w-025 p-top-1"><label for="editor-title">Title: </label></div>
    <div class="w-075 p-top-1">
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
    <div class="w-025 p-top-1">
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
    <div class="w-025 p-top-1">
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
    <div class="w-025 p-top-1">
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
    <div class="w-025 p-top-1">
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
    <div class="w-025 p-top-1">
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

  {#each $chartScope.elements as element, i}
    <svelte:boundary>
      <EditorCollapsible
        group="element-controls"
        key={"element-" + i}
        label={`#${i + 1}`}
        startOpen={true}
        lvl={2}
      >
        {#await getEditorComponent(element.type)}
          <p><i>Loading {element.type} editor...</i></p>
        {:then component}
          {@const EditorComponent = component}
          <EditorComponent {spec} chart={chartScope} {chartData} index={i} />
        {:catch e}
          <p>Unable to load {element.type} editor: {e.message}</p>
        {/await}
        {#snippet actions()}
          <div>
            <button onclick={() => removeElement(i)}>Delete</button>
            <button disabled={i == 0} onclick={() => moveElementUp(i)}>Move up</button>
            <button
              disabled={i == $chartScope.elements.length - 1}
              onclick={() => moveElementDown(i)}>Move down</button
            >
          </div>
        {/snippet}
      </EditorCollapsible>

      {#snippet failed(error, reset)}
        <button onclick={reset}
          >A error happened in the {element.type} chart editor, click to reset</button
        >
        <pre>{error ? error : ""}</pre>
      {/snippet}
    </svelte:boundary>
  {/each}

  {#each getComponentList() as { add, label }}
    <button onclick={() => add(chartScope, $chartScope.elements.length)}>
      + {label}
    </button>
    &nbsp;
  {/each}
</div>

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
