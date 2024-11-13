<script lang="ts">
  import { type Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { orDefault } from "$lib/utils";
  import LinesEditor from "./LinesEditor.svelte";

  interface Props {
    spec: Root;
    chart: ReturnType<typeof db.chart>;
    dbLine: ReturnType<ReturnType<typeof db.chart>["line"]>;
    chartData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: DSVParsedArray<any>;
  };
    index: number;
  }

  let {
    spec,
    chart,
    dbLine,
    chartData,
    index
  }: Props = $props();

  let dataSet = $derived(spec.data.sets.find((set) => set.id == $dbLine.dataSet));

  let values = $derived(formatData($dbLine, chartData));
  let columns = $derived([
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toKey, type: e.keyType })), []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toValue, type: e.valueType })), []),
    ...orDefault(dataSet?.rows, []),
  ]);

  let xScaleIndex = $derived(spec.chart.scales.findIndex(
    (s) => s.name == $dbLine.x.scale,
  ));
  let xScale = $derived(orDefault(spec.chart.scales[xScaleIndex], {
      dataRange: [0, 1],
      name: "",
      dataKey: "",
      type: ""
  }));
  let yScaleIndex = $derived(spec.chart.scales.findIndex(
    (s) => s.name == $dbLine.y.scale,
  ));
  let yScale = $derived(orDefault(spec.chart.scales[yScaleIndex], {
      dataRange: [0, 1],
      name: "",
      dataKey: "",
      type: ""
  }));
  let chartColors = $derived($dbLine.style.byKey.map((s) => s.color));
</script>

<p>
  <label>
    Data set:
    <select
      value={$dbLine.dataSet}
      onchange={(e) => dbLine.setDataSet(e.currentTarget.value)}
    >
      <option>{""}</option>
      {#each spec.data.sets as set}
        <option value={set.id}>{set.name}</option>
      {/each}
    </select>
  </label>
</p>

{#if dataSet}
  <p>
    <label>
      X values from:
      <select
        value={$dbLine.x.key}
        onchange={(e) => dbLine.setXKey(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label>
      Y values from:
      <select
        value={$dbLine.y.key}
        onchange={(e) => dbLine.setYKey(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <label>
      Categories from:
      <select
        value={$dbLine.categories}
        onchange={(e) => dbLine.setCategoriesKey(e.currentTarget.value)}
      >
        <option>{""}</option>
        {#each columns as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
{/if}
<p>
  {#if xScale.dataRange}
    <label
      >X scale from:
      <input
        value={xScale.dataRange[0]}
        onkeyup={(e) =>
          chart.setScaleFrom(
            xScaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        onchange={(e) =>
          chart.setScaleFrom(
            xScaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        type="number"
        style="width: 90px"
      />
    </label>
    <label>
      to
      <input
        value={xScale.dataRange[1]}
        onkeyup={(e) =>
          chart.setScaleTo(xScaleIndex, Number.parseInt(e.currentTarget.value))}
        onchange={(e) =>
          chart.setScaleTo(xScaleIndex, Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 90px"
      />
    </label>
  {/if}
</p>
<p>
  {#if yScale.dataRange}
    <label
      >Y scale from:
      <input
        value={yScale.dataRange[0]}
        onkeyup={(e) =>
          chart.setScaleFrom(
            yScaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        onchange={(e) =>
          chart.setScaleFrom(
            yScaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        type="number"
        style="width: 90px"
      />
    </label>
    <label>
      to
      <input
        value={yScale.dataRange[1]}
        onkeyup={(e) =>
          chart.setScaleTo(yScaleIndex, Number.parseInt(e.currentTarget.value))}
        onchange={(e) =>
          chart.setScaleTo(yScaleIndex, Number.parseInt(e.currentTarget.value))}
        type="number"
        style="width: 90px"
      />
    </label>
  {/if}
</p>
<p>
  <label>
    Fill:
    <input
      bind:checked={$dbLine.fill}
      onchange={(e) => dbLine.setFill(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Stack:
    <input
      bind:checked={$dbLine.stack}
      onchange={(e) => dbLine.setStack(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Height is
    <input
      value={$dbLine.heightRatio*100}
      onchange={(e) => dbLine.setHeightRatio(Number.parseFloat(e.currentTarget.value)/100)}
      type="number"
      style:width="50px"
    />
    % of width
  </label>
</p>

<p>Line style</p>
<LinesEditor
  {chartColors}
  {values}
  lineSpec={dbLine}
  {index}
/>
<br />

<b>X axis</b>
<AxisEditor conf={dbLine.xAxis} />

<b>Y axis</b>
<AxisEditor conf={dbLine.yAxis} />
