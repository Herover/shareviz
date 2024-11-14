<script lang="ts">
  import type { Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { orDefault, valueParsers } from "$lib/utils";
  import DataSetTransposeEditor from "./DataSetTransposeEditor.svelte";

  interface Props {
    dataStore: ReturnType<typeof db.dataSet>;
  }

  let { dataStore }: Props = $props();

  const updateColumns = (newRaw: string) => {
    dataStore.setRaw(newRaw);
    const names = getColumnNames($dataStore, newRaw);
    dataStore.setColumns(
      names.map(key => ({ key, type: orDefault($dataStore.rows.find(e => e.key === key)?.type, "text") }))
    );
  };

  const getColumnNames = (set: Set, raw: string) => {
    if (set.type == "tsv") {
      const firstLine = raw.split("\n")[0];
      const columnNames = firstLine.split("\t");
      return columnNames;
    }

    return [];
  };
</script>

<p><label>ID <input disabled value={$dataStore.id} /></label></p>
<p>
  <label
    >Raw data <textarea
      value={$dataStore.raw}
      onchange={(e) => updateColumns(e.currentTarget.value)}
      rows="4"
      placeholder={$dataStore.type == "tsv" ? `column1\tcolumn2
value1\tvalue2
value3\tvalue4
...` : ""}
></textarea></label
  >
</p>
<p>
  <label
    >Name
    <input
      value={$dataStore.name}
      onchange={(e) => dataStore.setName(e.currentTarget.value)}
      onkeyup={(e) => dataStore.setName(e.currentTarget.value)}
    />
  </label>
</p>
<p>
  <label
    >Format
    <select
      value={$dataStore.type}
      onchange={(e) => dataStore.setType(e.currentTarget.value)}
    >
      {#each ["tsv"] as row}
        <option>{row}</option>
      {/each}
    </select>
  </label>
</p>

<p>Columns to rows (transpose)</p>
<ul>
{#each $dataStore.transpose as transpose, i}
  <DataSetTransposeEditor {dataStore} {transpose} {i} />
{/each}
</ul>

<button
  onclick={() => dataStore.addTranspose($dataStore.transpose.length)}
>Add transpose</button>

<p>Columns:</p>
<ul>
  {#each $dataStore.rows as column, i}
    <li>
      "{column.key}"
      <select
        value={column.type}
        onchange={(e) => dataStore.setColumnType(i, e.currentTarget.value)}
      >
        {#each Object.keys(valueParsers) as type}
          <option>{type}</option>
        {/each}
      </select>
    </li>
  {/each}
</ul>

<style>
  textarea {
    resize: vertical;
    width: 100%;
  }
  * {
    box-sizing: border-box;
  }
</style>
