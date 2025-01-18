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
  {#each $chartScope.elements as element, i (element.id)}
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
        {:then Component}
          <Component {spec} chart={chartScope} {chartData} index={i} />
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
