<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { type LineRepeatSettingsKey, type Root } from "$lib/chart";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { orDefault } from "$lib/utils";
  import LinesEditor from "./LinesEditor.svelte";
  import CategoryList from "../CategoryList.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";
  import { LineStore } from "$lib/chartStores/line.svelte";
  import type { ComputedData } from "$lib/data";

  interface Props {
    spec: Root;
    chartData: ComputedData;
    index: number;
    id: string;
    connection: ShareDBConnection;
  }

  let { spec, chartData, index, connection, id }: Props = $props();

  let lineStore = new LineStore(connection, id);

  let dataSet = $derived(spec.data.sets.find((set) => set.id == lineStore.data.dataSet));

  let values = $derived(lineStore.data ? formatData(lineStore.data, chartData) : []);
  let columns = $derived(
    typeof dataSet != "undefined"
      ? [
          ...orDefault(
            dataSet.transpose?.map((e) => ({ key: e.toKey, type: e.keyType })),
            [],
          ),
          ...orDefault(
            dataSet.transpose?.map((e) => ({ key: e.toValue, type: e.valueType })),
            [],
          ),
          ...orDefault(dataSet?.rows, []),
        ]
      : [],
  );

  let chartColors = $derived(lineStore.data.style.byKey.map((s) => s.color));

  const updateRepeatSettings = () => {
    if (typeof lineStore.data == "undefined") {
      return;
    }
    const data = lineStore.data;
    if (typeof lineStore.data?.repeatSettings == "undefined") {
      lineStore.updateRepeatSettings(
        values.map((e) => e.k),
        undefined,
      );
    } else {
      values
        .map((e) => e.k)
        .filter((k) => data.repeatSettings.byKey.findIndex((e) => e.k == k) == -1)
        .forEach((k) => lineStore.addRepeatSetting(data.repeatSettings.byKey.length, k));
      // FIXME
      // chartSpec.removeRepeatSettings(
      //   lineStore.data.repeatSettings.byKey
      //     .map((e, i) => ({ i, e }))
      //     .filter((e) => values.findIndex((v) => v.k == e.e.k) == -1)
      //     .map((e) => e.i),
      // );
    }
  };

  let selectedIndexes: number[] = $state([]);
  const setRepeatedLabel = (value: string) => {
    selectedIndexes.forEach((i) => lineStore.repeatSetting(i).setLabel(value));
  };
  const setRepeatedOwnChart = (value: boolean) => {
    selectedIndexes.forEach((i) => lineStore.repeatSetting(i).setOwnChart(value));
  };
  const setRepeatedAllCharts = (value: boolean) => {
    selectedIndexes.forEach((i) => lineStore.repeatSetting(i).setAllCharts(value));
  };
</script>

<h3 class="editor-sub-section">General</h3>

<div class="editor-row">
  <div class="editor-column-label">
    <span>Data set</span>
  </div>
  <div>
    <select
      value={lineStore.data.dataSet}
      onchange={(e) => lineStore.setDataSet(e.currentTarget.value)}
    >
      <option></option>
      {#each spec.data.sets as set (set.id)}
        <option value={set.id}>{set.name}</option>
      {/each}
    </select>
  </div>
</div>

{#if dataSet}
  <div class="editor-row">
    <div class="editor-column-label">
      <span>X values from:</span>
    </div>
    <div>
      <select
        value={lineStore.data.x.key}
        onchange={(e) => lineStore.setXKey(e.currentTarget.value)}
      >
        <option></option>
        {#each columns as row, i (i)}
          <option>{row.key}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Y values from:</span>
    </div>
    <div>
      <select
        value={lineStore.data.y.key}
        onchange={(e) => lineStore.setYKey(e.currentTarget.value)}
      >
        <option></option>
        {#each columns as row, i (i)}
          <option>{row.key}</option>
        {/each}
      </select>
    </div>
  </div>

  <h3 class="editor-sub-section">Categories</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Categories from:</span>
    </div>
    <div>
      <select
        value={lineStore.data.categories}
        onchange={(e) => lineStore.setCategoriesKey(e.currentTarget.value)}
      >
        <option></option>
        {#each columns as row, i (i)}
          <option>{row.key}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Height</span> <span class="editor-label-hint">(% of width)</span>
    </div>
    <div>
      <input
        value={lineStore.data.heightRatio * 100}
        onchange={(e) => lineStore.setHeightRatio(Number.parseFloat(e.currentTarget.value) / 100)}
        type="number"
      />
    </div>
  </div>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Fill</span>
    </div>
    <div>
      <input
        bind:checked={lineStore.data.fill}
        onchange={(e) => lineStore.setFill(e.currentTarget.checked)}
        type="checkbox"
      />
    </div>
  </div>

  {#if lineStore.data.categories}
    <div class="editor-row">
      <div class="editor-column-label">
        <span>Stack</span>
      </div>
      <div>
        <input
          bind:checked={lineStore.data.stack}
          onchange={(e) => lineStore.setStack(e.currentTarget.checked)}
          type="checkbox"
        />
      </div>
    </div>

    <span class="editor-column-label">Line style</span>
    <LinesEditor {chartColors} {values} {index} {lineStore} />
  {/if}

  <h3 class="editor-sub-section">Small multiples</h3>

  <div class="editor-row">
    <div class="editor-column-label">
      <span>Repeat for every</span>
    </div>
    <div>
      <select
        value={lineStore.data.repeat}
        onchange={(e) => {
          lineStore.setRepeatKey(e.currentTarget.value);
          updateRepeatSettings();
        }}
      >
        <option></option>
        {#each columns as row, i (i)}
          <option>{row.key}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if lineStore.data.repeat != ""}
    <div class="editor-row">
      <div class="editor-column-label">
        <span>Columns</span>
      </div>
      <div>
        <input
          value={lineStore.data.repeatColumns}
          onchange={(e) => lineStore.setRepeatColumns(Number.parseInt(e.currentTarget.value))}
          onkeyup={(e) => lineStore.setRepeatColumns(Number.parseInt(e.currentTarget.value))}
          type="number"
        />
      </div>
    </div>

    {#snippet repeatTitle(d: LineRepeatSettingsKey)}
      {d.k}
    {/snippet}
    <CategoryList
      values={(lineStore.data.repeatSettings?.byKey || []).map((e) => ({ k: e.k, d: e }))}
      onSelectedChanged={(selected, indexes) => (selectedIndexes = indexes)}
      searchFn={(str, d) => d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase())}
      title={repeatTitle}
      moveUp={(_k, i) => lineStore.moveRepeatUp(i)}
      moveDown={(_k, i) => lineStore.moveRepeatDown(i)}
    />

    {#if selectedIndexes.length != 0}
      <div class="editor-row">
        <div class="editor-column-label">
          <span>Label</span>
        </div>
        <div>
          <input
            value={selectedIndexes.length == 1
              ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]].title ||
                lineStore.data.repeatSettings.byKey[selectedIndexes[0]].k
              : ""}
            onkeyup={(e) => setRepeatedLabel(e.currentTarget.value)}
            type="text"
          />
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-column-label">
          <span>Has own chart</span>
        </div>
        <div>
          <input
            type="checkbox"
            checked={selectedIndexes.length == 1
              ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]].ownChart
              : false}
            onchange={(e) => setRepeatedOwnChart(e.currentTarget.checked)}
          />
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-column-label">
          <span>Show on all charts</span>
        </div>
        <div>
          <input
            type="checkbox"
            checked={selectedIndexes.length == 1
              ? lineStore.data.repeatSettings.byKey[selectedIndexes[0]].allCharts
              : false}
            onchange={(e) => setRepeatedAllCharts(e.currentTarget.checked)}
          />
        </div>
      </div>
    {/if}
  {/if}
{/if}

<h3 class="editor-sub-section">Horizontal axis</h3>
<AxisEditor conf={lineStore.xAxis()} />

<h3 class="editor-sub-section">Vertical axis</h3>
<AxisEditor conf={lineStore.yAxis()} />
