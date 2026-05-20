<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Set } from "$lib/chart";
  import type { DataSetStore } from "$lib/chartStores/dataSet.svelte";
  import { orDefault, valueParsers } from "$lib/utils";
  import DataSetTransposeEditor from "./DataSetTransposeEditor.svelte";
  import EditorCollapsible from "./EditorCollapsible.svelte";

  interface Props {
    dataStore: DataSetStore;
    idPrefix?: string;
  }

  let { dataStore, idPrefix = "" }: Props = $props();

  const TYPE_BADGES: Record<string, { label: string; cls: string }> = {
    number: { label: "123", cls: "badge-num" },
    text: { label: "ABC", cls: "badge-text" },
    ISODate: { label: "DAT", cls: "badge-date" },
    yyyyMmm: { label: "DAT", cls: "badge-date" },
    yyyyKk: { label: "DAT", cls: "badge-date" },
    date: { label: "DAT", cls: "badge-date" },
  };

  const DATE_FORMAT_HINTS: [string, string][] = [
    ["YYYY-MM-DD", "2025-02-10"],
    ["YY/M/D", "25/2/10"],
    ["HH:mm:s", "13:02:30"],
    ["hh a", "2 pm"],
    ["YYYY[Q]Q", "2025Q1"],
  ];
  const rawDataHint = "column1\tcolumn2\nvalue1\tvalue2\nvalue3\tvalue4\n...";

  const getBadge = (type: string) => TYPE_BADGES[type] ?? TYPE_BADGES.text;

  const updateColumns = (newRaw: string) => {
    if (typeof dataStore.data == "undefined") return;
    dataStore.setRaw(newRaw);
    const names = getColumnNames(dataStore.data, newRaw);
    const data = dataStore.data;
    dataStore.setColumns(
      names.map((key, i) => {
        const old = data.rows.find((e) => e.key === key);
        return {
          key,
          type: orDefault(old?.type, guessColumnType(dataStore.data, newRaw, i)),
          dateFormat: old?.dateFormat ?? "",
        };
      }),
    );
  };

  const getColumnNames = (set: Set | undefined, raw: string) => {
    if (set && set.type == "tsv") {
      return raw.split("\n")[0].split("\t");
    }
    return [];
  };

  const guessColumnType = (
    set: Set | undefined,
    raw: string,
    columnIndex: number,
  ): keyof typeof valueParsers => {
    if (set && set.type == "tsv") {
      const secondLine = raw.split("\n")[1];
      if (typeof secondLine == "undefined") return "text";
      const cell = secondLine.split("\t")[columnIndex];
      if (typeof cell == "undefined") return "text";
      if (cell.match(/^\d+(\.\d+)?$/)) return "number";
      if (cell.match(/(\d{4})-(\d{2})-(\d{2})/)) return "ISODate";
    }
    return "text";
  };
</script>

{#if typeof dataStore.data != "undefined"}
  <EditorCollapsible
    key="dataset-{idPrefix}"
    label={dataStore.data.name || "Dataset"}
    startOpen={true}
    lvl={1}
  >
    <div class="editor-row">
      <div class="editor-column-label">
        <label for="{idPrefix}dataset-name">Name</label>
      </div>
      <div>
        <input
          id="{idPrefix}dataset-name"
          type="text"
          value={dataStore.data.name}
          onchange={(e) => dataStore.setName(e.currentTarget.value)}
          onkeyup={(e) => dataStore.setName(e.currentTarget.value)}
        />
      </div>
    </div>

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="{idPrefix}dataset-raw">Raw data</label>
      </div>
      <div>
        <textarea
          id="{idPrefix}dataset-raw"
          value={dataStore.data.raw}
          onchange={(e) => updateColumns(e.currentTarget.value)}
          rows="6"
          placeholder={rawDataHint}
        ></textarea>
      </div>
    </div>

    <div class="editor-row">
      <div class="editor-column-label">
        <label for="{idPrefix}dataset-format">Format</label>
      </div>
      <div>
        <select
          id="{idPrefix}dataset-format"
          value={dataStore.data.type}
          onchange={(e) => dataStore.setType(e.currentTarget.value)}
        >
          {#each ["tsv"] as row (row)}
            <option>{row}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if dataStore.data.rows.length > 0}
      <h4 class="editor-sub-section">Columns</h4>
      <div class="ed-col-list">
        {#each dataStore.data.rows as column, i (i)}
          {@const badge = getBadge(column.type)}
          <div class="ed-col-row">
            <div class="ed-col-main">
              <span class="ed-col-badge {badge.cls}" class:is-empty={!column.key}>
                {badge.label}
              </span>
              <span class="ed-col-name" class:is-empty={!column.key}>
                {column.key ? `"${column.key}"` : "(empty)"}
              </span>
              <select
                class="ed-col-select"
                id="{idPrefix}col-{i}"
                value={column.type}
                onchange={(e) => dataStore.setColumnType(i, e.currentTarget.value)}
              >
                {#each Object.keys(valueParsers) as type (type)}
                  <option>{type}</option>
                {/each}
              </select>
            </div>
            {#if column.type == "date"}
              <div class="ed-col-date">
                <input
                  type="text"
                  placeholder="e.g. YYYY-MM-DD"
                  value={column.dateFormat}
                  onchange={(e) => dataStore.setColumnDateFormat(i, e.currentTarget.value)}
                  onkeyup={(e) => dataStore.setColumnDateFormat(i, e.currentTarget.value)}
                />
                <div class="ed-date-hint">
                  {#each DATE_FORMAT_HINTS as [fmt, ex] (fmt)}
                    <div class="ed-date-hint-row">
                      <span class="ed-date-fmt">{fmt}</span>
                      <span class="ed-date-ex">→ {ex}</span>
                    </div>
                  {/each}
                  <a
                    href="https://day.js.org/docs/en/parse/string-format"
                    class="ed-date-hint-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    See all formats at Day.js docs →
                  </a>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <EditorCollapsible key="transpose-{idPrefix}" label="Columns to rows (transpose)" lvl={2}>
      <p class="editor-sub-section-description">
        Use this if your year values or category names are column headers instead of row values —
        transpose flips them into rows so they can be plotted.
      </p>
      {#each dataStore.data.transpose as transpose, i (transpose.toKey)}
        <DataSetTransposeEditor {dataStore} {transpose} {i} idPrefix="{idPrefix}t{i}-" />
      {/each}
      <button
        onclick={() =>
          typeof dataStore.data != "undefined" &&
          dataStore.addTranspose(dataStore.data.transpose.length)}
      >
        + Add transpose
      </button>
    </EditorCollapsible>
  </EditorCollapsible>
{/if}
