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
      names.map((key) => ({
        key,
        type: orDefault($dataStore.rows.find((e) => e.key === key)?.type, "text"),
      })),
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

<h3 class="editor-sub-section">Dataset</h3>
<div class="box">
  <div class="w-025 editor-explain-box">
    <span class="editor-column-label">Name</span>
  </div>
  <div class="w-075">
    <input
      value={$dataStore.name}
      onchange={(e) => dataStore.setName(e.currentTarget.value)}
      onkeyup={(e) => dataStore.setName(e.currentTarget.value)}
    />
  </div>
</div>
<p>
  <label
    >Raw data <textarea
      value={$dataStore.raw}
      onchange={(e) => updateColumns(e.currentTarget.value)}
      rows="4"
      placeholder={$dataStore.type == "tsv"
        ? `column1\tcolumn2
value1\tvalue2
value3\tvalue4
...`
        : ""}
    ></textarea></label
  >
</p>
<div class="box">
  <div class="w-025 editor-explain-box">
    <span class="editor-column-label">Format</span>
  </div>
  <div class="w-075">
    <select value={$dataStore.type} onchange={(e) => dataStore.setType(e.currentTarget.value)}>
      {#each ["tsv"] as row}
        <option>{row}</option>
      {/each}
    </select>
  </div>
</div>

<h4 class="editor-sub-section">Columns to rows (transpose)</h4>
<p class="editor-sub-section-description">
  You typically want your data in rows, not columns. If you want to plot ex. population changes over
  years but your year numbers are columns, or population per city but city names are in columns,
  then you need to turn them into rows first. Use transpose for this.
</p>
{#each $dataStore.transpose as transpose, i}
  <DataSetTransposeEditor {dataStore} {transpose} {i} />
{/each}

<button onclick={() => dataStore.addTranspose($dataStore.transpose.length)}>Add transpose</button>

<h4 class="editor-sub-section">Columns</h4>
{#each $dataStore.rows as column, i}
  <div class="box">
    <div class="w-05 editor-explain-box text-align-right">
      "{column.key}"
    </div>
    <div class="w-05">
      <select
        value={column.type}
        onchange={(e) => dataStore.setColumnType(i, e.currentTarget.value)}
      >
        {#each Object.keys(valueParsers) as type}
          <option>{type}</option>
        {/each}
      </select>
    </div>
  </div>
{/each}
