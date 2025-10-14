<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Set } from "$lib/chart";
  import type { DataSetStore } from "$lib/chartStores/dataSet.svelte";
  import { orDefault, valueParsers } from "$lib/utils";
  import DataSetTransposeEditor from "./DataSetTransposeEditor.svelte";
  import DateParserInput from "./DateParser/DateParserInput.svelte";

  interface Props {
    dataStore: DataSetStore;
  }

  let { dataStore }: Props = $props();

  const updateColumns = (newRaw: string) => {
    if (typeof dataStore.data == "undefined") {
      return;
    }
    dataStore.setRaw(newRaw);
    const names = getColumnNames(dataStore.data, newRaw);
    const data = dataStore.data;
    dataStore.setColumns(
      names.map((key) => ({
        key,
        type: orDefault(data.rows.find((e) => e.key === key)?.type, "text"),
        dateFormat: "",
      })),
    );
  };

  const getColumnNames = (set: Set | undefined, raw: string) => {
    if (set && set.type == "tsv") {
      const firstLine = raw.split("\n")[0];
      const columnNames = firstLine.split("\t");
      return columnNames;
    }

    return [];
  };
</script>

<h3 class="editor-sub-section">Dataset</h3>
{#if typeof dataStore.data != "undefined"}
  <div class="box">
    <div class="w-025 editor-explain-box">
      <span class="editor-column-label">Name</span>
    </div>
    <div class="w-075">
      <input
        value={dataStore.data.name}
        onchange={(e) => dataStore.setName(e.currentTarget.value)}
        onkeyup={(e) => dataStore.setName(e.currentTarget.value)}
      />
    </div>
  </div>
  <p>
    <label
      >Raw data <textarea
        value={dataStore.data.raw}
        onchange={(e) => updateColumns(e.currentTarget.value)}
        rows="4"
        placeholder={dataStore.data.type == "tsv"
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
      <select
        value={dataStore.data.type}
        onchange={(e) => dataStore.setType(e.currentTarget.value)}
      >
        {#each ["tsv"] as row (row)}
          <option>{row}</option>
        {/each}
      </select>
    </div>
  </div>

  <h4 class="editor-sub-section">Columns to rows (transpose)</h4>
  <p class="editor-sub-section-description">
    You typically want your data in rows, not columns. If you want to plot ex. population changes
    over years but your year numbers are columns, or population per city but city names are in
    columns, then you need to turn them into rows first. Use transpose for this.
  </p>
  {#each dataStore.data.transpose as transpose, i (transpose.toKey)}
    <DataSetTransposeEditor {dataStore} {transpose} {i} />
  {/each}

  <button
    onclick={() =>
      typeof dataStore.data != "undefined" &&
      dataStore.addTranspose(dataStore.data.transpose.length)}>Add transpose</button
  >

  <h4 class="editor-sub-section">Columns</h4>
  {#each dataStore.data.rows as column, i (column.key)}
    <div class="box">
      <div class="w-05 editor-explain-box text-align-right">
        "{column.key}"
      </div>
      <div class="w-05">
        <select
          value={column.type}
          onchange={(e) => dataStore.setColumnType(i, e.currentTarget.value)}
        >
          {#each Object.keys(valueParsers) as type (type)}
            <option>{type}</option>
          {/each}
        </select>
        {#if column.type == "date"}
          <DateParserInput
            value={column.dateFormat}
            onchange={(val) => dataStore.setColumnDateFormat(i, val)}
          />
        {/if}
      </div>
    </div>
  {/each}
{/if}
