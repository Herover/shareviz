<script lang="ts">
  import type { Data, Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import DataSetEditor from "./DataSetEditor.svelte";

  export let chartData: Data;
  export let store: typeof db;

  const addDataSet = () => {
    store.addDataSet(chartData.sets.length);
  };
</script>

{#each chartData.sets as dataSet, i}
  {#if i != 0}
    <br />
  {/if}
  <DataSetEditor dataStore={store.dataSet(i)} />
{/each}

<button on:click={() => addDataSet()}>+ Data set</button>
