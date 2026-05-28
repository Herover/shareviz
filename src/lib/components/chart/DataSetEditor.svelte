<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Set } from "$lib/chart";
  import type { DataSetStore } from "$lib/chartStores/dataSet.svelte";
  import { orDefault, valueParsers } from "$lib/utils";
  import DataSetTransposeEditor from "./DataSetTransposeEditor.svelte";
  import DateFormatInput from "./DateFormatInput.svelte";
  import EditorCollapsible from "./EditorCollapsible.svelte";

  interface Props {
    dataStore: DataSetStore;
    idPrefix?: string;
  }

  let { dataStore, idPrefix = "" }: Props = $props();

  let transposeOpen = $state(false);

  const TYPE_BADGES: Record<string, { label: string; cls: string }> = {
    number: { label: "123", cls: "badge-num" },
    text: { label: "ABC", cls: "badge-text" },
    ISODate: { label: "DAT", cls: "badge-date" },
    yyyyMmm: { label: "DAT", cls: "badge-date" },
    yyyyKk: { label: "DAT", cls: "badge-date" },
    date: { label: "DAT", cls: "badge-date" },
  };

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
                <DateFormatInput
                  value={column.dateFormat}
                  onValueChange={(next) => dataStore.setColumnDateFormat(i, next)}
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <h4 class="editor-sub-section">Transpose</h4>
    <div class="ed-transpose">
      <button
        type="button"
        class="ed-transpose-head"
        onclick={() => (transposeOpen = !transposeOpen)}
        aria-expanded={transposeOpen}
      >
        <span class="ed-transpose-chev">{transposeOpen ? "▾" : "▸"}</span>
        <span class="ed-transpose-title">Columns to rows (transpose)</span>
        <span class="ed-transpose-summary" data-empty={dataStore.data.transpose.length === 0}>
          {#if dataStore.data.transpose.length === 0}
            <span class="ed-tp-sum-empty">none configured</span>
          {:else}
            <span class="ed-tp-sum-count">
              {dataStore.data.transpose.length}
              {dataStore.data.transpose.length === 1 ? "transpose" : "transposes"}
            </span>
            {#each dataStore.data.transpose as t, i (i)}
              <span class="ed-tp-sum-chip" title={`From: ${t.from.join(", ") || "—"}`}>
                {t.toKey || "key"}<span class="ed-tp-sum-slash">/</span>{t.toValue || "value"}
                {#if t.from.length > 0}<span class="ed-tp-sum-n">·{t.from.length}</span>{/if}
              </span>
            {/each}
          {/if}
        </span>
      </button>
      {#if transposeOpen}
        <div class="ed-transpose-body">
          <p class="ed-transpose-desc">
            Use this when years, categories or other values appear as
            <em>column headers</em>
            instead of row cells. Transpose pivots a <strong>wide</strong>
            table into a <strong>long</strong> one so it can be plotted.
          </p>

          {#if dataStore.data.transpose.length === 0}
            <div class="ed-tp-empty">No transposes yet. Add one if your data is in wide form.</div>
          {/if}

          {#each dataStore.data.transpose as transpose, i (i)}
            <DataSetTransposeEditor {dataStore} {transpose} {i} idPrefix="{idPrefix}t{i}-" />
          {/each}

          <button
            type="button"
            class="ed-btn-add"
            onclick={() =>
              typeof dataStore.data != "undefined" &&
              dataStore.addTranspose(dataStore.data.transpose.length)}
          >
            ＋ Add transpose
          </button>
        </div>
      {/if}
    </div>
  </EditorCollapsible>
{/if}

<style>
  /* Column list with type badges */
  .ed-col-list {
    width: 100%;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    overflow: hidden;
  }
  .ed-col-row {
    border-bottom: 1px solid var(--border-subtle);
  }
  .ed-col-row:last-child {
    border-bottom: 0;
  }
  .ed-col-main {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
  }
  .ed-col-badge {
    flex-shrink: 0;
    width: 30px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .ed-col-badge.is-empty {
    opacity: 0.35;
  }
  .ed-col-badge.badge-num {
    background: var(--badge-num-bg);
    color: var(--badge-num-fg);
  }
  .ed-col-badge.badge-text {
    background: var(--badge-text-bg);
    color: var(--badge-text-fg);
  }
  .ed-col-badge.badge-date {
    background: var(--badge-date-bg);
    color: var(--badge-date-fg);
  }
  .ed-col-name {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--fg-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  .ed-col-name.is-empty {
    color: var(--fg-tertiary);
    font-style: italic;
  }
  select.ed-col-select {
    width: 110px;
    flex-shrink: 0;
    height: 26px;
    font-size: 0.85rem;
  }

  /* Date format wrapper — provides indent + divider matching the column row layout */
  .ed-col-date {
    padding: 0 12px 4px 50px;
    border-top: 1px dashed var(--border-subtle);
    background: var(--bg-base);
  }

  /* Transpose block */
  .ed-transpose {
    width: 100%;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    overflow: hidden;
    margin-bottom: 8px;
    margin-top: 8px;
  }
  button.ed-transpose-head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: auto;
    min-height: var(--space-8);
    padding: 10px 12px;
    border: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--fg-primary);
  }
  button.ed-transpose-head:hover {
    background: var(--bg-sunken);
  }
  .ed-transpose-chev {
    font-size: 0.8rem;
    color: var(--fg-tertiary);
    width: 14px;
  }
  .ed-transpose-title {
    font-weight: 500;
  }
  .ed-transpose-body {
    padding: 4px 14px 14px 14px;
    border-top: 1px solid var(--border-subtle);
  }
  .ed-transpose-desc {
    font-size: 0.85rem;
    color: var(--fg-secondary);
    line-height: 1.55;
    margin: 10px 0 12px;
  }
  .ed-transpose-desc em {
    font-style: italic;
    color: var(--fg-primary);
  }
  .ed-transpose-desc strong {
    font-weight: 600;
    color: var(--fg-primary);
  }

  /* Summary chips visible when block is collapsed */
  .ed-transpose-summary {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 60%;
  }
  .ed-tp-sum-empty {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--fg-tertiary);
    letter-spacing: 0.04em;
  }
  .ed-tp-sum-count {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--fg-tertiary);
    font-weight: 500;
  }
  .ed-tp-sum-chip {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    padding: 2px 7px;
    background: var(--accent-primary-subtle);
    color: var(--accent-primary);
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .ed-tp-sum-slash {
    opacity: 0.5;
    padding: 0 3px;
    font-weight: 400;
  }
  .ed-tp-sum-n {
    margin-left: 5px;
    opacity: 0.6;
    font-weight: 500;
  }

  .ed-tp-empty {
    font-size: 0.85rem;
    color: var(--fg-tertiary);
    background: var(--bg-base);
    border: 1px dashed var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 14px;
    text-align: center;
    margin-bottom: 10px;
  }

  button.ed-btn-add {
    height: var(--space-8);
    padding: 0 14px;
    border: 1.5px dashed var(--accent-primary);
    background: transparent;
    color: var(--accent-primary);
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background var(--duration-micro) var(--ease-standard);
  }
  button.ed-btn-add:hover {
    background: var(--accent-primary-subtle);
    color: var(--accent-primary);
  }
</style>
