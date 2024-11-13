<script lang="ts">
  import type { Data } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import DataSetEditor from "./DataSetEditor.svelte";

  interface Props {
    chartData: Data;
    store: typeof db;
  }

  let { chartData, store }: Props = $props();

  const addDataSet = () => {
    store.addDataSet(chartData.sets.length);
  };
</script>

{#each chartData.sets as _dataSet, i}
  {#if i != 0}
    <br />
  {/if}
  <DataSetEditor dataStore={store.dataSet(i)} />
{/each}

<button onclick={() => addDataSet()}>+ Data set</button>
