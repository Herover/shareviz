<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
    import type { RangeElement } from ".";
  import type { EditorComponentProps } from "../chartComponents";

  let { spec, chartSpec, chartData, index, connection, id, store }: EditorComponentProps<RangeElement> = $props();

  $inspect(chartData)

  const setDataSet = (v: string) => store.submitOp([
    "dataSet",
    {
      r: 1,
      i: v
    },
  ]);
  const setRepeat = (v: string) => store.submitOp([
    "repeat",
    {
      r: 1,
      i: v
    },
  ]);
  const setCategories = (v: string) => store.submitOp([
    "categories",
    {
      r: 1,
      i: v
    },
  ]);
  const setPointLabel = (v: string) => store.submitOp([
    "pointLabel",
    {
      r: 1,
      i: v
    },
  ]);
  const setPointValue = (v: string) => store.submitOp([
    "pointValue",
    {
      r: 1,
      i: v
    },
  ]);
</script>

<h3 class="editor-sub-section">General</h3>

<div class="box">
  <div class="w-025 editor-explain-box">
    <span class="editor-column-label">Data set</span>
  </div>
  <div class="w-075 p-top-1">
    <select
      value={chartSpec.dataSet}
      onchange={(e) => setDataSet(e.currentTarget.value)}
    >
      <option></option>
      {#each spec.data.sets as set (set.id)}
        <option value={set.id}>{set.name}</option>
      {/each}
    </select>
  </div>
</div>

{#if chartSpec.dataSet}
  <p>
    <label class="editor-column-label">
      Repeat for every:
      <select
        value={chartSpec.repeat}
        onchange={(e) => setRepeat(e.currentTarget.value)}
      >
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

  <p>
    <label class="editor-column-label">
      Line key:
      <select
        value={chartSpec.categories}
        onchange={(e) => setCategories(e.currentTarget.value)}
      >
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

  <p>
    <label class="editor-column-label">
      Point values:
      <select
        value={chartSpec.pointValue}
        onchange={(e) => setPointValue(e.currentTarget.value)}
      >
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

  <p>
    <label class="editor-column-label">
      Point labels:
      <select
        value={chartSpec.pointLabel}
        onchange={(e) => setPointLabel(e.currentTarget.value)}
      >
        <option></option>
        {#each chartData[chartSpec.dataSet].rows as row (row.key)}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>

{/if}