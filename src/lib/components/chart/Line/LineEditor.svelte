<script lang="ts">
  import LineStyleEditor from "./LineStyleEditor.svelte";

  import { type Root } from "$lib/chart";
  import { db } from "$lib/chartStore";
  import type { DSVParsedArray } from "d3-dsv";
  import AxisEditor from "../AxisEditor.svelte";
  import { formatData } from "./data";
  import { orDefault } from "$lib/utils";

  export let spec: Root;
  export let chart: ReturnType<typeof db.chart>;
  export let dbLine: ReturnType<ReturnType<typeof db.chart>["line"]>;
  export let chartData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: DSVParsedArray<any>;
  };

  $: dataSet = spec.data.sets.find((set) => set.id == $dbLine.dataSet);

  $: values = formatData($dbLine, chartData);
  $: columns = [
    ...orDefault(dataSet?.rows, []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toKey, type: e.type })), []),
    ...orDefault(dataSet?.transpose?.map(e => ({ key: e.toValue, type: e.type })), []),
  ];

  $: unspecifiecKeys = values
    .filter((v) => !$dbLine.style.byKey.find((s) => s.k == v.key))
    .map((v) => v.key);

  $: xScaleIndex = spec.chart.scales.findIndex(
    (s) => s.name == $dbLine.x.scale,
  );
  $: xScale = orDefault(spec.chart.scales[xScaleIndex], {
      dataRange: [0, 1],
      name: "",
      dataKey: "",
      type: ""
  });
  $: yScaleIndex = spec.chart.scales.findIndex(
    (s) => s.name == $dbLine.y.scale,
  );
  $: yScale = orDefault(spec.chart.scales[yScaleIndex], {
      dataRange: [0, 1],
      name: "",
      dataKey: "",
      type: ""
  });
  $: chartColors = $dbLine.style.byKey.map((s) => s.color);
</script>

<p>
  <label>
    Data set:
    <select
      value={$dbLine.dataSet}
      on:change={(e) => dbLine.setDataSet(e.currentTarget.value)}
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
        on:change={(e) => dbLine.setXKey(e.currentTarget.value)}
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
        on:change={(e) => dbLine.setYKey(e.currentTarget.value)}
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
        on:change={(e) => dbLine.setCategoriesKey(e.currentTarget.value)}
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
        on:keyup={(e) =>
          chart.setScaleFrom(
            xScaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        on:change={(e) =>
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
        on:keyup={(e) =>
          chart.setScaleTo(xScaleIndex, Number.parseInt(e.currentTarget.value))}
        on:change={(e) =>
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
        on:keyup={(e) =>
          chart.setScaleFrom(
            yScaleIndex,
            Number.parseInt(e.currentTarget.value),
          )}
        on:change={(e) =>
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
        on:keyup={(e) =>
          chart.setScaleTo(yScaleIndex, Number.parseInt(e.currentTarget.value))}
        on:change={(e) =>
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
      on:change={(e) => dbLine.setFill(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Stack:
    <input
      bind:checked={$dbLine.stack}
      on:change={(e) => dbLine.setStack(e.currentTarget.checked)}
      type="checkbox"
    />
  </label>
</p>
<p>
  <label>
    Height is
    <input
      value={$dbLine.heightRatio*100}
      on:change={(e) => dbLine.setHeightRatio(Number.parseFloat(e.currentTarget.value)/100)}
      type="number"
      style:width="50px"
    />
    % of width
  </label>
</p>

<p>Line style</p>
<LineStyleEditor style={dbLine.defaultLineStyle()} {chartColors} {values}
></LineStyleEditor>
{#each $dbLine.style.byKey as _style, i}
  <LineStyleEditor style={dbLine.lineStyle(i)} {chartColors} {unspecifiecKeys} {values}
  ></LineStyleEditor>
{/each}
<button on:click={() => dbLine.addLineStyle($dbLine.style.byKey.length)}
  >+</button
>
<br />

<b>X axis</b>
<AxisEditor conf={dbLine.xAxis} />

<b>Y axis</b>
<AxisEditor conf={dbLine.yAxis} />
