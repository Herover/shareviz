<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Root } from "$lib/chart";
  import EditorCollapsible from "./EditorCollapsible.svelte";
  import { getComponentList, getEditorComponent } from "./chartComponents";
  import "./editor.css";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";
  import { ChartStore } from "$lib/chartStores/chart.svelte";
  import type { ComputedData } from "$lib/data";

  interface Props {
    spec: Root;
    chartData: ComputedData;
    connection: ShareDBConnection;
  }

  let { spec, chartData, connection }: Props = $props();

  let chartStore = new ChartStore(connection);

  const removeElement = (i: number) => {
    chartStore.removeChartElement(i);
  };
  const moveElementUp = (i: number) => {
    chartStore.moveElementUp(i);
  };
  const moveElementDown = (i: number) => {
    chartStore.moveElementDown(i);
  };
</script>

<div>
  {#each chartStore.data?.elements ?? [] as element, i (element.id)}
    <svelte:boundary>
      <EditorCollapsible
        group="element-controls"
        key={"element-" + element.id}
        label={`#${i + 1}`}
        startOpen={true}
        lvl={2}
      >
        {#await getEditorComponent(element.type)}
          <p><i>Loading {element.type} editor...</i></p>
        {:then Component}
          <Component
            {spec}
            {chartData}
            index={i}
            id={element.id}
            {connection}
            store={chartStore.scopeElement(i)}
            chartSpec={element.d}
          />
        {:catch e}
          <p>Unable to load {element.type} editor: {e.message}</p>
        {/await}
        {#snippet actions()}
          <div>
            <button onclick={() => removeElement(i)}>Delete</button>
            <button disabled={i == 0} onclick={() => moveElementUp(i)}>Move up</button>
            <button
              disabled={i == (chartStore.data?.elements ?? []).length - 1}
              onclick={() => moveElementDown(i)}>Move down</button
            >
          </div>
        {/snippet}
      </EditorCollapsible>

      {#snippet failed(error, reset)}
        <button onclick={reset}>A error happened in the {element.type} chart, click to reset</button
        >
        <pre>{error ? error : ""}</pre>
      {/snippet}
    </svelte:boundary>
  {/each}

  {#each getComponentList() as { add, label, key } (key)}
    <button onclick={() => add(chartStore, chartStore.data?.elements.length || 0)}>
      + {label}
    </button>
    &nbsp;
  {/each}
</div>
