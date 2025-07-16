<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { Root, HBar as hBarType } from "$lib/chart";
  import { AxisRepeatMode } from "$lib/chart";
  import type { ComputedData } from "$lib/data";
  import { group } from "$lib/utils";
  import HBar from "./HBar.svelte";
  import { formatData } from "./data";

  interface Props {
    chartSpec: Root;
    componentSpec: hBarType;
    data: ComputedData;
    chartWidth: number;
    editor?: boolean;
    index: number;
  }

  let {
    chartSpec,
    componentSpec,
    data,
    chartWidth,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index,
  }: Props = $props();

  let groups = $derived(formatData(componentSpec, data, componentSpec.colors.byKey));

  let labelOverflows: number[] = $state([]);
  let labelOverflow = $derived(
    labelOverflows.slice(0, groups.length).reduce((acc, n) => Math.max(acc, n), 0),
  );
  let width = $derived(chartWidth - chartSpec.style.marginLeft - chartSpec.style.marginRight);

  let showAxis = $derived((type: AxisRepeatMode, i: number) => {
    if (type == AxisRepeatMode.ALL) return true;
    else if (type == AxisRepeatMode.FIRST && i == 0) return true;
    else if (type == AxisRepeatMode.LAST && i == group.length - 1) return true;
    return false;
  });
</script>

{#each groups as { k, d }, i}
  <HBar
    {chartSpec}
    hBarSpec={componentSpec}
    labelWidth={componentSpec.labelWidth}
    valueWidth={width - componentSpec.labelWidth - labelOverflow}
    {width}
    values={d}
    label={k}
    showLegend={i == 0}
    showAxisLabels={showAxis(componentSpec.axis.repeat, i)}
    labelOverflow={(n) => (labelOverflows[i] = n)}
  />
{/each}
