<script lang="ts">
  import type { Data, Line, Root, Set } from "$lib/chart";
  import type { db } from "$lib/chartStore";
  import { group } from "$lib/utils";
  import type { DSVParsedArray } from "d3-dsv";

  export let spec: Root;
  export let chart: ReturnType<typeof db.chart>;
  export let dbLine: ReturnType<ReturnType<typeof db.chart>["line"]>;
  export let chartData: {
    [key: string]: DSVParsedArray<any>;
  };

  $: dataSet = spec.data.sets.find((set) => set.id == $dbLine.dataSet);
  $: console.log(dataSet?.rows);

  $: xScaleIndex = spec.chart.scales.findIndex(
    (s) => s.name == $dbLine.x.scale,
  );
  $: xScale = spec.chart.scales[xScaleIndex] || { dataRange: [0, 1] };
  $: yScaleIndex = spec.chart.scales.findIndex(
    (s) => s.name == $dbLine.y.scale,
  );
  $: yScale = spec.chart.scales[yScaleIndex] || { dataRange: [0, 1] };
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
        <option>{set.id}</option>
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
        {#each dataSet.rows as row}
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
        {#each dataSet.rows as row}
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
        {#each dataSet.rows as row}
          <option>{row.key}</option>
        {/each}
      </select>
    </label>
  </p>
{/if}
<p>
  {#if xScale && xScale.dataRange}
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
  {#if yScale && yScale.dataRange}
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
