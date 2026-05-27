<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { TransposedColumn } from "$lib/chart";
  import type { DataSetStore } from "$lib/chartStores/dataSet.svelte";
  import { valueParsers } from "$lib/utils";

  const TP_TYPES = Object.keys(valueParsers);

  interface Props {
    dataStore: DataSetStore;
    transpose: TransposedColumn;
    i: number;
    idPrefix?: string;
  }

  let { dataStore, transpose, i, idPrefix = "" }: Props = $props();

  let lastIdx = $state<number | null>(null);
  let filter = $state("");

  const colNames = $derived(
    (typeof dataStore.data != "undefined" ? dataStore.data.rows : []).map((r) => r.key),
  );

  const filterText = $derived(filter.trim().toLowerCase());
  const showFilter = $derived(colNames.length > 12);

  // Keep original index so shift-range selection is contiguous in the
  // unfiltered list, not the visible (filtered) slice.
  const visibleChips = $derived(
    colNames
      .map((name, idx) => ({ name, idx }))
      .filter(({ name }) => !filterText || name.toLowerCase().includes(filterText)),
  );

  const allSelected = $derived(colNames.length > 0 && transpose.from.length === colNames.length);
  const anySelected = $derived(transpose.from.length > 0);

  const setSelected = (next: string[]) => {
    dataStore.setTransposeFromArray(i, next);
  };

  const handleChipClick = (event: MouseEvent, idx: number, name: string) => {
    const selected = transpose.from;
    if (event.shiftKey && lastIdx != null && lastIdx !== idx) {
      const a = Math.min(lastIdx, idx);
      const b = Math.max(lastIdx, idx);
      const range = colNames.slice(a, b + 1);
      const allOn = range.every((r) => selected.includes(r));
      const next = allOn
        ? selected.filter((s) => !range.includes(s))
        : Array.from(new Set([...selected, ...range]));
      setSelected(next);
    } else {
      const next = selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name];
      setSelected(next);
    }
    lastIdx = idx;
  };

  // Other columns (not being transposed) — first one becomes the synthetic
  // "id" column in the preview header.
  const otherCols = $derived(colNames.filter(Boolean).filter((n) => !transpose.from.includes(n)));
  const previewIdCol = $derived(otherCols[0] || "id");
  const previewFrom = $derived(transpose.from.length ? transpose.from : ["col A", "col B"]);
  const previewKey = $derived(transpose.toKey || "key");
  const previewVal = $derived(transpose.toValue || "value");
  const previewRows: [string, number, number][] = [
    ["A", 100, 60],
    ["B", 50, 80],
  ];
</script>

<div class="ed-tp-card">
  <div class="ed-tp-card-head">
    <span class="ed-tp-card-idx">#{i + 1}</span>
    <span class="ed-tp-card-title">
      {transpose.toKey || "key"}<span class="ed-tp-card-slash">/</span>{transpose.toValue ||
        "value"}
    </span>
    <button type="button" class="ed-tp-card-del" onclick={() => dataStore.removeTranspose(i)}>
      Delete
    </button>
  </div>

  <div class="ed-tp-step">
    <div class="ed-tp-step-num">1</div>
    <div class="ed-tp-step-body">
      <div class="ed-tp-step-lbl">Pick the columns to flatten</div>
      <div class="ed-tp-step-hint">
        Their headers will become row values; their cells become a single value column.
      </div>

      <div class="ed-tp-chipgroup">
        {#if colNames.length > 0}
          <div class="ed-tp-chip-toolbar">
            <span class="ed-tp-chip-count">
              <strong>{transpose.from.length}</strong> of {colNames.length} selected
            </span>
            <button
              type="button"
              class="ed-tp-chip-act"
              onclick={() => setSelected(allSelected ? [] : colNames.slice())}
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
            {#if anySelected && !allSelected}
              <button type="button" class="ed-tp-chip-act" onclick={() => setSelected([])}>
                Clear
              </button>
            {/if}
          </div>
        {/if}

        {#if showFilter}
          <input
            class="ed-tp-chip-filter"
            id="{idPrefix}transpose-filter"
            type="text"
            placeholder="Filter {colNames.length} columns…"
            bind:value={filter}
          />
        {/if}

        <div class="ed-tp-chiprow">
          {#if colNames.length === 0}
            <span class="ed-tp-chip-empty">No columns in this dataset yet.</span>
          {/if}
          {#each visibleChips as chip (chip.name)}
            {@const isSel = transpose.from.includes(chip.name)}
            <button
              type="button"
              class="ed-tp-chip"
              class:is-on={isSel}
              onclick={(e) => handleChipClick(e, chip.idx, chip.name)}
              aria-pressed={isSel}
              title={chip.name}
            >
              <span class="ed-tp-chip-box" aria-hidden="true">{isSel ? "✓" : ""}</span>
              <span class="ed-tp-chip-name">{chip.name}</span>
            </button>
          {/each}
          {#if filterText && visibleChips.length === 0}
            <span class="ed-tp-chip-empty">No columns match “{filter}”.</span>
          {/if}
        </div>

        {#if colNames.length > 1}
          <div class="ed-tp-chip-tip">
            <kbd class="ed-tp-kbd">Shift</kbd>
            <span>+ click to select a range</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="ed-tp-step">
    <div class="ed-tp-step-num">2</div>
    <div class="ed-tp-step-body">
      <div class="ed-tp-step-lbl">Name the new label column</div>
      <div class="ed-tp-step-hint">
        Holds the old column names{#if transpose.from.length > 0}
          — {#each transpose.from as f, idx (f)}{#if idx > 0},
            {/if}<code class="ed-tp-codename">{f}</code>{/each}{/if}.
      </div>
      <div class="ed-tp-pair">
        <input
          id="{idPrefix}transpose-keys"
          type="text"
          placeholder="e.g. year"
          value={transpose.toKey}
          onchange={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
          onkeyup={(e) => dataStore.setTransposeToKey(i, e.currentTarget.value)}
        />
        <select
          id="{idPrefix}transpose-key-type"
          aria-label="Label column type"
          value={transpose.keyType}
          onchange={(e) => dataStore.setTransposeKeyType(i, e.currentTarget.value)}
        >
          {#each TP_TYPES as type (type)}
            <option>{type}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="ed-tp-step">
    <div class="ed-tp-step-num">3</div>
    <div class="ed-tp-step-body">
      <div class="ed-tp-step-lbl">Name the new value column</div>
      <div class="ed-tp-step-hint">Holds the numbers (or text) that lived in those cells.</div>
      <div class="ed-tp-pair">
        <input
          id="{idPrefix}transpose-values"
          type="text"
          placeholder="e.g. population"
          value={transpose.toValue}
          onchange={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
          onkeyup={(e) => dataStore.setTransposeToValue(i, e.currentTarget.value)}
        />
        <select
          id="{idPrefix}transpose-value-type"
          aria-label="Value column type"
          value={transpose.valueType}
          onchange={(e) => dataStore.setTransposeValueType(i, e.currentTarget.value)}
        >
          {#each TP_TYPES as type (type)}
            <option>{type}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="ed-tp-preview" aria-label="Before / after preview">
    <div class="ed-tp-prev-side">
      <div class="ed-tp-prev-cap">Before — wide</div>
      <table class="ed-tp-prev-tbl">
        <thead>
          <tr>
            <th>{previewIdCol}</th>
            {#each previewFrom as f (f)}
              <th class="hl">{f}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each previewRows as r, ri (ri)}
            <tr>
              <td>{r[0]}</td>
              {#each previewFrom as _f, j (j)}
                <td class="hl-cell">{r[j + 1] ?? "…"}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="ed-tp-prev-arrow" aria-hidden="true">→</div>
    <div class="ed-tp-prev-side">
      <div class="ed-tp-prev-cap">After — long</div>
      <table class="ed-tp-prev-tbl">
        <thead>
          <tr>
            <th>{previewIdCol}</th>
            <th class="hl">{previewKey}</th>
            <th class="hl">{previewVal}</th>
          </tr>
        </thead>
        <tbody>
          {#each previewRows as r, ri (ri)}
            {#each previewFrom as f, j (`${ri}-${j}`)}
              <tr>
                <td>{r[0]}</td>
                <td class="hl">{f}</td>
                <td class="hl-cell">{r[j + 1] ?? "…"}</td>
              </tr>
            {/each}
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .ed-tp-card {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--bg-base);
    margin-bottom: 10px;
    overflow: hidden;
  }
  .ed-tp-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--bg-sunken);
    border-bottom: 1px solid var(--border-subtle);
  }
  .ed-tp-card-idx {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--fg-tertiary);
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .ed-tp-card-title {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--fg-primary);
    letter-spacing: 0.01em;
  }
  .ed-tp-card-slash {
    color: var(--fg-tertiary);
    font-weight: 400;
    padding: 0 2px;
  }
  button.ed-tp-card-del {
    height: 24px;
    padding: 0 8px;
    font-size: 0.78rem;
  }

  .ed-tp-step {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: 10px;
    padding: 12px 12px 12px 10px;
    border-bottom: 1px dashed var(--border-subtle);
  }
  .ed-tp-step:last-of-type {
    border-bottom: 1px solid var(--border-subtle);
  }
  .ed-tp-step-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent-primary);
    color: var(--color-warm-50);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
  }
  .ed-tp-step-body {
    min-width: 0;
  }
  .ed-tp-step-lbl {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--fg-primary);
    margin-bottom: 2px;
  }
  .ed-tp-step-hint {
    font-size: 0.78rem;
    color: var(--fg-secondary);
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .ed-tp-codename {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    background: var(--bg-sunken);
    padding: 1px 5px;
    border-radius: 3px;
    color: var(--fg-primary);
    letter-spacing: 0.02em;
  }
  .ed-tp-pair {
    display: grid;
    grid-template-columns: 1fr 110px;
    gap: 6px;
  }
  .ed-tp-pair input,
  .ed-tp-pair select {
    width: 100%;
    box-sizing: border-box;
  }

  .ed-tp-chipgroup {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ed-tp-chip-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--fg-secondary);
  }
  .ed-tp-chip-count strong {
    color: var(--fg-primary);
    font-family: var(--font-mono);
    font-weight: 600;
    margin-right: 1px;
  }
  button.ed-tp-chip-act {
    height: 22px;
    padding: 0 8px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--fg-secondary);
    cursor: pointer;
  }
  button.ed-tp-chip-act:hover {
    background: var(--bg-sunken);
    color: var(--fg-primary);
  }
  input.ed-tp-chip-filter {
    height: 26px;
    font-size: 0.82rem;
    background: var(--bg-base);
  }
  .ed-tp-chiprow {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    max-height: 168px;
    overflow-y: auto;
    padding: 2px;
    margin: -2px;
  }
  .ed-tp-chip-empty {
    font-size: 0.78rem;
    color: var(--fg-tertiary);
    font-style: italic;
    padding: 4px 2px;
  }
  .ed-tp-chip-tip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--fg-tertiary);
    margin-top: 2px;
  }
  .ed-tp-kbd {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    background: var(--bg-sunken);
    border: 1px solid var(--border-default);
    border-bottom-width: 2px;
    border-radius: 3px;
    padding: 1px 5px;
    color: var(--fg-primary);
    line-height: 1;
  }
  button.ed-tp-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 9px 0 6px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--fg-secondary);
    cursor: pointer;
    user-select: none;
    transition:
      background var(--duration-micro) var(--ease-standard),
      border-color var(--duration-micro) var(--ease-standard),
      color var(--duration-micro) var(--ease-standard);
  }
  button.ed-tp-chip:hover {
    border-color: var(--fg-secondary);
    color: var(--fg-primary);
  }
  button.ed-tp-chip.is-on {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--color-warm-50);
  }
  .ed-tp-chip-box {
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background: var(--bg-base);
    color: var(--accent-primary);
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  button.ed-tp-chip.is-on .ed-tp-chip-box {
    background: var(--color-warm-50);
  }

  .ed-tp-preview {
    display: grid;
    grid-template-columns: 1fr 16px 1fr;
    gap: 6px;
    align-items: stretch;
    padding: 12px;
    background: var(--bg-sunken);
    border-top: 1px solid var(--border-subtle);
  }
  .ed-tp-prev-side {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .ed-tp-prev-cap {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-tertiary);
  }
  .ed-tp-prev-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 1rem;
    color: var(--fg-tertiary);
    padding-top: 18px;
  }
  .ed-tp-prev-tbl {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    overflow: hidden;
    table-layout: fixed;
  }
  .ed-tp-prev-tbl th,
  .ed-tp-prev-tbl td {
    padding: 3px 5px;
    text-align: left;
    border-bottom: 1px solid var(--border-subtle);
    color: var(--fg-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ed-tp-prev-tbl th {
    background: var(--bg-base);
    font-weight: 600;
    color: var(--fg-secondary);
    font-size: 0.66rem;
  }
  .ed-tp-prev-tbl tr:last-child td {
    border-bottom: 0;
  }
  .ed-tp-prev-tbl th.hl {
    background: var(--accent-primary-subtle);
    color: var(--accent-primary);
  }
  .ed-tp-prev-tbl td.hl {
    background: var(--accent-primary-subtle);
    color: var(--accent-primary);
    font-weight: 600;
  }
  .ed-tp-prev-tbl td.hl-cell {
    background: color-mix(in oklch, var(--accent-primary-subtle) 50%, transparent);
  }
</style>
