<script lang="ts">
  import { type LineRepeatSettingsKey, type Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { orDefault } from "$lib/utils";
  import LinesEditor from "./LinesEditor.svelte";
  import CategoryList from "../CategoryList.svelte";

  interface Props {
    spec: Root;
    chart: ReturnType<typeof db.chart>;
    chartData: {
      [key: string]: DSVParsedArray<any>;
    };
    index: number;
  }

  let { spec, chart, chartData, index }: Props = $props();

  let chartSpec = chart.line(index);

  let dataSet = $derived(spec.data.sets.find((set) => set.id == $chartSpec.dataSet));

  let values = $derived(formatData($chartSpec, chartData));
  let columns = $derived([
    ...orDefault(
      dataSet?.transpose?.map((e) => ({ key: e.toKey, type: e.keyType })),
      [],
    ),
    ...orDefault(
      dataSet?.transpose?.map((e) => ({ key: e.toValue, type: e.valueType })),
      [],
    ),
    ...orDefault(dataSet?.rows, []),
  ]);

  let chartColors = $derived($chartSpec.style.byKey.map((s) => s.color));

  $effect(() => {
    if (typeof $chartSpec.repeatSettings == "undefined") {
      chartSpec.updateRepeatSettings(
        values.map((e) => e.k),
        undefined,
      );
    } else {
      values
        .map((e) => e.k)
        .filter((k) => $chartSpec.repeatSettings.byKey.findIndex((e) => e.k == k) == -1)
        .forEach((k) => chartSpec.addRepeatSetting($chartSpec.repeatSettings.byKey.length, k));
      // FIXME
      // chartSpec.removeRepeatSettings(
      //   $chartSpec.repeatSettings.byKey
      //     .map((e, i) => ({ i, e }))
      //     .filter((e) => values.findIndex((v) => v.k == e.e.k) == -1)
      //     .map((e) => e.i),
      // );
    }
  });

  let selectedIndexes: number[] = $state([]);
  const setRepeatedLabel = (value: string) => {
    selectedIndexes.forEach((i) => chartSpec.repeatSettings(i).setLabel(value));
  };
  const setRepeatedOwnChart = (value: boolean) => {
    selectedIndexes.forEach((i) => chartSpec.repeatSettings(i).setOwnChart(value));
  };
  const setRepeatedAllCharts = (value: boolean) => {
    selectedIndexes.forEach((i) => chartSpec.repeatSettings(i).setAllCharts(value));
  };
</script>

<div class="box">
  <div class="w-025 editor-explain-box p-top-1">
    <span class="editor-column-label">Data set</span>
  </div>
  <div class="w-075 p-top-1">
    <select
      value={$chartSpec.dataSet}
      onchange={(e) => chartSpec.setDataSet(e.currentTarget.value)}
    >
      <option>{""}</option>
      {#each spec.data.sets as set}
        <option value={set.id}>{set.name}</option>
      {/each}
    </select>
  </div>
</div>

{#if dataSet}
  <p>
    <label class="editor-column-label">
      X values from:
      <select value={$chartSpec.x.key} onchange={(e) => chartSpec.setXKey(e.currentTarget.value)}>
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label class="editor-column-label">
      Y values from:
      <select value={$chartSpec.y.key} onchange={(e) => chartSpec.setYKey(e.currentTarget.value)}>
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label class="editor-column-label">
      Categories from:
      <select
        value={$chartSpec.categories}
        onchange={(e) => chartSpec.setCategoriesKey(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  {#if $chartSpec.categories}
    <div class="box">
      <div class="w-025 editor-explain-box">
        <span class="editor-column-label">Stack</span>
      </div>
      <div class="w-075">
        <input
          bind:checked={$chartSpec.stack}
          onchange={(e) => chartSpec.setStack(e.currentTarget.checked)}
          type="checkbox"
        />
      </div>
    </div>
    <br />

    <span class="editor-column-label">Line style</span>
    <LinesEditor {chartColors} {values} lineSpec={chartSpec} {index} />
  {/if}
  <p>
    <label class="editor-column-label">
      Repeat for every:
      <select
        value={$chartSpec.repeat}
        onchange={(e) => chartSpec.setRepeatKey(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  {#if $chartSpec.repeat != ""}
    <div class="box">
      <div class="w-025 editor-explain-box">
        <span class="editor-column-label">Columns</span>
      </div>
      <div class="w-075">
        <input
          value={$chartSpec.repeatColumns}
          onchange={(e) => chartSpec.setRepeatColumns(Number.parseInt(e.currentTarget.value))}
          onkeyup={(e) => chartSpec.setRepeatColumns(Number.parseInt(e.currentTarget.value))}
          type="number"
        />
      </div>
    </div>

    {#snippet repeatTitle(d: LineRepeatSettingsKey)}
      {d.k}
    {/snippet}
    <CategoryList
      values={($chartSpec.repeatSettings?.byKey || []).map((e) => ({ k: e.k, d: e }))}
      onSelectedChanged={(selected, indexes) => (selectedIndexes = indexes)}
      searchFn={(str, d) => d.k.toLocaleLowerCase().includes(str.toLocaleLowerCase())}
      title={repeatTitle}
      moveUp={(_k, i) => chartSpec.moveRepeatUp(i)}
      moveDown={(_k, i) => chartSpec.moveRepeatDown(i)}
    />
    {#if selectedIndexes.length != 0}
      <div class="box">
        <div class="w-025 p-top-1">Label</div>
        <div class="w-075 p-top-1">
          <input
            value={selectedIndexes.length == 1
              ? $chartSpec.repeatSettings.byKey[selectedIndexes[0]].title ||
                $chartSpec.repeatSettings.byKey[selectedIndexes[0]].k
              : ""}
            onkeyup={(e) => setRepeatedLabel(e.currentTarget.value)}
          />
        </div>
      </div>
      <div class="box">
        <div class="w-025 p-top-1">Display</div>
        <div class="w-075 p-top-1">
          <label>
            <input
              type="checkbox"
              checked={selectedIndexes.length == 1
                ? $chartSpec.repeatSettings.byKey[selectedIndexes[0]].ownChart
                : false}
              onchange={(e) => setRepeatedOwnChart(e.currentTarget.checked)}
            />
            Has own chart
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={selectedIndexes.length == 1
                ? $chartSpec.repeatSettings.byKey[selectedIndexes[0]].allCharts
                : false}
              onchange={(e) => setRepeatedAllCharts(e.currentTarget.checked)}
            />
            Show on all charts
          </label>
        </div>
      </div>
    {/if}
  {/if}
{/if}
<p>
  <label>
    Fill:
    <input
      bind:checked={$chartSpec.fill}
      onchange={(e) => chartSpec.setFill(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Height is
    <input
      value={$chartSpec.heightRatio * 100}
      onchange={(e) => chartSpec.setHeightRatio(Number.parseFloat(e.currentTarget.value) / 100)}
      type="number"
      style:width="50px"
    />
    % of width
  </label>
</p>

<b>X axis</b>
<AxisEditor conf={chartSpec.xAxis} />

<b>Y axis</b>
<AxisEditor conf={chartSpec.yAxis} />
