<script lang="ts">
  import type { TransposedColumn } from "$lib/chart";

  // import type { Row } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { valueParsers } from "$lib/utils";
  import equal from "fast-deep-equal";

  // export let columns: Row[];
  export let dataStore: ReturnType<typeof db.dataSet>;
  export let transpose: TransposedColumn;
  export let i: number;

  let transposedKeys = transpose.from;

  $: {
    if (!equal(transposedKeys, transpose.from)) {
      dataStore.setTransposeFromArray(i, transposedKeys);
    }
  }
</script>

<il>
  From
  <select bind:value={transposedKeys} multiple>
    {#each $dataStore.rows as col}
      <option selected={transpose.from.includes(col.key) ? true : null}
        >{col.key}</option
      >
    {/each}
  </select>
  <br />
  Keys:
  <input
    value={transpose.toKey}
    on:change={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
    on:keyup={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
  /><br />
  Values:
  <input
    value={transpose.toValue}
    on:change={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
    on:keyup={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
  /><br />
  value type:
  <select
    value={transpose.valueType}
    on:change={(e) => dataStore.setTransposeValueType(i, e.currentTarget.value)}
  >
    {#each Object.keys(valueParsers) as type}
      <option>{type}</option>
    {/each}
  </select>
  key type:
  <select
    value={transpose.keyType}
    on:change={(e) => dataStore.setTransposeKeyType(i, e.currentTarget.value)}
  >
    {#each Object.keys(valueParsers) as type}
      <option>{type}</option>
    {/each}
  </select>
  <br>
  <button on:click={() => dataStore.removeTranspose(i)}>Delete</button>
</il>
