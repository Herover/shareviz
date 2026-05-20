<!-- SPDX-License-Identifier: MPL-2.0 -->

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
    idPrefix?: string;
  }

  let { dataStore, transpose, i, idPrefix = "" }: Props = $props();

  let transposedKeys = $state(transpose.from);

  const updateTransposed = () => {
    if (!equal(transposedKeys, transpose.from)) {
      dataStore.setTransposeFromArray(i, transposedKeys);
    }
  };
</script>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}transpose-from">From</label>
  </div>
  <div>
    <select
      id="{idPrefix}transpose-from"
      bind:value={transposedKeys}
      multiple
      onchange={() => updateTransposed()}
    >
      {#each (typeof dataStore.data != "undefined" ? dataStore.data : { rows: [] }).rows as col, i (i)}
        <option selected={transpose.from.includes(col.key) ? true : null}>{col.key}</option>
      {/each}
    </select>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}transpose-keys">Keys</label>
    <span class="editor-column-label-description">
      The selected columns will be put in a single column with this name, 1 row each.
    </span>
  </div>
  <div>
    <input
      id="{idPrefix}transpose-keys"
      type="text"
      value={transpose.toKey}
      onchange={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
      onkeyup={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}transpose-key-type">Key type</label>
    <span class="editor-column-label-description">
      Data type of the transposed columns. Ex. if the keys are years, pick number or date, if the
      keys are city names pick text etc.
    </span>
  </div>
  <div>
    <select
      id="{idPrefix}transpose-key-type"
      value={transpose.keyType}
      onchange={(e) => dataStore.setTransposeKeyType(i, e.currentTarget.value)}
    >
      {#each Object.keys(valueParsers) as type (type)}
        <option>{type}</option>
      {/each}
    </select>
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}transpose-values">Values</label>
    <span class="editor-column-label-description">
      The rows from the selected columns will be moved into a single column with this name.
    </span>
  </div>
  <div>
    <input
      id="{idPrefix}transpose-values"
      type="text"
      value={transpose.toValue}
      onchange={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
      onkeyup={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
    />
  </div>
</div>

<div class="editor-row">
  <div class="editor-column-label">
    <label for="{idPrefix}transpose-value-type">Value type</label>
    <span class="editor-column-label-description">
      Data type of the transposed rows. Ex. for years in columns and population in rows, use number.
    </span>
  </div>
  <div>
    <select
      id="{idPrefix}transpose-value-type"
      value={transpose.valueType}
      onchange={(e) => dataStore.setTransposeValueType(i, e.currentTarget.value)}
    >
      {#each Object.keys(valueParsers) as type (type)}
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
