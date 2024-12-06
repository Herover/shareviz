<script lang="ts">
  import type { TransposedColumn } from "$lib/chart";
  // import type { Row } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { valueParsers } from "$lib/utils";
  import equal from "fast-deep-equal";

  interface Props {
    // export let columns: Row[];
    dataStore: ReturnType<typeof db.dataSet>;
    transpose: TransposedColumn;
    i: number;
  }

  let { dataStore, transpose, i }: Props = $props();

  let transposedKeys = $state(transpose.from);

  $effect(() => {
    if (!equal(transposedKeys, transpose.from)) {
      dataStore.setTransposeFromArray(i, transposedKeys);
    }
  });
</script>

<il>
  From
  <select bind:value={transposedKeys} multiple>
    {#each $dataStore.rows as col}
      <option selected={transpose.from.includes(col.key) ? true : null}>{col.key}</option>
    {/each}
  </select>
  <br />
  Keys:
  <input
    value={transpose.toKey}
    onchange={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
    onkeyup={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
  /><br />
  Values:
  <input
    value={transpose.toValue}
    onchange={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
    onkeyup={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
  /><br />
  value type:
  <select
    value={transpose.valueType}
    onchange={(e) => dataStore.setTransposeValueType(i, e.currentTarget.value)}
  >
    {#each Object.keys(valueParsers) as type}
      <option>{type}</option>
    {/each}
  </select>
  key type:
  <select
    value={transpose.keyType}
    onchange={(e) => dataStore.setTransposeKeyType(i, e.currentTarget.value)}
  >
    {#each Object.keys(valueParsers) as type}
      <option>{type}</option>
    {/each}
  </select>
  <br />
  <button onclick={() => dataStore.removeTranspose(i)}>Delete</button>
</il>
