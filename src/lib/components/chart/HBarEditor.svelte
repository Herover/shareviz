<script lang="ts">
  import type { Chart } from "$lib/chart";
  import type { db } from "$lib/chartStore";

  export let chart: Chart;
  export let dbHBar: ReturnType<ReturnType<typeof db.chart>["hBar"]>;
</script>

<p>
  Label width: <input
    value={chart.hBar.labelWidth}
    on:keyup={(e) => dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
    on:change={(e) => dbHBar.setLabelWidth(Number.parseInt(e.currentTarget.value))}
    type="number"
  />
</p>
<p>
  Categories from: <input
    value={chart.hBar.categories}
    on:keyup={(e) => dbHBar.setCategories(e.currentTarget.value)}
  />
</p>
<p>
  Sub categories from: <input
    value={chart.hBar.subCategories}
    on:keyup={(e) => dbHBar.setSubCategories(e.currentTarget.value)}
  />
</p>
<p>
  Values from: <input
    value={chart.hBar.value}
    on:keyup={(e) => dbHBar.setValue(e.currentTarget.value)}
  />
</p>
