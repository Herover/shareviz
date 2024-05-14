<script lang="ts">
  import type { Root, HBar as hBarType } from "$lib/chart";
  import { AxisRepeatMode } from "$lib/chart";
  import { group } from "$lib/utils";
  import HBar from "./HBar.svelte";
  import { formatData } from "./data";

  export let chartSpec: Root;
  export let componentSpec: hBarType;
  export let data: {
    [key: string]: any[];
  };
  export let chartWidth: number;

  $: groups = formatData(componentSpec, data);

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
    values={d}
    label={k}
    showLegend={i == 0}
    showAxisLabels={showAxis(componentSpec.axis.repeat, i)}
  />
{/each}
