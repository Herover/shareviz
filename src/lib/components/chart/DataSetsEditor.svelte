<script lang="ts">
  import type { Data, Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import DataSetEditor from "./DataSetEditor.svelte";

  export let chartData: Data;
  export let store: typeof db;
</script>

<b>Data sets</b>
{#each chartData.sets as dataSet, i}
  {#if i != 0}
    <br />
  {/if}
  <DataSetEditor {dataSet} dataStore={store.dataSet(i)} />
{/each}
