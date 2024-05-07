<script lang="ts">
  import type { Root, HBar as hBarType } from "$lib/chart";
  import { group } from "$lib/utils";
  import HBar from "./HBar.svelte";

  export let chartSpec: Root;
  export let componentSpec: hBarType;
  export let data: {
    [key: string]: any[];
  };
  export let chartWidth: number;
</script>

{#each group( componentSpec.repeat, data[componentSpec.dataSet], (k, d) => ({ k, d }), ) as { k, d }, i}
  <HBar
    {chartSpec}
    hBarSpec={componentSpec}
    labelWidth={componentSpec.labelWidth}
    valueWidth={chartWidth -
      chartSpec.style.marginLeft -
      chartSpec.style.marginRight -
      componentSpec.labelWidth}
    values={group(componentSpec.categories, d, (k, g) => ({
      label: k,
      value: group(componentSpec.subCategories, g, (kk, gg) => {
        let sum = gg.reduce((acc, d) => acc + d[componentSpec.value], 0);
        return {
          label: kk,
          value: sum,
        };
      }),
    }))}
    label={k}
    showLegend={i == 0}
  />
{/each}
