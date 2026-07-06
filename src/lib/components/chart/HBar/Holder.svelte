<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { max } from "d3-array";
  import type { HBar as hBarType } from "$lib/chart";
  import { AxisRepeatMode } from "$lib/chart";
  import type { ChartComponentProps } from "../chartComponents";
  import HBar from "./HBar.svelte";
  import { formatData } from "./data";

  let { chartSpec, componentSpec, data, chartWidth }: ChartComponentProps<hBarType> = $props();

  let groups = $derived(formatData(componentSpec, data, componentSpec.colors.byKey));

  // The value scale always starts at zero and ends at the largest (stacked) value
  let maxValue = $derived(
    max(groups, (d) => max(d.d, (dd) => max(dd.value, (ddd) => ddd.to))) ?? 1,
  );
  let domain = $derived(componentSpec.portionSubCategories ? [0, 100] : [0, maxValue]);

  let labelOverflows: number[] = $state([]);
  let labelOverflow = $derived(
    labelOverflows.slice(0, groups.length).reduce((acc, n) => Math.max(acc, n), 0),
  );
  let width = $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);

  let showAxis = $derived((type: AxisRepeatMode, i: number) => {
    if (type == AxisRepeatMode.ALL) return true;
    else if (type == AxisRepeatMode.FIRST && i == 0) return true;
    else if (type == AxisRepeatMode.LAST && i == groups.length - 1) return true;
    return false;
  });
</script>

{#each groups as { k, d }, i (k)}
  <HBar
    {chartSpec}
    hBarSpec={componentSpec}
    labelWidth={componentSpec.labelWidth}
    valueWidth={width - componentSpec.labelWidth - labelOverflow}
    {width}
    {domain}
    values={d}
    label={k}
    showLegend={i == 0}
    showAxisLabels={showAxis(componentSpec.axis.repeat, i)}
    labelOverflow={(n) => (labelOverflows[i] = n)}
  />
{/each}
