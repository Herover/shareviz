<script lang="ts">
  import type { Root } from "$lib/chart";
  import type { db } from "$lib/chartStore";

  export let spec: Root;
  export let dbHBar: ReturnType<ReturnType<typeof db.chart>["hBar"]>;
</script>

<p>
  Label width: <input
    value={spec.chart.hBar.labelWidth}
    on:keyup={(e) => dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
    on:change={(e) => dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
    type="number"
  />
</p>
<p>
  Categories from:
  <select value={spec.chart.hBar.categories} on:change={(e) => dbHBar.setCategories(e.currentTarget.value)}>
    {#each spec.data.rows as row}
      <option>{row.key}</option>
    {/each}
  </select>
</p>
<p>
  Sub categories from:
  <select value={spec.chart.hBar.subCategories} on:change={(e) => dbHBar.setSubCategories(e.currentTarget.value)}>
    {#each spec.data.rows as row}
      <option>{row.key}</option>
    {/each}
  </select>
</p>
<p>
  Values from:
  <select value={spec.chart.hBar.value} on:change={(e) => dbHBar.setValue(e.currentTarget.value)}>
    {#each spec.data.rows.filter(r => r.type == "number") as row}
      <option>{row.key}</option>
    {/each}
  </select>
</p>
