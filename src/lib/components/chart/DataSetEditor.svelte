<script lang="ts">
  import type { Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { valueParsers } from "$lib/utils";

  export let dataStore: ReturnType<typeof db.dataSet>;

  const updateColumns = (newRaw: string) => {
    dataStore.setRaw(newRaw);
    const names = getColumnNames($dataStore, newRaw);
    let removed = 0;
    $dataStore.rows.forEach((col, i) => {
      if (!names.includes(col.key)) {
        dataStore.removeColumn(i - removed);
        removed++;
      }
    });
    names.forEach((name) => {
      const existing = $dataStore.rows.findIndex((col) => col.key == name);
      if (existing == -1) {
        dataStore.addColumn($dataStore.rows.length - removed, name, "text");
      }
    });
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
      on:change={(e) => updateColumns(e.currentTarget.value)}
      rows="4"
    /></label
  >
</p>
<p>
  <label
    >Format
    <select
      value={$dataStore.type}
      on:change={(e) => dataStore.setType(e.currentTarget.value)}
    >
      {#each ["tsv"] as row}
        <option>{row}</option>
      {/each}
    </select>
  </label>
</p>
<p>Columns:</p>
<ul>
  {#each $dataStore.rows as column, i}
    <li>
      "{column.key}"
      <select
        value={column.type}
        on:change={(e) => dataStore.setColumnType(i, e.currentTarget.value)}
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
