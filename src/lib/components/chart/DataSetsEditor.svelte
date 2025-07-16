<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Data } from "$lib/chart";
  import { type ShareDBConnection } from "$lib/chartStores/data.svelte";
  import { DataSetsStore, DataSetStore } from "$lib/chartStores/dataSet.svelte";
  import DataSetEditor from "./DataSetEditor.svelte";

  interface Props {
    chartData: Data;
    connection: ShareDBConnection;
  }

  let { chartData, connection }: Props = $props();

  let dataSetStore = new DataSetsStore(connection);

  const addDataSet = () => {
    dataSetStore.addDataSet(chartData.sets.length);
  };
</script>

{#each chartData.sets as dataSet, i (dataSet.id)}
  {#if i != 0}
    <br />
  {/if}
  <DataSetEditor dataStore={new DataSetStore(connection, i)} />
{/each}

<button onclick={() => addDataSet()}>+ Data set</button>
