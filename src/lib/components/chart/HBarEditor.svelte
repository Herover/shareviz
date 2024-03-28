<script lang="ts">
  import type { Root } from "$lib/chart";
  import type { db } from "$lib/chartStore";

  export let spec: Root;
  export let chart: ReturnType<typeof db.chart>;
  export let dbHBar: ReturnType<ReturnType<typeof db.chart>["hBar"]>;

  $: scaleIndex = spec.chart.scales.findIndex(
    (s) => s.dataKey == spec.chart.hBar.value,
  );
  $: scale = spec.chart.scales[scaleIndex];
</script>

<p>
  <label>
    Label width: <input
      value={spec.chart.hBar.labelWidth}
      on:keyup={(e) =>
        dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
      type="number"
    />
  </label>
</p>
<p>
  <label>
    Categories from:
    <select
      value={spec.chart.hBar.categories}
      on:change={(e) => dbHBar.setCategories(e.currentTarget.value)}
    >
      <option>{""}</option>
      {#each spec.data.rows as row}
        <option>{row.key}</option>
      {/each}
    </select>
  </label>
</p>
<p>
  <label>
    Sub categories from:
    <select
      value={spec.chart.hBar.subCategories}
      on:change={(e) => dbHBar.setSubCategories(e.currentTarget.value)}
    >
      <option>{""}</option>
      {#each spec.data.rows as row}
        <option>{row.key}</option>
      {/each}
    </select>
  </label>
</p>
<p>
  <label>
    Values from:
    <select
      value={spec.chart.hBar.value}
      on:change={(e) => dbHBar.setValue(e.currentTarget.value)}
    >
      {#each spec.data.rows.filter((r) => r.type == "number") as row}
        <option>{row.key}</option>
      {/each}
    </select>
  </label>
</p>
<p>
  <label
    >Scale from:
    <input
      value={scale.dataRange[0]}
      on:keyup={(e) =>
        chart.setScaleFrom(scaleIndex, Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        chart.setScaleFrom(scaleIndex, Number.parseInt(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
  <label>
    to
    <input
      value={scale.dataRange[1]}
      on:keyup={(e) =>
        chart.setScaleTo(scaleIndex, Number.parseInt(e.currentTarget.value))}
      on:change={(e) =>
        chart.setScaleTo(scaleIndex, Number.parseInt(e.currentTarget.value))}
      type="number"
      style="width: 90px"
    />
  </label>
</p>
<p>
  <label
    >Repeat for each:
    <select
      value={spec.chart.hBar.repeat}
      on:change={(e) => dbHBar.setRepeat(e.currentTarget.value)}
    >
      <option>{""}</option>
      {#each spec.data.rows as row}
        <option>{row.key}</option>
      {/each}
    </select>
  </label>
</p>
