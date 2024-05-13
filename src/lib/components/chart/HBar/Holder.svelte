<script lang="ts">
  import type { Root, HBar as hBarType } from "$lib/chart";
  import { AxisRepeatMode } from "$lib/chart";
  import { group } from "$lib/utils";
  import HBar from "./HBar.svelte";

  export let chartSpec: Root;
  export let componentSpec: hBarType;
  export let data: {
    [key: string]: any[];
  };
  export let chartWidth: number;

  $: groups = group(
    componentSpec.repeat,
    data[componentSpec.dataSet],
    (k, d) => ({ k, d }),
  );

  $: showAxis = (type: AxisRepeatMode, i: number) => {
    if (type == AxisRepeatMode.ALL) return true;
    else if (type == AxisRepeatMode.FIRST && i == 0) return true;
    else if (type == AxisRepeatMode.LAST && i == group.length - 1) return true;
    return false;
  };
</script>

{#each groups as { k, d }, i}
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
    showAxisLabels={showAxis(componentSpec.axis.repeat, i)}
  />
{/each}
