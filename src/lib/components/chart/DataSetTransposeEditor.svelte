<script lang="ts">
  import type { TransposedColumn } from "$lib/chart";
  // import type { Row } from "$lib/chart";
  import type { DataSetStore } from "$lib/chartStores/dataSet.svelte";
  import { valueParsers } from "$lib/utils";
  import equal from "fast-deep-equal";

  interface Props {
    // export let columns: Row[];
    dataStore: DataSetStore;
    transpose: TransposedColumn;
    i: number;
  }

  let { dataStore, transpose, i }: Props = $props();

  let transposedKeys = $state(transpose.from);

  const updateTransposed = () => {
    if (!equal(transposedKeys, transpose.from)) {
      dataStore.setTransposeFromArray(i, transposedKeys);
    }
  };
</script>

<div class="box">
  <div class="w-05 p-top-1 editor-explain-box">
    <span class="editor-column-label">From:</span>
    <br />
    <span class="editor-column-label-description">Columns to turn into rows.</span>
  </div>
  <div class="w-05 p-top-1">
    <select bind:value={transposedKeys} multiple onchange={() => updateTransposed()}>
      {#each (typeof dataStore.data != "undefined" ? dataStore.data : { rows: [] }).rows as col}
        <option selected={transpose.from.includes(col.key) ? true : null}>{col.key}</option>
      {/each}
    </select>
  </div>
</div>

<div class="box">
  <div class="w-05 p-top-1 editor-explain-box">
    <span class="editor-column-label">Keys:</span>
    <br />
    <span class="editor-column-label-description">
      The selected columns will be put in a single column with this name, 1 row each.
    </span>
  </div>
  <div class="w-05 p-top-1">
    <input
      value={transpose.toKey}
      onchange={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
      onkeyup={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
    />
  </div>
</div>

<div class="box">
  <div class="w-05 p-top-1 editor-explain-box">
    <span class="editor-column-label">Key type:</span>
    <br />
    <span class="editor-column-label-description">
      Data type of the transposed columns. Ex. if the keys are years, pick number or date, if the
      keys are city names pick text etc.
    </span>
  </div>
  <div class="w-05 p-top-1">
    <select
      value={transpose.keyType}
      onchange={(e) => dataStore.setTransposeKeyType(i, e.currentTarget.value)}
    >
      {#each Object.keys(valueParsers) as type}
        <option>{type}</option>
      {/each}
    </select>
  </div>
</div>

<div class="box">
  <div class="w-05 p-top-1 editor-explain-box">
    <span class="editor-column-label">Values:</span>
    <br />
    <span class="editor-column-label-description">
      The rows from the selected columns will be moved into a single column with this name.
    </span>
  </div>
  <div class="w-05 p-top-1">
    <input
      value={transpose.toValue}
      onchange={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
      onkeyup={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
    />
  </div>
</div>

<div class="box">
  <div class="w-05 p-top-1 editor-explain-box">
    <span class="editor-column-label">Value type:</span>
    <br />
    <span class="editor-column-label-description">
      Data type of the transposed rows. Ex. for years in columns and population in rows, use number.
    </span>
  </div>
  <div class="w-05 p-top-1">
    <select
      value={transpose.valueType}
      onchange={(e) => dataStore.setTransposeValueType(i, e.currentTarget.value)}
    >
      {#each Object.keys(valueParsers) as type}
        <option>{type}</option>
      {/each}
    </select>
  </div>
</div>

<button onclick={() => dataStore.removeTranspose(i)}>Delete</button>
<br />

<style>
  input,
  select {
    width: 100%;
    box-sizing: border-box;
  }
</style>
